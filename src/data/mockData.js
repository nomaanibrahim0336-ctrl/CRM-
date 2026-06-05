export const revenueData = [
  { date: 'Nov 5', revenue: 18400 },
  { date: 'Nov 6', revenue: 22100 },
  { date: 'Nov 7', revenue: 19800 },
  { date: 'Nov 8', revenue: 25300 },
  { date: 'Nov 9', revenue: 21000 },
  { date: 'Nov 10', revenue: 28700 },
  { date: 'Nov 11', revenue: 31200 },
  { date: 'Nov 12', revenue: 26800 },
  { date: 'Nov 13', revenue: 29400 },
  { date: 'Nov 14', revenue: 33100 },
  { date: 'Nov 15', revenue: 27600 },
  { date: 'Nov 16', revenue: 35000 },
  { date: 'Nov 17', revenue: 32100 },
  { date: 'Nov 18', revenue: 29800 },
  { date: 'Nov 19', revenue: 38400 },
  { date: 'Nov 20', revenue: 42100 },
  { date: 'Nov 21', revenue: 36700 },
  { date: 'Nov 22', revenue: 40200 },
  { date: 'Nov 23', revenue: 44800 },
  { date: 'Nov 24', revenue: 38900 },
  { date: 'Nov 25', revenue: 51200 },
  { date: 'Nov 26', revenue: 47600 },
  { date: 'Nov 27', revenue: 43100 },
  { date: 'Nov 28', revenue: 56800 },
  { date: 'Nov 29', revenue: 49300 },
  { date: 'Nov 30', revenue: 52700 },
  { date: 'Dec 1', revenue: 61200 },
  { date: 'Dec 2', revenue: 58400 },
  { date: 'Dec 3', revenue: 64100 },
  { date: 'Dec 4', revenue: 71800 },
];

export const ordersBySource = [
  { name: 'Shopify', value: 38, color: '#7C6AF7' },
  { name: 'Instagram', value: 28, color: '#1DB87A' },
  { name: 'WhatsApp', value: 21, color: '#3A8AE8' },
  { name: 'Website', value: 10, color: '#F5A623' },
  { name: 'Mobile App', value: 3, color: '#E2514A' },
];

export const orders = [
  { id: '#ORD-7841', customer: 'Aisha Malik', avatar: 'AM', phone: '+92 300 1234567', city: 'Karachi', products: ['Nike Air Max 270', 'Adidas Socks'], amount: 12500, payment: 'COD', status: 'Delivered', source: 'Instagram', date: '2024-12-04', courier: 'TCS', trackingId: 'TCS-88291', courierStatus: 'Delivered' },
  { id: '#ORD-7840', customer: 'Bilal Ahmed', avatar: 'BA', phone: '+92 321 9876543', city: 'Lahore', products: ['Samsung Galaxy Buds'], amount: 8900, payment: 'Card', status: 'Shipped', source: 'Shopify', date: '2024-12-04', courier: 'Leopard', trackingId: 'LEP-44512', courierStatus: 'In Transit' },
  { id: '#ORD-7839', customer: 'Sara Khan', avatar: 'SK', phone: '+92 333 5556677', city: 'Islamabad', products: ['Zara Dress', 'H&M Blazer'], amount: 19800, payment: 'Easypaisa', status: 'Processing', source: 'WhatsApp', date: '2024-12-03', courier: 'BlueEx', trackingId: 'BEX-22987', courierStatus: 'Pickup Pending' },
  { id: '#ORD-7838', customer: 'Usman Tariq', avatar: 'UT', phone: '+92 345 7778899', city: 'Faisalabad', products: ['iPhone Case', 'Screen Protector', 'Charger'], amount: 4200, payment: 'COD', status: 'Pending', source: 'Instagram', date: '2024-12-03', courier: null, trackingId: null, courierStatus: null },
  { id: '#ORD-7837', customer: 'Fatima Zahra', avatar: 'FZ', phone: '+92 312 3334445', city: 'Karachi', products: ['Yoga Mat Premium'], amount: 6700, payment: 'Card', status: 'Shipped', source: 'Website', date: '2024-12-02', courier: 'TCS', trackingId: 'TCS-88190', courierStatus: 'Out for Delivery' },
  { id: '#ORD-7836', customer: 'Hassan Raza', avatar: 'HR', phone: '+92 300 9998887', city: 'Rawalpindi', products: ['Polo Shirt (x3)'], amount: 7500, payment: 'COD', status: 'Delivered', source: 'Shopify', date: '2024-12-02', courier: 'Leopard', trackingId: 'LEP-44490', courierStatus: 'Delivered' },
  { id: '#ORD-7835', customer: 'Zainab Hussain', avatar: 'ZH', phone: '+92 321 2221110', city: 'Lahore', products: ['Face Serum', 'Moisturizer', 'Sunscreen'], amount: 11200, payment: 'JazzCash', status: 'Processing', source: 'Instagram', date: '2024-12-01', courier: null, trackingId: null, courierStatus: null },
  { id: '#ORD-7834', customer: 'Omar Farooq', avatar: 'OF', phone: '+92 333 4445556', city: 'Multan', products: ['Sports Shoes'], amount: 9800, payment: 'COD', status: 'Cancelled', source: 'WhatsApp', date: '2024-12-01', courier: null, trackingId: null, courierStatus: null },
  { id: '#ORD-7833', customer: 'Hina Baig', avatar: 'HB', phone: '+92 345 6667778', city: 'Karachi', products: ['Laptop Bag', 'Mouse Pad'], amount: 5400, payment: 'Card', status: 'Delivered', source: 'Mobile App', date: '2024-11-30', courier: 'BlueEx', trackingId: 'BEX-22880', courierStatus: 'Delivered' },
  { id: '#ORD-7832', customer: 'Kamran Sheikh', avatar: 'KS', phone: '+92 312 8889990', city: 'Peshawar', products: ['Cricket Bat', 'Gloves', 'Pads'], amount: 16700, payment: 'COD', status: 'Shipped', source: 'Shopify', date: '2024-11-30', courier: 'TCS', trackingId: 'TCS-88100', courierStatus: 'In Transit' },
];

export const customers = [
  { id: 'C001', name: 'Aisha Malik', avatar: 'AM', phone: '+92 300 1234567', email: 'aisha@email.com', city: 'Karachi', totalOrders: 12, totalSpent: 94200, lastOrder: '2024-12-04', source: 'Instagram', status: 'VIP' },
  { id: 'C002', name: 'Bilal Ahmed', avatar: 'BA', phone: '+92 321 9876543', email: 'bilal@email.com', city: 'Lahore', totalOrders: 8, totalSpent: 67800, lastOrder: '2024-12-04', source: 'Shopify', status: 'Regular' },
  { id: 'C003', name: 'Sara Khan', avatar: 'SK', phone: '+92 333 5556677', email: 'sara@email.com', city: 'Islamabad', totalOrders: 5, totalSpent: 41200, lastOrder: '2024-12-03', source: 'WhatsApp', status: 'Regular' },
  { id: 'C004', name: 'Usman Tariq', avatar: 'UT', phone: '+92 345 7778899', email: 'usman@email.com', city: 'Faisalabad', totalOrders: 3, totalSpent: 18900, lastOrder: '2024-12-03', source: 'Instagram', status: 'New' },
  { id: 'C005', name: 'Fatima Zahra', avatar: 'FZ', phone: '+92 312 3334445', email: 'fatima@email.com', city: 'Karachi', totalOrders: 15, totalSpent: 128400, lastOrder: '2024-12-02', source: 'Website', status: 'VIP' },
  { id: 'C006', name: 'Hassan Raza', avatar: 'HR', phone: '+92 300 9998887', email: 'hassan@email.com', city: 'Rawalpindi', totalOrders: 7, totalSpent: 52100, lastOrder: '2024-12-02', source: 'Shopify', status: 'Regular' },
  { id: 'C007', name: 'Zainab Hussain', avatar: 'ZH', phone: '+92 321 2221110', email: 'zainab@email.com', city: 'Lahore', totalOrders: 9, totalSpent: 78600, lastOrder: '2024-12-01', source: 'Instagram', status: 'Regular' },
  { id: 'C008', name: 'Omar Farooq', avatar: 'OF', phone: '+92 333 4445556', email: 'omar@email.com', city: 'Multan', totalOrders: 2, totalSpent: 14200, lastOrder: '2024-12-01', source: 'WhatsApp', status: 'New' },
  { id: 'C009', name: 'Hina Baig', avatar: 'HB', phone: '+92 345 6667778', email: 'hina@email.com', city: 'Karachi', totalOrders: 11, totalSpent: 89300, lastOrder: '2024-11-30', source: 'Mobile App', status: 'VIP' },
  { id: 'C010', name: 'Kamran Sheikh', avatar: 'KS', phone: '+92 312 8889990', email: 'kamran@email.com', city: 'Peshawar', totalOrders: 6, totalSpent: 44800, lastOrder: '2024-11-30', source: 'Shopify', status: 'Regular' },
];

export const conversations = [
  {
    id: 'conv1',
    customer: 'Aisha Malik',
    avatar: 'AM',
    channel: 'WhatsApp',
    lastMessage: 'When will my order be delivered?',
    time: '2 min ago',
    unread: 2,
    status: 'Open',
    messages: [
      { id: 1, sender: 'customer', text: 'Hi, I placed an order yesterday #ORD-7841', time: '10:30 AM', isBot: false },
      { id: 2, sender: 'bot', text: 'Hello Aisha! I can see your order #ORD-7841 for Nike Air Max 270. It was shipped via TCS with tracking ID TCS-88291.', time: '10:30 AM', isBot: true },
      { id: 3, sender: 'customer', text: 'When will my order be delivered?', time: '10:32 AM', isBot: false },
    ]
  },
  {
    id: 'conv2',
    customer: 'Sara Khan',
    avatar: 'SK',
    channel: 'Instagram',
    lastMessage: 'Do you have this in size M?',
    time: '15 min ago',
    unread: 1,
    status: 'Open',
    messages: [
      { id: 1, sender: 'customer', text: 'Hi! I saw your post about the Zara dresses', time: '9:45 AM', isBot: false },
      { id: 2, sender: 'bot', text: 'Hello Sara! Yes, we have the full Zara dress collection. Which style are you interested in?', time: '9:45 AM', isBot: true },
      { id: 3, sender: 'customer', text: 'Do you have this in size M?', time: '9:50 AM', isBot: false },
    ]
  },
  {
    id: 'conv3',
    customer: 'Bilal Ahmed',
    avatar: 'BA',
    channel: 'WhatsApp',
    lastMessage: 'Thanks! Order confirmed.',
    time: '1 hr ago',
    unread: 0,
    status: 'Closed',
    messages: [
      { id: 1, sender: 'customer', text: 'I want to order the Samsung Galaxy Buds', time: '8:00 AM', isBot: false },
      { id: 2, sender: 'bot', text: 'Great choice! The Samsung Galaxy Buds are PKR 8,900. Would you like to place the order?', time: '8:00 AM', isBot: true },
      { id: 3, sender: 'customer', text: 'Yes please, COD to Lahore', time: '8:02 AM', isBot: false },
      { id: 4, sender: 'agent', text: 'Order placed! Your order #ORD-7840 is confirmed. Expected delivery in 3-4 days.', time: '8:05 AM', isBot: false },
      { id: 5, sender: 'customer', text: 'Thanks! Order confirmed.', time: '8:06 AM', isBot: false },
    ]
  },
  {
    id: 'conv4',
    customer: 'Fatima Zahra',
    avatar: 'FZ',
    channel: 'WhatsApp',
    lastMessage: 'Can I get a discount on bulk order?',
    time: '2 hr ago',
    unread: 0,
    status: 'Open',
    messages: [
      { id: 1, sender: 'customer', text: 'I want to buy 5 yoga mats for my studio', time: '7:30 AM', isBot: false },
      { id: 2, sender: 'bot', text: 'Hello Fatima! That sounds great! We do offer bulk discounts on orders of 5+.', time: '7:30 AM', isBot: true },
      { id: 3, sender: 'customer', text: 'Can I get a discount on bulk order?', time: '7:35 AM', isBot: false },
    ]
  },
  {
    id: 'conv5',
    customer: 'Usman Tariq',
    avatar: 'UT',
    channel: 'Instagram',
    lastMessage: 'What are the payment options?',
    time: '3 hr ago',
    unread: 3,
    status: 'Open',
    messages: [
      { id: 1, sender: 'customer', text: 'What are the payment options?', time: '6:15 AM', isBot: false },
    ]
  },
  {
    id: 'conv6',
    customer: 'Kamran Sheikh',
    avatar: 'KS',
    channel: 'Telegram',
    lastMessage: 'Is the cricket bat still available?',
    time: '5 min ago',
    unread: 1,
    status: 'Open',
    messages: [
      { id: 1, sender: 'customer', text: 'Hey! Found you on Telegram. Is the cricket bat still available?', time: '10:55 AM', isBot: false },
      { id: 2, sender: 'bot', text: 'Hi Kamran! Yes, the Kashmir Willow Cricket Bat is in stock at PKR 8,500. Want me to place an order?', time: '10:55 AM', isBot: true },
      { id: 3, sender: 'customer', text: 'Is the cricket bat still available?', time: '10:58 AM', isBot: false },
    ]
  },
  {
    id: 'conv7',
    customer: 'Hina Baig',
    avatar: 'HB',
    channel: 'Messenger',
    lastMessage: 'Can I return the laptop bag?',
    time: '20 min ago',
    unread: 2,
    status: 'Open',
    messages: [
      { id: 1, sender: 'customer', text: 'Hi, I received the laptop bag but the zipper is broken.', time: '9:00 AM', isBot: false },
      { id: 2, sender: 'bot', text: 'Hello Hina! I\'m sorry to hear that. We\'ll arrange an immediate replacement. Can you share a photo?', time: '9:00 AM', isBot: true },
      { id: 3, sender: 'customer', text: 'Can I return the laptop bag?', time: '9:20 AM', isBot: false },
    ]
  },
  {
    id: 'conv8',
    customer: 'Zainab Hussain',
    avatar: 'ZH',
    channel: 'TikTok',
    lastMessage: 'Saw your TikTok! How to order?',
    time: '30 min ago',
    unread: 4,
    status: 'Open',
    messages: [
      { id: 1, sender: 'customer', text: 'OMG I just saw your TikTok video! The face serum looks amazing 😍', time: '8:30 AM', isBot: false },
      { id: 2, sender: 'bot', text: 'Thank you Zainab! 💜 The Vitamin C Face Serum is PKR 3,800. It\'s our bestseller!', time: '8:30 AM', isBot: true },
      { id: 3, sender: 'customer', text: 'Saw your TikTok! How to order?', time: '8:35 AM', isBot: false },
    ]
  },
  {
    id: 'conv9',
    customer: 'Hassan Raza',
    avatar: 'HR',
    channel: 'Email',
    lastMessage: 'Invoice for order #ORD-7836',
    time: '1 hr ago',
    unread: 0,
    status: 'Closed',
    messages: [
      { id: 1, sender: 'customer', text: 'Hello, could you please send me an invoice for my order #ORD-7836?', time: '7:00 AM', isBot: false },
      { id: 2, sender: 'agent', text: 'Hi Hassan! I\'ve attached your invoice for order #ORD-7836 (Polo Shirt x3, PKR 7,500). Please check your email.', time: '7:15 AM', isBot: false },
      { id: 3, sender: 'customer', text: 'Invoice for order #ORD-7836 — received, thank you!', time: '7:20 AM', isBot: false },
    ]
  },
  {
    id: 'conv10',
    customer: 'Omar Farooq',
    avatar: 'OF',
    channel: 'Twitter',
    lastMessage: 'Why was my order cancelled?',
    time: '45 min ago',
    unread: 2,
    status: 'Open',
    messages: [
      { id: 1, sender: 'customer', text: '@YourBrand my order #ORD-7834 got cancelled without any reason! 😡', time: '8:00 AM', isBot: false },
      { id: 2, sender: 'bot', text: 'Hi Omar, we apologize for the inconvenience! Let me look into order #ORD-7834 right away.', time: '8:01 AM', isBot: true },
      { id: 3, sender: 'customer', text: 'Why was my order cancelled?', time: '8:05 AM', isBot: false },
    ]
  },
  {
    id: 'conv11',
    customer: 'Nadia Siddiqui',
    avatar: 'NS',
    channel: 'LiveChat',
    lastMessage: 'Checking out now, any promo code?',
    time: '8 min ago',
    unread: 1,
    status: 'Open',
    messages: [
      { id: 1, sender: 'customer', text: 'Hi! I\'m on your website right now and about to check out.', time: '10:50 AM', isBot: false },
      { id: 2, sender: 'bot', text: 'Welcome! 👋 I\'m Zara, your shopping assistant. Can I help you complete your purchase?', time: '10:50 AM', isBot: true },
      { id: 3, sender: 'customer', text: 'Checking out now, any promo code?', time: '10:52 AM', isBot: false },
    ]
  },
  {
    id: 'conv12',
    customer: 'Raheel Abbas',
    avatar: 'RA',
    channel: 'Telegram',
    lastMessage: 'Send me the product catalog',
    time: '12 min ago',
    unread: 0,
    status: 'Open',
    messages: [
      { id: 1, sender: 'customer', text: 'Hello, can you send me the full product catalog?', time: '10:45 AM', isBot: false },
      { id: 2, sender: 'bot', text: 'Sure Raheel! Here\'s our catalog link: [catalog.yourstore.pk]. We have 200+ products!', time: '10:45 AM', isBot: true },
      { id: 3, sender: 'customer', text: 'Send me the product catalog', time: '10:47 AM', isBot: false },
    ]
  },
];

export const products = [
  { id: 'P001', name: 'Nike Air Max 270', category: 'Footwear', price: 12500, stock: 23, sold: 145, status: 'Active', sku: 'NK-AM270-BLK' },
  { id: 'P002', name: 'Samsung Galaxy Buds Pro', category: 'Electronics', price: 8900, stock: 7, sold: 89, status: 'Low Stock', sku: 'SG-GBP-BLK' },
  { id: 'P003', name: 'Zara Floral Midi Dress', category: 'Clothing', price: 6800, stock: 31, sold: 203, status: 'Active', sku: 'ZR-FMD-RED' },
  { id: 'P004', name: 'Yoga Mat Premium', category: 'Sports', price: 6700, stock: 2, sold: 67, status: 'Low Stock', sku: 'YM-PRE-PRP' },
  { id: 'P005', name: 'H&M Blazer Classic', category: 'Clothing', price: 9800, stock: 18, sold: 112, status: 'Active', sku: 'HM-BLZ-NVY' },
  { id: 'P006', name: 'iPhone 15 Case Carbon', category: 'Accessories', price: 2400, stock: 0, sold: 321, status: 'Out of Stock', sku: 'IP15-CC-BLK' },
  { id: 'P007', name: 'Adidas Running Socks (3-Pack)', category: 'Accessories', price: 1200, stock: 89, sold: 445, status: 'Active', sku: 'AD-RS3-WHT' },
  { id: 'P008', name: 'Laptop Bag 15"', category: 'Bags', price: 4200, stock: 14, sold: 78, status: 'Active', sku: 'LB-15-GRY' },
  { id: 'P009', name: 'Face Serum Vitamin C', category: 'Beauty', price: 3800, stock: 5, sold: 156, status: 'Low Stock', sku: 'FS-VTC-30ML' },
  { id: 'P010', name: 'Cricket Bat Kashmir Willow', category: 'Sports', price: 8500, stock: 12, sold: 34, status: 'Active', sku: 'CB-KW-F' },
  { id: 'P011', name: 'Polo Shirt Premium', category: 'Clothing', price: 2500, stock: 67, sold: 289, status: 'Active', sku: 'PS-PRE-BLU' },
  { id: 'P012', name: 'Moisturizer SPF 50', category: 'Beauty', price: 2800, stock: 0, sold: 198, status: 'Out of Stock', sku: 'MS-SPF50-100ML' },
];

export const topProducts = [
  { name: 'Adidas Socks', revenue: 53400 },
  { name: 'Polo Shirt', revenue: 72250 },
  { name: 'Zara Dress', revenue: 138040 },
  { name: 'Yoga Mat', revenue: 44890 },
  { name: 'Nike Air Max', revenue: 181250 },
];

export const metaAdsData = [
  { campaign: 'Nike Shoes - DPA', spend: 24500, impressions: 189000, clicks: 4200, conversions: 89, roas: 4.2 },
  { campaign: 'Summer Clothing Sale', spend: 18200, impressions: 241000, clicks: 6100, conversions: 124, roas: 5.1 },
  { campaign: 'Beauty Products', spend: 11800, impressions: 98000, clicks: 2800, conversions: 56, roas: 3.8 },
  { campaign: 'Electronics Retargeting', spend: 8900, impressions: 67000, clicks: 1900, conversions: 43, roas: 6.2 },
];

export const courierData = [
  { courier: 'TCS', orders: 312, delivered: 289, failed: 14, pending: 9, successRate: 92.6 },
  { courier: 'Leopard', orders: 241, delivered: 218, failed: 18, pending: 5, successRate: 90.5 },
  { courier: 'BlueEx', orders: 189, delivered: 168, failed: 12, pending: 9, successRate: 88.9 },
  { courier: 'PostEx', orders: 145, delivered: 127, failed: 11, pending: 7, successRate: 87.6 },
];

export const activityFeed = [
  { id: 1, type: 'order', text: 'New order #ORD-7841 from Aisha Malik', time: '2 min ago', icon: 'ShoppingBag' },
  { id: 2, type: 'message', text: 'Sara Khan sent a message on Instagram', time: '8 min ago', icon: 'MessageSquare' },
  { id: 3, type: 'order', text: 'Order #ORD-7840 shipped via Leopard', time: '22 min ago', icon: 'Truck' },
  { id: 4, type: 'customer', text: 'New customer signed up: Usman Tariq', time: '45 min ago', icon: 'UserPlus' },
  { id: 5, type: 'payment', text: 'Payment received PKR 19,800 from Sara Khan', time: '1 hr ago', icon: 'CreditCard' },
  { id: 6, type: 'order', text: 'Order #ORD-7839 processing started', time: '1.5 hr ago', icon: 'RefreshCw' },
  { id: 7, type: 'message', text: 'Fatima Zahra asking about bulk discount', time: '2 hr ago', icon: 'MessageSquare' },
  { id: 8, type: 'order', text: 'Order #ORD-7838 placed (COD - Pending)', time: '2.5 hr ago', icon: 'ShoppingBag' },
];
