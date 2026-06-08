function openPrintWindow(title, bodyHtml) {
  const win = window.open('', '_blank', 'width=720,height=900');
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>
      * { box-sizing: border-box; }
      body { font-family: 'DM Sans', Arial, sans-serif; color: #1a1a1a; padding: 32px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #ddd; font-size: 13px; }
      th { background: #f3f3f6; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #666; }
      h1 { font-size: 20px; margin: 0 0 4px; }
      h2 { font-size: 14px; margin: 20px 0 6px; }
      .muted { color: #777; font-size: 12px; }
      .total-row td { font-weight: 700; font-size: 15px; border-top: 2px solid #1a1a1a; border-bottom: none; }
      .label-box { border: 2px solid #1a1a1a; border-radius: 10px; padding: 20px; margin-top: 16px; }
      .label-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #ccc; font-size: 13px; }
      @media print { body { padding: 0; } }
    </style>
  </head><body>${bodyHtml}</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 300);
}

export function printInvoice(order) {
  const items = (order.items || []).map(i => ({
    name: i.name || i.productName || i.product?.name || 'Item',
    qty: i.qty || 1,
    price: i.salePrice || i.price || 0,
  }));
  const itemsHtml = items.length
    ? items.map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>PKR ${i.price.toLocaleString()}</td><td>PKR ${(i.price * i.qty).toLocaleString()}</td></tr>`).join('')
    : (order.products || []).map(p => `<tr><td>${p}</td><td>—</td><td>—</td><td>—</td></tr>`).join('');

  const html = `
    <h1>Invoice — ${order.id}</h1>
    <div class="muted">Date: ${order.date} · Source: ${order.source || '—'} · Payment: ${order.paymentMethod || order.payment || '—'}</div>
    <h2>Bill To</h2>
    <div>${order.customer}</div>
    <div class="muted">${order.phone || ''} ${order.city ? '· ' + order.city : ''}</div>
    <h2>Items</h2>
    <table>
      <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
      <tbody>${itemsHtml}</tbody>
      <tfoot><tr class="total-row"><td colspan="3">Total</td><td>PKR ${(order.amount || 0).toLocaleString()}</td></tr></tfoot>
    </table>
  `;
  openPrintWindow(`Invoice ${order.id}`, html);
}

export function printShippingLabel(shipment) {
  const html = `
    <h1>Shipping Label</h1>
    <div class="label-box">
      <div style="font-family: monospace; font-size: 18px; font-weight: 700; margin-bottom: 10px;">${shipment.trackingId || ''}</div>
      <div class="label-row"><span class="muted">Courier</span><span>${shipment.courier || '—'}</span></div>
      <div class="label-row"><span class="muted">Order ID</span><span>${shipment.orderId || '—'}</span></div>
      <div class="label-row"><span class="muted">Recipient</span><span>${shipment.customer || shipment.customerName || '—'}</span></div>
      <div class="label-row"><span class="muted">Phone</span><span>${shipment.phone || shipment.customerPhone || '—'}</span></div>
      <div class="label-row"><span class="muted">Address</span><span>${shipment.address || '—'}, ${shipment.city || '—'}</span></div>
      <div class="label-row"><span class="muted">Weight</span><span>${shipment.weight || '—'}</span></div>
      <div class="label-row"><span class="muted">COD Amount</span><span>PKR ${(shipment.codAmount || shipment.cod || 0).toLocaleString?.() || shipment.codAmount || 0}</span></div>
      <div class="label-row"><span class="muted">Product</span><span>${shipment.product || '—'}</span></div>
    </div>
  `;
  openPrintWindow(`Label ${shipment.trackingId || ''}`, html);
}
