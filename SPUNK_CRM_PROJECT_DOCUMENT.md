# SPUNK CRM — Full Project Document
**Version:** 1.0  
**Date:** June 2026  
**Store:** spunk-9041.myshopify.com  
**Currency:** PKR (Pakistani Rupee)  
**Prepared for:** Developer Handoff

---

## 1. WHAT IS THIS CRM?

SPUNK CRM is a custom-built ecommerce Customer Relationship Management dashboard built specifically for the SPUNK store (Pakistan). It is a full-stack web application that centralizes:

- All orders from Shopify and other channels
- Customer profiles, history, and conversations
- Product and inventory management
- Courier/shipment tracking
- Financial reports and profit calculations
- Analytics and performance charts
- Multi-channel messaging (WhatsApp, Instagram, Facebook)
- Store settings and integrations

The CRM is NOT a third-party tool — it is 100% custom code owned by SPUNK.

---

## 2. LIVE URLS

| Service | URL |
|---|---|
| **Frontend (Live)** | https://crm-railway1.vercel.app |
| **Backend API (Live)** | https://crm-production-eb0c.up.railway.app |
| **Backend Health Check** | https://crm-production-eb0c.up.railway.app/api/health |
| **GitHub Repository** | https://github.com/nomaanibrahim0336-ctrl/CRM- |
| **Active Branch** | `claude/nice-volta-6g81M` |

---

## 3. TECH STACK

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18+ | UI framework |
| Vite | Latest | Build tool |
| React Router | v6 | Page routing |
| Recharts | Latest | Charts and graphs |
| Lucide React | Latest | Icons |
| Tailwind (inline styles) | — | Dark theme UI |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | v5.2.1 | API framework |
| Mongoose | v9.6.3 | MongoDB ODM |
| JWT (jsonwebtoken) | v9 | Authentication |
| bcryptjs | v3 | Password hashing |
| axios | Latest | Shopify API calls |
| dotenv | v16 | Environment variables |
| helmet | v8 | Security headers |
| cors | v2 | Cross-origin requests |
| express-rate-limit | v8 | Rate limiting |
| morgan | v1 | Request logging |

### Infrastructure
| Service | Purpose |
|---|---|
| Railway | Backend hosting + MongoDB database |
| Vercel | Frontend hosting |
| MongoDB (Railway plugin) | Database |
| GitHub | Code repository |

---

## 4. PROJECT FOLDER STRUCTURE

```
CRM-/
│
├── src/                          ← FRONTEND (React)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Topbar.jsx        ← Top navigation bar with search, notifications, user menu
│   │   │   ├── Sidebar.jsx       ← Left sidebar navigation
│   │   │   └── PageWrapper.jsx   ← Page layout wrapper
│   │   └── ui/
│   │       ├── Badge.jsx         ← Status badges (Pending, Shipped, etc.)
│   │       ├── Button.jsx        ← Reusable button component
│   │       ├── Card.jsx          ← Card container component
│   │       ├── Modal.jsx         ← Modal/popup component
│   │       ├── StatCard.jsx      ← Dashboard stat cards
│   │       ├── StatusDot.jsx     ← Online/offline indicator dot
│   │       ├── Table.jsx         ← Reusable table component
│   │       └── Toast.jsx         ← Toast notification component
│   │
│   ├── context/
│   │   ├── AuthContext.jsx       ← JWT auth state (login, logout, token)
│   │   └── ToastContext.jsx      ← Global toast notifications
│   │
│   ├── data/
│   │   └── mockData.js           ← Fallback demo data (used when DB is empty)
│   │
│   ├── hooks/
│   │   ├── useKeyboard.js        ← Keyboard shortcut hook (Cmd+K search)
│   │   └── useToast.js           ← Toast hook
│   │
│   ├── pages/
│   │   ├── Login.jsx             ← Login + Register page ✅ WIRED
│   │   ├── Dashboard.jsx         ← Main dashboard with stats + charts ✅ WIRED
│   │   ├── Orders.jsx            ← Orders list + detail panel ✅ WIRED
│   │   ├── Customers.jsx         ← Customer list + profile panel ✅ WIRED
│   │   ├── Products.jsx          ← Product catalog ⚠️ NEEDS WIRING
│   │   ├── Inventory.jsx         ← Stock management ⚠️ NEEDS WIRING
│   │   ├── Conversations.jsx     ← Multi-channel chat ⚠️ NEEDS WIRING
│   │   ├── Courier.jsx           ← Shipment tracking ⚠️ NEEDS WIRING
│   │   ├── Analytics.jsx         ← Sales analytics charts ⚠️ NEEDS WIRING
│   │   ├── Financials.jsx        ← Revenue, costs, profit ⚠️ NEEDS WIRING
│   │   ├── Integrations.jsx      ← App integrations page ⚠️ NEEDS WIRING
│   │   └── Settings.jsx          ← Store settings ⚠️ NEEDS WIRING
│   │
│   ├── utils/
│   │   ├── api.js                ← Central API service (fetch with JWT token)
│   │   └── exportCsv.js          ← CSV export utility
│   │
│   ├── App.jsx                   ← Root app with routing + auth guard
│   └── main.jsx                  ← React entry point
│
├── server/                       ← BACKEND (Node.js + Express)
│   ├── config/
│   │   └── db.js                 ← MongoDB connection
│   │
│   ├── controllers/
│   │   ├── authController.js     ← Register, login, profile ✅ DONE
│   │   ├── orderController.js    ← CRUD orders + stats ✅ DONE
│   │   ├── customerController.js ← CRUD customers ✅ DONE
│   │   ├── productController.js  ← CRUD products ✅ DONE
│   │   ├── analyticsController.js← Dashboard stats, sales charts ✅ DONE
│   │   ├── courierController.js  ← Shipment management ✅ DONE
│   │   ├── financialsController.js← Revenue, expenses, profit ✅ DONE
│   │   ├── conversationController.js← Chat/messaging ✅ DONE
│   │   ├── settingsController.js ← Store settings ✅ DONE
│   │   └── shopifyController.js  ← Shopify sync ✅ DONE
│   │
│   ├── middleware/
│   │   ├── auth.js               ← JWT protect + role-based access
│   │   └── errorHandler.js       ← Global error handler
│   │
│   ├── models/
│   │   ├── User.js               ← Admin/staff user accounts
│   │   ├── Order.js              ← Orders with items, status history
│   │   ├── Customer.js           ← Customer profiles
│   │   ├── Product.js            ← Products with variants, stock
│   │   ├── Shipment.js           ← Courier shipments
│   │   ├── Conversation.js       ← Chat conversations
│   │   ├── Expense.js            ← Business expenses
│   │   ├── Setting.js            ← Store settings (key-value)
│   │   ├── ApiKey.js             ← Integration API keys
│   │   └── Webhook.js            ← Webhook configs
│   │
│   ├── routes/
│   │   ├── health.js             ← GET /api/health
│   │   ├── auth.js               ← POST /api/auth/login|register
│   │   ├── orders.js             ← GET|POST /api/orders
│   │   ├── customers.js          ← GET|POST /api/customers
│   │   ├── products.js           ← GET|POST /api/products
│   │   ├── analytics.js          ← GET /api/analytics/dashboard
│   │   ├── courier.js            ← GET|POST /api/courier
│   │   ├── financials.js         ← GET /api/financials
│   │   ├── conversations.js      ← GET|POST /api/conversations
│   │   ├── settings.js           ← GET|PUT /api/settings
│   │   └── shopify.js            ← POST /api/shopify/sync
│   │
│   ├── services/
│   │   └── shopifyService.js     ← Shopify Admin API client
│   │
│   ├── index.js                  ← Express server entry point
│   ├── package.json              ← Backend dependencies
│   └── railway.json              ← Railway deployment config
│
├── vercel.json                   ← Vercel deployment config
└── package.json                  ← Frontend dependencies
```

---

## 5. ALL API ENDPOINTS

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Create admin account |
| POST | /api/auth/login | Login, returns JWT token |
| GET | /api/auth/me | Get logged-in user profile |
| PUT | /api/auth/update-profile | Update name/avatar |
| PUT | /api/auth/change-password | Change password |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/orders | List orders (filter, search, paginate) |
| POST | /api/orders | Create new order |
| GET | /api/orders/:id | Get single order |
| PUT | /api/orders/:id/status | Update order status |
| PUT | /api/orders/:id/tracking | Update courier tracking |
| DELETE | /api/orders/:id | Delete order (admin only) |
| GET | /api/orders/stats | Order count by status |

### Customers
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/customers | List customers |
| POST | /api/customers | Create customer |
| GET | /api/customers/:id | Get customer profile |
| PUT | /api/customers/:id | Update customer |
| DELETE | /api/customers/:id | Delete customer |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/products | List products |
| POST | /api/products | Create product |
| GET | /api/products/:id | Get product |
| PUT | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/analytics/dashboard | Dashboard stats (orders, revenue, customers) |
| GET | /api/analytics/sales | Sales chart data |
| GET | /api/analytics/customers | Customer analytics |
| GET | /api/analytics/products | Top products |
| GET | /api/analytics/courier | Courier performance |

### Others
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/health | Server health check |
| POST | /api/shopify/sync | Sync from Shopify |
| GET | /api/financials | Revenue, expenses, profit |
| GET/POST | /api/conversations | Customer messages |
| GET/POST | /api/courier | Shipments |
| GET/PUT | /api/settings | Store settings |

---

## 6. ENVIRONMENT VARIABLES

### Railway (Backend)
```
MONGODB_URI        = mongodb://... (auto-set by Railway MongoDB plugin)
JWT_SECRET         = your_secret_key_here
JWT_EXPIRE         = 7d
NODE_ENV           = production
FRONTEND_URL       = https://crm-railway1.vercel.app
SHOPIFY_SHOP_DOMAIN= spunk-9041.myshopify.com
SHOPIFY_ACCESS_TOKEN= shpat_xxxx  ← NOT YET ADDED
PORT               = 8080
```

### Vercel (Frontend)
```
VITE_API_URL       = (deleted — hardcoded in code as fallback)
```

---

## 7. COMPLETION STATUS

### ✅ COMPLETED (68%)

| Module | Frontend | Backend | Notes |
|---|---|---|---|
| Auth (Login/Register) | ✅ | ✅ | JWT, bcrypt, protected routes |
| Dashboard | ✅ Wired | ✅ | Live stats from DB |
| Orders | ✅ Wired | ✅ | List, filter, status update |
| Customers | ✅ Wired | ✅ | List, profiles, history |
| Products UI | ✅ Built | ✅ | Not wired to API yet |
| Inventory UI | ✅ Built | ✅ | Not wired to API yet |
| Analytics UI | ✅ Built | ✅ | Not wired to API yet |
| Financials UI | ✅ Built | ✅ | Not wired to API yet |
| Courier UI | ✅ Built | ✅ | Not wired to API yet |
| Conversations UI | ✅ Built | ✅ | Not wired to API yet |
| Settings UI | ✅ Built | ✅ | Not wired to API yet |
| Shopify Integration | ✅ Built | ✅ | Needs API token in Railway |
| Deployment | ✅ | ✅ | Both live and running |

---

## 8. WHAT NEEDS TO BE DONE (32%)

### Priority 1 — Shopify Sync (8%)
- Add `SHOPIFY_ACCESS_TOKEN` to Railway variables
- Token starts with `shpat_` — get from Shopify Admin → Apps → Develop Apps
- Once added, call `POST /api/shopify/sync` to pull all data
- This will populate orders, customers, products automatically

### Priority 2 — Wire Remaining Pages (15%)
Each page needs `useEffect` + `api.get()` calls replacing mock data:

| Page | API Endpoint to call |
|---|---|
| Products.jsx | GET /api/products |
| Inventory.jsx | GET /api/products (with stock fields) |
| Analytics.jsx | GET /api/analytics/sales + /customers + /products |
| Financials.jsx | GET /api/financials |
| Courier.jsx | GET /api/courier |
| Conversations.jsx | GET /api/conversations |
| Settings.jsx | GET /api/settings + PUT /api/settings |

### Priority 3 — Add/Edit Forms (5%)
- Create Order form (modal)
- Create Customer form (modal)
- Create Product form (modal)
- Edit/Update for all three

### Priority 4 — Polish (4%)
- Mobile responsive layout
- Settings page fully functional (save store info, social links)
- Integrations page (connect WhatsApp, Instagram APIs)
- Custom domain setup (optional)

---

## 9. HOW AUTHENTICATION WORKS

1. User visits `https://crm-railway1.vercel.app`
2. If not logged in → redirected to Login page
3. User registers or logs in
4. Backend returns JWT token (valid 7 days)
5. Token stored in `localStorage` as `crm_token`
6. All API calls include `Authorization: Bearer <token>` header
7. Clicking "Sign Out" removes token and returns to login

---

## 10. HOW SHOPIFY SYNC WORKS

1. `SHOPIFY_ACCESS_TOKEN` is added to Railway environment variables
2. Frontend calls `POST /api/shopify/sync`
3. Backend calls Shopify Admin REST API:
   - `GET /admin/api/2024-01/orders.json`
   - `GET /admin/api/2024-01/customers.json`
   - `GET /admin/api/2024-01/products.json`
4. Data is mapped and saved to MongoDB
5. Existing records matched by `shopifyId` (no duplicates)
6. Dashboard and pages immediately show real Shopify data

---

## 11. KNOWN ISSUES FIXED

| Issue | Fix Applied |
|---|---|
| "Host not in allowlist" | Downgraded dotenv to v16 |
| Server not starting on Railway | Fixed `app.listen` always called |
| "Cannot find module axios" | Added axios to package.json |
| PORT conflict | Deleted PORT variable, then set to 8080 |
| CORS blocking login | Updated cors() to allow all origins |
| "next is not a function" | Removed `next` param from Mongoose 8 async hooks |
| Railway deploying wrong branch | Confirmed branch = claude/nice-volta-6g81M |
| Networking port mismatch | Updated Railway domain port from 5000 to 8080 |
| VITE_API_URL not working | Hardcoded Railway URL as fallback in AuthContext |

---

## 12. FOR THE DEVELOPER — NEXT STEPS

If you are taking over this project, here is exactly what to do next:

### Step 1 — Clone & Run Locally
```bash
git clone https://github.com/nomaanibrahim0336-ctrl/CRM-
cd CRM-
git checkout claude/nice-volta-6g81M

# Frontend
npm install
npm run dev

# Backend
cd server
npm install
# Create server/.env with variables from Section 6
node index.js
```

### Step 2 — Wire Remaining Pages
Each unwired page follows this pattern:
```jsx
import api from '../utils/api';

useEffect(() => {
  api.get('/api/ENDPOINT').then(data => {
    if (data.success) setState(data.data);
  });
}, []);
```

### Step 3 — Add Shopify Token
Add `SHOPIFY_ACCESS_TOKEN=shpat_xxx` to Railway variables.
Then call `POST /api/shopify/sync` with the JWT token.

### Step 4 — Merge to Main
When ready for production, merge `claude/nice-volta-6g81M` into `main`.

---

*Document generated: June 2026*
*CRM built for SPUNK Store — Pakistan*
