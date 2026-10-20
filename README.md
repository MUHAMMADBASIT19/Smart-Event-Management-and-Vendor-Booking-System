# 🎉 Smart Event Management and Vendor Booking System

A full-stack web platform for organizing and booking events, connecting **customers**, **vendors**, and **admins** in one place.

[![Node.js](https://img.shields.io/badge/Node.js-v16%2B-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-orange)](https://www.sqlite.org/)
[![License](https://img.shields.io/badge/License-ISC-yellow)](LICENSE)

---

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [Seeding Demo Data](#seeding-demo-data)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)
- [Known Limitations](#known-limitations)

---

## Project Overview

This is a **Full-Stack Event Organization System** with three portals:

| Portal | URL | Who Uses It |
|--------|-----|-------------|
| Customer App | `http://localhost:3000` | End users — browse, book & review events |
| Vendor Portal | `http://localhost:3001` | Vendors — list events, manage bookings & bids |
| Backend API | `http://localhost:5000` | Serves all data via REST + WebSocket |

### Features
- 🔐 JWT-based authentication (users & vendors)
- 📅 Event booking with date/time slot management
- 💬 Real-time messaging between customers and vendors (Socket.IO)
- 🗺️ Location-based event search using the Haversine formula
- 💰 PayPal payment integration
- ⚡ Live bidding system with real-time bid updates
- ⭐ Event reviews and ratings
- 👤 Admin dashboard with sales summary & analytics
- 📁 File/image uploads for events and vendor verification

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Bootstrap 5, Material-UI v4 |
| Vendor Portal | React 18, Bootstrap 5 |
| Backend | Node.js, Express 4, Socket.IO |
| Database | SQLite (via Sequelize ORM) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Payments | PayPal REST SDK |
| File Uploads | Multer |

---

## Prerequisites

Install the following before you begin:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v16 or higher | [nodejs.org](https://nodejs.org/) |
| npm | Comes with Node.js | — |
| Git | Optional | [git-scm.com](https://git-scm.com/) |

**Verify your installation:**
```bash
node --version    # Should print v16.x.x or higher
npm --version     # Should print 8.x.x or higher
```

---

## Project Structure

```
FYP-main/
├── backend/                # Express API server
│   ├── models/             # Sequelize database models
│   ├── routes/             # API route handlers
│   ├── public/uploads/     # Uploaded images (auto-created)
│   ├── database.sqlite     # SQLite database file (auto-created)
│   ├── server.js           # Entry point
│   └── .env                # Environment variables (create this)
├── frontend/               # Customer-facing React app
│   └── src/
├── vendor/                 # Vendor React portal
│   └── src/
├── package.json            # Root scripts (run both apps at once)
└── README.md
```

---

## Installation

### Step 1 — Get the project
```bash
# Clone from GitHub
git clone https://github.com/AliAamir11/Event-Organization-System.git
cd FYP-main

# OR if you already have the folder just open a terminal inside it
```

### Step 2 — Install backend dependencies
```bash
cd backend
npm install
cd ..
```

### Step 3 — Install frontend dependencies
```bash
cd frontend
npm install --legacy-peer-deps
cd ..
```

### Step 4 — Install vendor portal dependencies
```bash
cd vendor
npm install --legacy-peer-deps
cd ..
```

> **Why `--legacy-peer-deps`?** The frontend uses Material-UI v4, which officially supports React 16/17. The flag tells npm to install anyway and the app works fine.

---

## Configuration

### Create `backend/.env`

Create a file named `.env` inside the `backend/` folder with this content:

```env
# Server Port
PORT=5000

# JWT Secret — change this to any long random string in production
JWT_SECRET=my_super_secret_key_change_me_in_production_32chars

# PayPal (use "sb" for sandbox testing, or your real Client ID)
PAYPAL_CLIENT_ID=sb
```

> ⚠️ Never commit your `.env` file to Git. It's already listed in `.gitignore`.

---

## Running the Project

### Option A — Run all three separately (Recommended for development)

Open **3 terminal windows**, one for each:

**Terminal 1 — Backend:**
```bash
cd backend
npm start
```
✅ Expected output:
```
serve at http://localhost:5000
Database synced successfully
```

**Terminal 2 — Frontend (Customer App):**
```bash
cd frontend
npm start
```
✅ Opens automatically at: `http://localhost:3000`

**Terminal 3 — Vendor Portal:**
```bash
cd vendor
npm start
```
✅ Opens at: `http://localhost:3001`

---

### Option B — Run backend + frontend together (One command)

```bash
# From the root FYP-main folder
npm install
npm run dev
```

---

## Seeding Demo Data

After the backend is running, load sample events and admin accounts by visiting this URL in your browser:

```
http://localhost:5000/api/seed
```

This creates:
- ✅ 2 admin user accounts
- ✅ Sample events

## API Endpoints

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List all events |
| GET | `/api/events/search?query=...` | Search & filter events |
| GET | `/api/events/categories` | Get distinct categories |
| GET | `/api/events/:id` | Get single event |
| POST | `/api/events` | Create event (Vendor) |
| PUT | `/api/events/:id` | Update event (Admin) |
| DELETE | `/api/events/:id` | Delete event (Admin) |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/signup` | Register new user |
| POST | `/api/users/signin` | Login |
| PUT | `/api/users/profile` | Update profile |
| GET | `/api/users/:id/favorites` | Get favorites |

### Orders / Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create a booking |
| GET | `/api/orders/mine` | My bookings |
| GET | `/api/orders/:id` | Single order |
| PUT | `/api/orders/:id/pay` | Mark as paid |

### Vendors
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/vendor` | Register vendor |
| POST | `/api/vendor/signIn` | Vendor login |
| GET | `/api/vendor` | All vendors (Admin) |
| PUT | `/api/vendor/:id/changestatus` | Approve/reject vendor |

### Bidding
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bid` | All bids |
| POST | `/api/bid` | Create bid |
| PUT | `/api/bid/:id` | Update bid (real-time via Socket.IO) |

---

## Troubleshooting

### ❌ Port already in use
```bash
# Windows — find and kill the process
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### ❌ "Cannot find module" errors
```bash
# Delete and reinstall dependencies
cd backend
rmdir /s /q node_modules
npm install
```

### ❌ Frontend shows "Proxy error: Could not proxy request"
- Make sure the **backend is running** on port 5000 before starting the frontend
- Check `frontend/package.json` contains: `"proxy": "http://localhost:5000"`

### ❌ Blank screen or React errors
- Open browser DevTools (F12) → Console tab for specific errors
- Make sure you ran `npm install --legacy-peer-deps` in the `frontend/` folder

### ❌ Database / SQLite errors
```bash
# Reset the database
del backend\database.sqlite    # Windows
# Then restart the backend — it will auto-recreate the file
# Then re-seed: http://localhost:5000/api/seed
```

### ❌ Image uploads not working
- The `backend/public/uploads/` folder is created automatically on first upload
- Make sure the backend is running when you upload

---

## Known Limitations

| Item | Status |
|------|--------|
| Material-UI v4 | ⚠️ Deprecated — works with `--legacy-peer-deps`, upgrade to MUI v5 for long-term |
| SQLite | ⚠️ Not suitable for high-traffic production — switch to PostgreSQL or MySQL |
| Google Maps API key | ⚠️ Hardcoded in source — move to `.env` for production |
| PayPal | ⚠️ Uses `"sb"` sandbox mode by default — set real `PAYPAL_CLIENT_ID` for live payments |

---

## For Production Deployment

1. Replace SQLite with **PostgreSQL** or **MySQL** (update `backend/db.js` and Sequelize models)
2. Set a strong random `JWT_SECRET` (at least 32 characters)
3. Move the Google Maps API key to environment variables
4. Set real PayPal `PAYPAL_CLIENT_ID`
5. Enable HTTPS via a reverse proxy (Nginx / Apache)
6. Use a process manager like **PM2** for the backend

---

## License

ISC — See [LICENSE](LICENSE) for details.

---

*Last updated: March 2026*
