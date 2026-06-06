const shopify = require('../services/shopifyService');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Setting = require('../models/Setting');

// ── POST /api/shopify/connect ─────────────────────────────
const connectShopify = async (req, res, next) => {
  try {
    let { storeDomain, accessToken } = req.body;
    if (!storeDomain || !accessToken) {
      return res.status(400).json({ success: false, error: 'storeDomain and accessToken are required' });
    }

    // Normalise domain — strip https:// and trailing slashes
    storeDomain = storeDomain.replace(/^https?:\/\//i, '').replace(/\/$/, '').trim();

    // Test the credentials before saving
    const axios = require('axios');
    const testUrl = `https://${storeDomain}/admin/api/2024-01/shop.json`;
    let shopData;
    try {
      const { data } = await axios.get(testUrl, {
        headers: { 'X-Shopify-Access-Token': accessToken, 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      shopData = data.shop;
    } catch (e) {
      const status = e.response?.status;
      if (status === 401 || status === 403) {
        return res.status(400).json({ success: false, error: 'Invalid access token — check your Shopify API credentials.' });
      }
      if (status === 404) {
        return res.status(400).json({ success: false, error: 'Store not found — check your store domain.' });
      }
      return res.status(400).json({ success: false, error: `Connection failed: ${e.message}` });
    }

    // Save to DB
    await Setting.bulkWrite([
      {
        updateOne: {
          filter: { key: 'shopify_store_domain' },
          update: { $set: { key: 'shopify_store_domain', value: storeDomain, group: 'integrations', isSecret: false, updatedBy: req.user._id } },
          upsert: true,
        },
      },
      {
        updateOne: {
          filter: { key: 'shopify_access_token' },
          update: { $set: { key: 'shopify_access_token', value: accessToken, group: 'integrations', isSecret: true, updatedBy: req.user._id } },
          upsert: true,
        },
      },
    ]);

    // Update in-memory service so next sync uses new credentials immediately
    shopify.shopDomain = storeDomain;
    shopify.accessToken = accessToken;

    res.json({
      success: true,
      data: {
        connected: true,
        shop: {
          name: shopData.name,
          domain: shopData.domain,
          email: shopData.email,
          currency: shopData.currency,
          plan: shopData.plan_name,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/shopify/connect ────────────────────────────
const disconnectShopify = async (req, res, next) => {
  try {
    await Setting.deleteMany({ key: { $in: ['shopify_store_domain', 'shopify_access_token'] } });
    shopify.shopDomain = null;
    shopify.accessToken = null;
    res.json({ success: true, message: 'Shopify disconnected' });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/shopify/status ───────────────────────────────
const getStatus = async (req, res, next) => {
  try {
    await shopify.loadCredentials();
    const configured = !!(shopify.shopDomain && shopify.accessToken);
    if (!configured) {
      return res.json({
        success: true,
        data: { connected: false, message: 'Shopify not connected' },
      });
    }

    // Quick ping — fetch shop info
    const data = await shopify.get('/shop.json');
    res.json({
      success: true,
      data: {
        connected: true,
        shop: {
          name: data.shop.name,
          domain: data.shop.domain,
          email: data.shop.email,
          currency: data.shop.currency,
          plan: data.shop.plan_name,
        },
      },
    });
  } catch (err) {
    res.json({ success: false, data: { connected: false, error: err.message } });
  }
};

// ── POST /api/shopify/sync/products ──────────────────────
const syncProducts = async (req, res, next) => {
  try {
    const lastSync = await Setting.findOne({ key: 'shopify_last_product_sync' });
    const since = lastSync?.value || null;

    const shopifyProducts = await shopify.fetchProducts(since);
    let created = 0, updated = 0;

    for (const sp of shopifyProducts) {
      const mapped = shopify.mapProduct(sp);

      const existing = await Product.findOne({ shopifyId: mapped.shopifyId });
      if (existing) {
        await Product.findByIdAndUpdate(existing._id, {
          name: mapped.name,
          description: mapped.description,
          category: mapped.category,
          salePrice: mapped.salePrice,
          stock: mapped.stock,
          status: mapped.status,
          images: mapped.images,
          variants: mapped.variants,
          supplier: mapped.supplier,
        });
        updated++;
      } else {
        // Avoid duplicate SKU — append shopifyId if needed
        const skuExists = await Product.findOne({ sku: mapped.sku });
        if (skuExists) mapped.sku = `${mapped.sku}-${mapped.shopifyId.slice(-4)}`;
        await Product.create(mapped);
        created++;
      }
    }

    // Save sync timestamp
    await Setting.findOneAndUpdate(
      { key: 'shopify_last_product_sync' },
      { key: 'shopify_last_product_sync', value: new Date().toISOString(), group: 'integrations' },
      { upsert: true }
    );

    res.json({ success: true, data: { synced: shopifyProducts.length, created, updated } });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/shopify/sync/customers ─────────────────────
const syncCustomers = async (req, res, next) => {
  try {
    const lastSync = await Setting.findOne({ key: 'shopify_last_customer_sync' });
    const since = lastSync?.value || null;

    const shopifyCustomers = await shopify.fetchCustomers(since);
    let created = 0, updated = 0;

    for (const sc of shopifyCustomers) {
      const mapped = shopify.mapCustomer(sc);
      const existing = await Customer.findOne({ shopifyId: mapped.shopifyId });

      if (existing) {
        await Customer.findByIdAndUpdate(existing._id, {
          name: mapped.name,
          email: mapped.email,
          phone: mapped.phone,
          city: mapped.city,
          address: mapped.address,
          totalOrders: mapped.totalOrders,
          totalSpent: mapped.totalSpent,
          status: mapped.status,
          tags: mapped.tags,
        });
        updated++;
      } else {
        await Customer.create(mapped);
        created++;
      }
    }

    await Setting.findOneAndUpdate(
      { key: 'shopify_last_customer_sync' },
      { key: 'shopify_last_customer_sync', value: new Date().toISOString(), group: 'integrations' },
      { upsert: true }
    );

    res.json({ success: true, data: { synced: shopifyCustomers.length, created, updated } });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/shopify/sync/orders ─────────────────────────
const syncOrders = async (req, res, next) => {
  try {
    const lastSync = await Setting.findOne({ key: 'shopify_last_order_sync' });
    const since = lastSync?.value || null;

    const shopifyOrders = await shopify.fetchOrders(since);
    let created = 0, updated = 0;

    // Build a map of shopifyCustomerId → CRM customer _id
    const customerMap = {};
    const allCustomers = await Customer.find({ shopifyId: { $exists: true } }).select('_id shopifyId');
    allCustomers.forEach(c => { customerMap[c.shopifyId] = c._id; });

    for (const so of shopifyOrders) {
      const mapped = shopify.mapOrder(so, customerMap);

      // Find or create the customer for this order
      let customerId = mapped.customer;
      if (!customerId && so.customer) {
        let crmCustomer = await Customer.findOne({ shopifyId: String(so.customer.id) });
        if (!crmCustomer) {
          const mappedCustomer = shopify.mapCustomer(so.customer);
          crmCustomer = await Customer.create(mappedCustomer);
        }
        customerId = crmCustomer._id;
      }

      const existing = await Order.findOne({ shopifyId: mapped.shopifyId });

      if (existing) {
        await Order.findByIdAndUpdate(existing._id, {
          status: mapped.status,
          paymentStatus: mapped.paymentStatus,
          total: mapped.total,
        });
        updated++;
      } else {
        // Create order without triggering stock deduction (already managed by Shopify)
        const orderDoc = new Order({
          ...mapped,
          customer: customerId,
          items: mapped.items.map(item => ({
            ...item,
            product: null, // linked in product sync
            costPrice: item.costPrice || 0,
          })),
        });
        // Skip the pre-save orderId generation if we already have one from Shopify
        orderDoc.orderId = mapped.orderId;
        await orderDoc.save();
        created++;
      }
    }

    await Setting.findOneAndUpdate(
      { key: 'shopify_last_order_sync' },
      { key: 'shopify_last_order_sync', value: new Date().toISOString(), group: 'integrations' },
      { upsert: true }
    );

    res.json({ success: true, data: { synced: shopifyOrders.length, created, updated } });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/shopify/sync/all ────────────────────────────
const syncAll = async (req, res, next) => {
  try {
    const results = { products: null, customers: null, orders: null, errors: [] };

    // Products first
    try {
      const lastPSync = await Setting.findOne({ key: 'shopify_last_product_sync' });
      const shopifyProducts = await shopify.fetchProducts(lastPSync?.value || null);
      let pCreated = 0, pUpdated = 0;
      for (const sp of shopifyProducts) {
        const mapped = shopify.mapProduct(sp);
        const existing = await Product.findOne({ shopifyId: mapped.shopifyId });
        if (existing) { await Product.findByIdAndUpdate(existing._id, mapped); pUpdated++; }
        else {
          const skuExists = await Product.findOne({ sku: mapped.sku });
          if (skuExists) mapped.sku = `${mapped.sku}-${mapped.shopifyId.slice(-4)}`;
          await Product.create(mapped); pCreated++;
        }
      }
      await Setting.findOneAndUpdate({ key: 'shopify_last_product_sync' }, { key: 'shopify_last_product_sync', value: new Date().toISOString(), group: 'integrations' }, { upsert: true });
      results.products = { synced: shopifyProducts.length, created: pCreated, updated: pUpdated };
    } catch (e) { results.errors.push(`Products: ${e.message}`); }

    // Customers
    try {
      const lastCSync = await Setting.findOne({ key: 'shopify_last_customer_sync' });
      const shopifyCustomers = await shopify.fetchCustomers(lastCSync?.value || null);
      let cCreated = 0, cUpdated = 0;
      for (const sc of shopifyCustomers) {
        const mapped = shopify.mapCustomer(sc);
        const existing = await Customer.findOne({ shopifyId: mapped.shopifyId });
        if (existing) { await Customer.findByIdAndUpdate(existing._id, mapped); cUpdated++; }
        else { await Customer.create(mapped); cCreated++; }
      }
      await Setting.findOneAndUpdate({ key: 'shopify_last_customer_sync' }, { key: 'shopify_last_customer_sync', value: new Date().toISOString(), group: 'integrations' }, { upsert: true });
      results.customers = { synced: shopifyCustomers.length, created: cCreated, updated: cUpdated };
    } catch (e) { results.errors.push(`Customers: ${e.message}`); }

    // Orders
    try {
      const lastOSync = await Setting.findOne({ key: 'shopify_last_order_sync' });
      const shopifyOrders = await shopify.fetchOrders(lastOSync?.value || null);
      let oCreated = 0, oUpdated = 0;
      const allCRMCustomers = await Customer.find({ shopifyId: { $exists: true } }).select('_id shopifyId');
      const customerMap = {};
      allCRMCustomers.forEach(c => { customerMap[c.shopifyId] = c._id; });

      for (const so of shopifyOrders) {
        const mapped = shopify.mapOrder(so, customerMap);
        let customerId = customerMap[so.customer?.id ? String(so.customer.id) : null];
        if (!customerId && so.customer) {
          let crmCust = await Customer.findOne({ shopifyId: String(so.customer.id) });
          if (!crmCust) crmCust = await Customer.create(shopify.mapCustomer(so.customer));
          customerId = crmCust._id;
        }
        const existing = await Order.findOne({ shopifyId: mapped.shopifyId });
        if (existing) { await Order.findByIdAndUpdate(existing._id, { status: mapped.status, paymentStatus: mapped.paymentStatus, total: mapped.total }); oUpdated++; }
        else {
          const orderDoc = new Order({ ...mapped, customer: customerId, items: mapped.items.map(i => ({ ...i, product: null, costPrice: 0 })) });
          orderDoc.orderId = mapped.orderId;
          await orderDoc.save();
          oCreated++;
        }
      }
      await Setting.findOneAndUpdate({ key: 'shopify_last_order_sync' }, { key: 'shopify_last_order_sync', value: new Date().toISOString(), group: 'integrations' }, { upsert: true });
      results.orders = { synced: shopifyOrders.length, created: oCreated, updated: oUpdated };
    } catch (e) { results.errors.push(`Orders: ${e.message}`); }

    res.json({ success: results.errors.length === 0, data: results });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/shopify/sync/status ──────────────────────────
const getSyncStatus = async (req, res, next) => {
  try {
    const [pSync, cSync, oSync] = await Promise.all([
      Setting.findOne({ key: 'shopify_last_product_sync' }),
      Setting.findOne({ key: 'shopify_last_customer_sync' }),
      Setting.findOne({ key: 'shopify_last_order_sync' }),
    ]);

    const [productCount, customerCount, orderCount] = await Promise.all([
      Product.countDocuments({ shopifyId: { $exists: true } }),
      Customer.countDocuments({ shopifyId: { $exists: true } }),
      Order.countDocuments({ shopifyId: { $exists: true } }),
    ]);

    res.json({
      success: true,
      data: {
        products: { lastSync: pSync?.value || null, count: productCount },
        customers: { lastSync: cSync?.value || null, count: customerCount },
        orders: { lastSync: oSync?.value || null, count: orderCount },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/shopify/webhooks/orders/create ──────────────
// Shopify calls this when a new order is placed
const handleOrderWebhook = async (req, res) => {
  try {
    const so = req.body;
    if (!so || !so.id) return res.status(400).json({ success: false });

    const mapped = shopify.mapOrder(so);
    const existing = await Order.findOne({ shopifyId: mapped.shopifyId });

    if (!existing) {
      let customerId = null;
      if (so.customer) {
        let crmCust = await Customer.findOne({ shopifyId: String(so.customer.id) });
        if (!crmCust) crmCust = await Customer.create(shopify.mapCustomer(so.customer));
        customerId = crmCust._id;
      }
      const orderDoc = new Order({ ...mapped, customer: customerId, items: mapped.items.map(i => ({ ...i, product: null, costPrice: 0 })) });
      orderDoc.orderId = mapped.orderId;
      await orderDoc.save();
    }

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(200).json({ success: false }); // Always 200 to Shopify
  }
};

module.exports = { connectShopify, disconnectShopify, getStatus, syncProducts, syncCustomers, syncOrders, syncAll, getSyncStatus, handleOrderWebhook };
