const axios = require('axios');

class ShopifyService {
  constructor() {
    this.shopDomain = process.env.SHOPIFY_SHOP_DOMAIN;
    this.accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
    this.apiVersion = process.env.SHOPIFY_API_VERSION || '2024-01';
  }

  // Load credentials from DB if not set via env vars
  async loadCredentials() {
    if (this.shopDomain && this.accessToken) return;
    try {
      const Setting = require('../models/Setting');
      const [domainSetting, tokenSetting] = await Promise.all([
        Setting.findOne({ key: 'shopify_store_domain' }),
        Setting.findOne({ key: 'shopify_access_token' }).select('+value'),
      ]);
      if (domainSetting?.value) this.shopDomain = domainSetting.value;
      if (tokenSetting?.value) this.accessToken = tokenSetting.value;
    } catch (_) {}
  }

  get baseUrl() {
    return `https://${this.shopDomain}/admin/api/${this.apiVersion}`;
  }

  get headers() {
    return {
      'X-Shopify-Access-Token': this.accessToken,
      'Content-Type': 'application/json',
    };
  }

  // ── GraphQL ───────────────────────────────────────────────
  async graphql(query, variables = {}) {
    await this.loadCredentials();
    const url = `https://${this.shopDomain}/admin/api/${this.apiVersion}/graphql.json`;
    const { data } = await axios.post(url, { query, variables }, { headers: this.headers });
    if (data.errors) throw new Error(data.errors.map(e => e.message).join(', '));
    return data.data;
  }

  // ── REST ──────────────────────────────────────────────────
  async get(endpoint, params = {}) {
    await this.loadCredentials();
    const { data } = await axios.get(`${this.baseUrl}${endpoint}`, {
      headers: this.headers,
      params,
    });
    return data;
  }

  // ── Fetch all orders ──────────────────────────────────────
  async fetchOrders(since = null) {
    await this.loadCredentials();
    const params = { limit: 250, status: 'any' };
    if (since) params.updated_at_min = since;

    const allOrders = [];
    let url = `${this.baseUrl}/orders.json`;

    while (url) {
      const { data, headers } = await axios.get(url, { headers: this.headers, params });
      allOrders.push(...data.orders);
      // Follow pagination link header
      const linkHeader = headers.link || '';
      const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
      url = nextMatch ? nextMatch[1] : null;
      params = {}; // clear params for subsequent pages
    }

    return allOrders;
  }

  // ── Fetch all products ────────────────────────────────────
  async fetchProducts(since = null) {
    await this.loadCredentials();
    const params = { limit: 250 };
    if (since) params.updated_at_min = since;

    const allProducts = [];
    let url = `${this.baseUrl}/products.json`;

    while (url) {
      const { data, headers } = await axios.get(url, { headers: this.headers, params });
      allProducts.push(...data.products);
      const linkHeader = headers.link || '';
      const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
      url = nextMatch ? nextMatch[1] : null;
      params = {};
    }

    return allProducts;
  }

  // ── Fetch all customers ───────────────────────────────────
  async fetchCustomers(since = null) {
    await this.loadCredentials();
    const params = { limit: 250 };
    if (since) params.updated_at_min = since;

    const allCustomers = [];
    let url = `${this.baseUrl}/customers.json`;

    while (url) {
      const { data, headers } = await axios.get(url, { headers: this.headers, params });
      allCustomers.push(...data.customers);
      const linkHeader = headers.link || '';
      const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
      url = nextMatch ? nextMatch[1] : null;
      params = {};
    }

    return allCustomers;
  }

  // ── Map Shopify order → CRM order format ─────────────────
  mapOrder(shopifyOrder, customerMap = {}) {
    const customerId = customerMap[shopifyOrder.customer?.id];
    return {
      shopifyId: String(shopifyOrder.id),
      orderId: shopifyOrder.name,                              // e.g. #1001
      source: 'Website',
      paymentMethod: this._mapPaymentMethod(shopifyOrder.payment_gateway),
      paymentStatus: this._mapPaymentStatus(shopifyOrder.financial_status),
      status: this._mapFulfillmentStatus(shopifyOrder.fulfillment_status),
      total: parseFloat(shopifyOrder.total_price),
      subtotal: parseFloat(shopifyOrder.subtotal_price),
      discount: parseFloat(shopifyOrder.total_discounts || 0),
      shippingFee: parseFloat(shopifyOrder.total_shipping_price_set?.shop_money?.amount || 0),
      customerSnapshot: {
        name: shopifyOrder.shipping_address
          ? `${shopifyOrder.shipping_address.first_name} ${shopifyOrder.shipping_address.last_name}`.trim()
          : shopifyOrder.customer
            ? `${shopifyOrder.customer.first_name} ${shopifyOrder.customer.last_name}`.trim()
            : 'Guest',
        phone: shopifyOrder.shipping_address?.phone || shopifyOrder.customer?.phone || '',
        city: shopifyOrder.shipping_address?.city || '',
        address: shopifyOrder.shipping_address?.address1 || '',
      },
      items: shopifyOrder.line_items.map(li => ({
        shopifyProductId: String(li.product_id),
        shopifyVariantId: String(li.variant_id),
        name: li.name,
        sku: li.sku || '',
        variant: li.variant_title || '',
        qty: li.quantity,
        salePrice: parseFloat(li.price),
        costPrice: 0, // Shopify doesn't expose cost in orders API
      })),
      notes: shopifyOrder.note || '',
      createdAt: new Date(shopifyOrder.created_at),
      updatedAt: new Date(shopifyOrder.updated_at),
    };
  }

  // ── Map Shopify product → CRM product format ──────────────
  mapProduct(shopifyProduct) {
    const firstVariant = shopifyProduct.variants?.[0] || {};
    return {
      shopifyId: String(shopifyProduct.id),
      name: shopifyProduct.title,
      sku: firstVariant.sku || `SPUNK-${shopifyProduct.id}`,
      description: shopifyProduct.body_html?.replace(/<[^>]*>/g, '') || '',
      category: shopifyProduct.product_type || 'General',
      costPrice: 0,
      salePrice: parseFloat(firstVariant.price || 0),
      stock: shopifyProduct.variants?.reduce((sum, v) => sum + (v.inventory_quantity || 0), 0) || 0,
      supplier: shopifyProduct.vendor || '',
      status: shopifyProduct.status === 'active' ? 'Active' : shopifyProduct.status === 'draft' ? 'Draft' : 'Archived',
      images: shopifyProduct.images?.map(img => img.src) || [],
      variants: shopifyProduct.variants?.map(v => ({
        label: v.title,
        sku: v.sku || '',
        stock: v.inventory_quantity || 0,
        salePrice: parseFloat(v.price || 0),
        costPrice: 0,
      })) || [],
      tags: shopifyProduct.tags ? shopifyProduct.tags.split(', ') : [],
      updatedAt: new Date(shopifyProduct.updated_at),
    };
  }

  // ── Map Shopify customer → CRM customer format ────────────
  mapCustomer(shopifyCustomer) {
    const addr = shopifyCustomer.default_address || {};
    return {
      shopifyId: String(shopifyCustomer.id),
      name: `${shopifyCustomer.first_name || ''} ${shopifyCustomer.last_name || ''}`.trim() || 'Unknown',
      email: shopifyCustomer.email || '',
      phone: shopifyCustomer.phone || addr.phone || '',
      city: addr.city || '',
      address: addr.address1 || '',
      source: 'Website',
      status: shopifyCustomer.state === 'disabled' ? 'Inactive' : 'Active',
      totalOrders: shopifyCustomer.orders_count || 0,
      totalSpent: parseFloat(shopifyCustomer.total_spent || 0),
      notes: shopifyCustomer.note || '',
      tags: shopifyCustomer.tags ? shopifyCustomer.tags.split(', ').filter(Boolean) : [],
      updatedAt: new Date(shopifyCustomer.updated_at),
    };
  }

  // ── Internal mappers ──────────────────────────────────────
  _mapPaymentMethod(gateway) {
    const map = { 'cash_on_delivery': 'COD', 'bank_transfer': 'Bank Transfer', 'jazzcash': 'JazzCash', 'easypaisa': 'EasyPaisa', 'bogus': 'Other' };
    return map[gateway] || 'Other';
  }

  _mapPaymentStatus(status) {
    const map = { paid: 'Paid', pending: 'Pending', refunded: 'Refunded', voided: 'Failed', partially_paid: 'Pending' };
    return map[status] || 'Pending';
  }

  _mapFulfillmentStatus(status) {
    const map = { fulfilled: 'Delivered', partial: 'Processing', null: 'Pending', unfulfilled: 'Pending' };
    return map[status] || 'Pending';
  }
}

module.exports = new ShopifyService();
