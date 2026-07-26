# Time Tailor — Inventory Management System

A MERN stack (MongoDB, Express, React, Node) inventory & POS-style management system for a retail/tailoring business. Tracks products with size and colour variants, sales, stock additions, and a full immutable movement history.

## Structure

```
time-tailor/
├── server/     Express + MongoDB API
└── client/     React + Vite + Tailwind CSS frontend
```

## Getting started

### 1. Backend

```bash
cd server
cp .env.example .env     # then edit MONGO_URI / JWT_SECRET as needed
npm install
npm run seed              # creates an admin user + sample products
npm run dev                # starts the API on http://localhost:5000
```

Seed login: `admin@timetailor.com` / `admin123`

### 2. Frontend

```bash
cd client
npm install
npm run dev                # starts the app on http://localhost:5173
```

Set `VITE_API_URL` in a `client/.env` file if your API isn't on `http://localhost:5000/api`.

## Core design decisions

- **Stock can only change through Add Stock or Sell Stock.** There is no endpoint or UI to edit a stock number directly — every change is either a `SALE` or `ADD_STOCK` movement (plus `RETURN`/`ADJUSTMENT` for edge cases), so the ledger in `InventoryHistory` is always complete and nothing is ever deleted.
- **Sales and stock-ins run inside a MongoDB transaction** (`mongoose.startSession()` / `withTransaction`). A sale that spans multiple sizes (or even multiple products) either fully succeeds or fully rolls back, and stock is checked against the live document inside the transaction so it can never go negative.
- **Variants model both plain sizes and size+colour combinations.** A product like Half Pant has variants with `color: null`; House Dress has one variant per size/colour pair. `hasColors` on the product controls which UI fields appear.
- **Role-based access**: `admin` can add/sell stock, edit products, and view reports/history; `staff` can view products and sales history only. Enforced both by the `authorize()` middleware on the API and by `ProtectedRoute` on the frontend (defense in depth — never rely on the frontend check alone).

## API overview

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/login` | Log in, returns JWT |
| GET | `/api/products` | List products (search, category filters) |
| GET | `/api/products/:id` | Full product + variants |
| POST | `/api/products` | Create product (admin) |
| POST | `/api/products/:id/variants` | Add a new size/colour (admin) |
| POST | `/api/stock/in` | Add stock to one or more sizes (admin) |
| POST | `/api/sales` | Record a sale across one or more sizes (admin) |
| GET | `/api/sales` | Sales history with date-range/search filters |
| GET | `/api/history` | Full inventory ledger (admin) |
| GET | `/api/history/product/:id` | Movement history for one product |
| GET | `/api/reports` | Daily/weekly/monthly/custom stock report (admin) |
| GET | `/api/dashboard/summary` | Dashboard cards + recent activity |

## Deployment

### One-Click Deploy (Railway / Render / Fly.io)

The project is configured as a **single deployable unit** — the backend serves the built frontend automatically in production mode.

```bash
# 1. Build the frontend
npm run build

# 2. Set these environment variables on your hosting platform:
#    MONGO_URI      — your MongoDB Atlas connection string
#    JWT_SECRET     — a long, random secret
#    NODE_ENV       — "production"
#    CLIENT_URL     — your deployed domain (for CORS)

# 3. Start command (auto-detected from Procfile):
#    cd server && node server.js
```

Your data is stored in **MongoDB Atlas** — it persists after deployment as long as you use the same `MONGO_URI`.

### Deploy to Railway (Recommended)

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
3. Add environment variables from `.env.example`
4. Railway auto-detects the `Procfile` — no extra config needed
5. Your app is live at `https://<project>.railway.app`

### Deploy to Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New Web Service → Connect repo
3. **Build Command**: `npm install && npm run build`
4. **Start Command**: `npm start`
5. Add environment variables from `.env.example`

### Deploy to Vercel (Frontend Only)

If you prefer a **separate** frontend/backend deployment:

**Frontend:**
```bash
cd client
vercel --prod
```
Set `VITE_API_URL` to your deployed backend URL in Vercel's environment variables.

**Backend:** Deploy via Railway/Render using the instructions above.

### Deploy with Docker

```bash
# Build the image
docker build -t time-tailor .

# Run it
docker run -p 5000:5000 \
  -e MONGO_URI="your_atlas_uri" \
  -e JWT_SECRET="your_secret" \
  -e NODE_ENV=production \
  time-tailor
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | ❌ | Token expiry (default: `7d`) |
| `CLIENT_URL` | ✅ | Your frontend domain (for CORS) |
| `PORT` | ❌ | Server port (default: `5000`) |
| `RATE_LIMIT_MAX` | ❌ | Max API requests per 15 min (default: `200`) |
| `LOW_STOCK_THRESHOLD` | ❌ | Low stock alert threshold (default: `5`) |
| `NODE_ENV` | ❌ | Set to `production` for deployment |

### Seed Data on Production

After deploying, seed your production database with an admin user:

```bash
# From local terminal — replace URI with your production MONGO_URI
MONGO_URI="your_production_uri" npm run seed
```

**Seed login:** `admin@timetailor.com` / `admin123`

### Important: Data Safety

- ✅ **Your data is NOT lost on deployment** — it lives in MongoDB Atlas, not on your local machine
- ✅ **Using the same Atlas URI in production** = all your data carries over
- ✅ **Local data stays untouched** — deployment doesn't affect your development database
- ❌ **Don't use `localhost` as `MONGO_URI`** in production — the cloud server can't connect to your local MongoDB

# inventory-management
# stock
# stock
