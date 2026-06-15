# 🌸 Petal & Bow — MERN Stack E-Commerce Platform

A full-stack e-commerce platform for girl accessories built with **MongoDB, Express, React, and Node.js**.

---

## ✨ Features

### Customer Storefront
- Hero banner with seasonal campaign
- 49 products across 7 categories — Hair, Bags, Rings, Necklaces, Earrings, Sunglasses, Bracelets
- Category filtering, live search, and sort (price, featured, A–Z)
- Product detail page with quantity selector
- Shopping cart with quantity management
- Checkout form with order placement
- Order confirmation page

### Admin Dashboard
- Overview with revenue stats, top products, recent orders
- Full product CRUD — add, edit, delete with image support
- Order management — view, update status, delete
- Customer records — auto-created on checkout

---

## 🛠️ Tech Stack

| Layer     | Technology              |
|-----------|-------------------------|
| Frontend  | React 18 + Vite         |
| Backend   | Node.js + Express       |
| Database  | MongoDB (local)         |
| ODM       | Mongoose                |
| Styling   | Inline CSS (no library) |
| Fonts     | Google Fonts (Cormorant Garamond + Jost) |

---

## 📁 Project Structure

```
PETAL-BOW/
├── server/                  ← Node.js + Express backend
│   ├── models/
│   │   ├── Product.js       ← Product schema
│   │   ├── Order.js         ← Order schema
│   │   └── Customer.js      ← Customer schema
│   ├── routes/
│   │   ├── products.js      ← GET/POST/PUT/DELETE /api/products
│   │   ├── orders.js        ← GET/POST/PUT/DELETE /api/orders
│   │   └── customers.js     ← GET/POST/PUT/DELETE /api/customers
│   ├── server.js            ← Express app entry point
│   ├── seed.js              ← Populates MongoDB with sample data
│   ├── .env                 ← Environment variables
│   └── package.json
│
├── src/                     ← React frontend
│   ├── assets/              ← All images go here
│   │   ├── heroimage.jpg
│   │   ├── hair1.jpg – hair7.jpg
│   │   ├── bag1.jpg – bag7.jpg
│   │   ├── ring1.jpg – ring7.jpg
│   │   ├── necklace1.jpg – necklace7.jpg
│   │   ├── earring1.jpg – earring7.jpg
│   │   ├── sunglass1.jpg – sunglass7.jpg
│   │   └── bracelet1.jpg – bracelet7.jpg
│   ├── App.jsx              ← Full React UI (store + admin)
│   ├── api.js               ← All API fetch calls
│   ├── index.css            ← Global reset
│   └── main.jsx             ← React entry point
│
├── index.html
├── vite.config.js           ← Vite + API proxy config
└── package.json             ← Client dependencies
```

---

## ⚙️ Prerequisites

Make sure you have these installed before starting:

- **Node.js** v18 or higher → https://nodejs.org
- **MongoDB Community Server** → https://www.mongodb.com/try/download/community
- **npm** (comes with Node.js)

To verify installation, open a terminal and run:
```bash
node -v
npm -v
```

---

## 🚀 How to Run the Project

### Step 1 — Make sure MongoDB is running

MongoDB should start automatically as a Windows service after installation.
To verify, run in terminal:
```bash
tasklist | findstr mongod
```
If nothing appears, start it manually:
```bash
net start MongoDB
```

---

### Step 2 — Install server dependencies

Open a terminal in VS Code (`Ctrl + `` ` ``), then:
```bash
cd server
npm install
```

---

### Step 3 — Seed the database

This inserts all 49 products, 7 customers, and 7 sample orders into MongoDB.
Only needs to be run **once**:
```bash
npm run seed
```

Expected output:
```
✅  Connected to MongoDB
🗑️   Cleared existing collections
📦  Inserted 49 products
👥  Inserted 7 customers
📋  Inserted 7 sample orders
🌸  Seed complete!
```

---

### Step 4 — Start the backend server

```bash
npm run dev
```

Expected output:
```
✅  MongoDB connected → mongodb://127.0.0.1:27017/petalbowdb
🚀  Server running  →  http://localhost:5000
```

Keep this terminal running.

---

### Step 5 — Start the frontend (new terminal)

Click the **+** button in the VS Code terminal panel to open a second terminal, then:
```bash
cd ..
npm install
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

---

### Step 6 — Open in browser

| URL | Description |
|-----|-------------|
| http://localhost:5173 | Customer storefront |
| http://localhost:5173 → click Admin ↗ | Admin dashboard |
| http://localhost:5000/api/products | Raw API (JSON) |

---

## 🖼️ Adding Product Images

Place all images inside `src/assets/` with these exact filenames:

```
heroimage.jpg          ← Hero banner (recommended: 1440×520px)

hair1.jpg              ← Velvet Pearl Scrunchie
hair2.jpg              ← Gold Claw Clip Set
hair3.jpg              ← Satin Ribbon Headband
hair4.jpg              ← Silk Scrunchie Trio
hair5.jpg              ← Pressed Flower Hair Fork
hair6.jpg              ← Butterfly Bobby Pin Pack
hair7.jpg              ← Crystal Crown Tiara

bag1.jpg               ← Monogram Canvas Tote
bag2.jpg               ← Mini Crossbody Pouch
bag3.jpg               ← Floral Embroidered Wallet
bag4.jpg               ← Pearl Handle Clutch
bag5.jpg               ← Bow Backpack Mini
bag6.jpg               ← Pastel Bucket Bag
bag7.jpg               ← Wristlet Phone Pouch

ring1.jpg              ← Floral Midi Ring Set
ring2.jpg              ← Rose Quartz Statement
ring3.jpg              ← Butterfly Signet Ring
ring4.jpg              ← Daisy Enamel Ring
ring5.jpg              ← Twisted Infinity Band
ring6.jpg              ← Pearl Cluster Ring
ring7.jpg              ← Crystal Birthstone Ring

necklace1.jpg          ← Layered Gold Necklace Set
necklace2.jpg          ← Pearl Strand Choker
necklace3.jpg          ← Initial Pendant Necklace
necklace4.jpg          ← Butterfly Lariat
necklace5.jpg          ← Floral Coin Necklace
necklace6.jpg          ← Moonstone Drop Pendant
necklace7.jpg          ← Heart Locket Necklace

earring1.jpg           ← Pearl Drop Earrings
earring2.jpg           ← Crystal Hoop Set
earring3.jpg           ← Enamel Daisy Studs
earring4.jpg           ← Feather Tassel Drops
earring5.jpg           ← Butterfly Crawler Earring
earring6.jpg           ← Vintage Chandelier Drop
earring7.jpg           ← Huggie Hoop Charm

sunglass1.jpg          ← Butterfly Frame Sunnies
sunglass2.jpg          ← Cat-Eye Retro Shades
sunglass3.jpg          ← Round Wire Frame Sunglasses
sunglass4.jpg          ← Rimless Tinted Shades
sunglass5.jpg          ← Heart Shape Sunglasses
sunglass6.jpg          ← Pearl Accent Square Frame
sunglass7.jpg          ← Ombre Oval Shades

bracelet1.jpg          ← Rose Quartz Bead Bracelet
bracelet2.jpg          ← Daisy Chain Anklet
bracelet3.jpg          ← Gold Bangle Stack Set
bracelet4.jpg          ← Crystal Tennis Bracelet
bracelet5.jpg          ← Pearl Charm Bracelet
bracelet6.jpg          ← Enamel Flower Bangle
bracelet7.jpg          ← Woven Thread Bracelet Set
```

> **Tip:** If an image is missing, the app automatically shows a gradient placeholder with an emoji. The site will never crash due to missing images.

---

## 🔌 API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products?category=Hair` | Filter by category |
| GET | `/api/products?search=pearl&sort=price-asc` | Search + sort |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get all orders |
| GET | `/api/orders?status=Shipped` | Filter by status |
| POST | `/api/orders` | Place new order (decrements stock) |
| PUT | `/api/orders/:id` | Update order status |
| DELETE | `/api/orders/:id` | Delete order |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | Get all customers |
| GET | `/api/customers/:id` | Get single customer |
| DELETE | `/api/customers/:id` | Delete customer |

---

## 🔧 Environment Variables

Located at `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/petalbowdb
```

---

## 📦 Quick Command Reference

```bash
# First time setup
cd server && npm install     # install backend packages
npm run seed                 # populate database (run once)
npm run dev                  # start backend on port 5000

# In a new terminal
cd ..                        # go back to project root
npm install                  # install frontend packages
npm run dev                  # start frontend on port 5173

# Re-seed database (wipes and re-inserts all data)
cd server && npm run seed
```

---

## 🐛 Troubleshooting

| Problem | Fix |
|---------|-----|
| `MongoDB connection failed` | Run `net start MongoDB` in terminal as admin |
| `Port 5000 already in use` | Change `PORT=5001` in `server/.env` and update `vite.config.js` target |
| `Cannot find module` | Run `npm install` inside the `server/` folder |
| Images not showing | Check filenames match exactly (e.g. `hair1.jpg` not `Hair1.jpg`) |
| Products not loading | Make sure backend is running on port 5000 first |

---

*Built with 🌸 for Petal & Bow*