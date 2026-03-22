# 🛍️ Webion AR Fashion Store v3.0

A full-stack MERN e-commerce store with **3D product viewing** and **Augmented Reality try-on** — fully combined frontend + backend + admin dashboard.

---

## 🚀 Quick Start

### 1. Install frontend dependencies
```bash
npm install
```

### 2. Install backend dependencies
```bash
npm install express mongoose cors bcryptjs jsonwebtoken dotenv
```

### 3. Configure environment
```bash
cp .env .env.local
# Edit .env with your MongoDB URI
```

### 4. Start MongoDB
```bash
mongod
# or: brew services start mongodb-community
```

### 5. Start backend server
```bash
node server.cjs
# Runs on http://localhost:5000
```

### 6. Start frontend (new terminal)
```bash
npm run dev
# Runs on http://localhost:5173
```

### 7. Open the app
- **Store** → http://localhost:5173
- **Admin** → http://localhost:5173/admin.html

---

## 🔑 Admin Credentials

| Field    | Value        |
|----------|-------------|
| Admin ID | `admin001`  |
| Password | `Admin@123` |

---

## 🗂️ Project Structure

```
webion-ar/
├── src/
│   ├── App.jsx          ← Main store (React 18 + Vite)
│   ├── index.css        ← Global styles + animations
│   └── main.jsx         ← Entry point
├── public/
│   ├── models/          ← Place .glb 3D model files here
│   │   ├── red_t-shirt.glb
│   │   ├── casual_shirt.glb
│   │   ├── hight-poly_summer_formal_dress.glb
│   │   ├── navy_blue_casual_suit_with_white_jeans.glb
│   │   ├── rock_jacket_mid-poly.glb
│   │   └── traditional_saree.glb
│   ├── images/          ← Product images (optional)
│   └── favicon.svg
├── admin.html           ← Standalone admin dashboard
├── server.cjs           ← Express + MongoDB backend
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── .env
```

---

## ✨ New Features (v3.0)

### Store Frontend
- 🎲 **3D & AR Try-On** — `model-viewer` for every product
- 🔥 **Trending Carousel** — horizontal scroll of hot items
- 🔍 **Advanced Filters Panel** — price range slider, multi-sort
- 📋 **List / Grid view toggle**
- 📣 **Announcement ticker** — animated marquee banner
- 🔔 **Toast notifications** — add to cart, wishlist feedback
- ⬆️ **Scroll-to-top button** — appears after scrolling
- 📄 **Pagination** with prev/next buttons
- 🏷️ **Smart discount badges** — auto-calculated from price
- 💾 **Offline fallback** — demo products when API is down
- 🎨 **New design system** — Playfair Display + DM Sans fonts
- 📱 **Mobile responsive** grid layout
- ❤️ **Wishlist** with count badge

### Admin Dashboard
- 📊 **Analytics page** with bar/donut charts
- 📦 **Products CRUD** — add, edit, delete, bulk actions
- ⭐ **Reviews management** — read, delete, reply
- 📋 **Activity log** — color-coded timeline
- 🔔 **Notification bell** — unread review alerts
- 📤 **Export CSV** of products
- 🏆 **Top sellers leaderboard**
- 📉 **Low stock alerts panel**
- ⚙️ **Settings page** with danger zone

---

## 🎨 Design Tokens

```css
--gold:       #C9A84C
--gold-light: #F0D080
--bg-base:    #060610
--bg-card:    #0E0E1A
--text:       #F2EDE4
```

---

## 🔌 API Endpoints

| Method | Endpoint                     | Auth | Description         |
|--------|------------------------------|------|---------------------|
| GET    | `/api/products`              | ❌   | List products       |
| POST   | `/api/products`              | ✅   | Create product      |
| PUT    | `/api/products/:id`          | ✅   | Update product      |
| DELETE | `/api/products/:id`          | ✅   | Delete product      |
| GET    | `/api/reviews`               | ✅   | List reviews        |
| POST   | `/api/reviews`               | ❌   | Submit review       |
| PATCH  | `/api/reviews/:id/read`      | ✅   | Mark review read    |
| DELETE | `/api/reviews/:id`           | ✅   | Delete review       |
| GET    | `/api/stats`                 | ✅   | Dashboard stats     |
| POST   | `/api/admin/login`           | ❌   | Admin login         |

---

## 📦 Fix Tailwind CDN Warning

The `admin.html` uses the Tailwind CDN for convenience. To remove the warning for production:

```bash
npx tailwindcss -i ./src/index.css -o ./public/admin.css --content ./admin.html --minify
```

Then replace the CDN script tag in `admin.html` with:
```html
<link rel="stylesheet" href="/public/admin.css">
```

---

## 🛠️ Tech Stack

| Layer     | Technology                     |
|-----------|-------------------------------|
| Frontend  | React 18 + Vite + Tailwind CSS |
| 3D/AR     | Google `model-viewer`          |
| Icons     | Lucide React                   |
| Backend   | Node.js + Express              |
| Database  | MongoDB + Mongoose             |
| Auth      | JWT + bcryptjs                 |
| Fonts     | Playfair Display + DM Sans     |

---

## 📄 License

MIT — Built with ❤️ by Webion
