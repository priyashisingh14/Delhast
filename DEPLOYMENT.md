# 🚀 Delhast Platform — Complete Production Deployment Guide

This guide walks you through deploying the Delhast MERN-stack platform to the cloud with real-time WebSockets, MongoDB, and student verification.

---

## ⚡ Option 1: 1-Click Deploy on Render.com (Recommended)

Render offers free hosting with native support for Node.js, WebSockets (Socket.IO), and SPA routing.

### Step 1: Push your code to GitHub
```bash
git init
git add .
git commit -m "Production release: Delhast platform"
git remote add origin https://github.com/your-username/delhast-portal.git
git push -u origin main
```

### Step 2: Create Web Service on Render
1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Select your GitHub repository (`delhast-portal`).
4. Set the following settings:
   - **Name**: `delhast-app`
   - **Environment**: `Node`
   - **Branch**: `main`
   - **Build Command**: `npm run install:all && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### Step 3: Configure Environment Variables
In the Render dashboard under **Environment Variables**, add:

| Key | Example Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Enables production caching & static serving |
| `PORT` | `10000` | Port provided automatically by Render |
| `MONGODB_URI` | `mongodb+srv://<user>:<pwd>@cluster0.xxx.mongodb.net/delhast` | Your MongoDB Atlas connection URI |
| `JWT_ACCESS_SECRET` | `4b9f29a0e6378e9b...` (Generate random 64-char string) | Secret for short-lived access tokens |
| `JWT_REFRESH_SECRET` | `8c1e34a7d1891b2c...` (Generate random 64-char string) | Secret for 30-day refresh tokens |
| `EMAIL_PROVIDER` | `gmail` | Email OTP provider |
| `GMAIL_USER` | `delhastt@gmail.com` | Verified Gmail account |
| `GMAIL_APP_PASSWORD` | `your-16-character-app-password` | Google 16-character App Password |
| `CLIENT_URL` | `https://delhast-app.onrender.com` | Your live Render application URL |

5. Click **Deploy Web Service** — in 2-3 minutes your app will be live with HTTPS!

---

## 🚂 Option 2: Deploy on Railway.app

1. Go to [railway.app](https://railway.app).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Railway automatically detects `package.json` and runs:
   - Build: `npm run build`
   - Start: `npm start`
4. Add the same Environment Variables in the **Variables** tab.
5. In **Settings** → **Networking**, click **Generate Domain**.

---

## 🐳 Option 3: Deploy with Docker

A multi-stage production `Dockerfile` is included.

### Build the Docker image:
```bash
docker build -t delhast-app:latest .
```

### Run the container:
```bash
docker run -p 5000:5000 \
  -e NODE_ENV=production \
  -e MONGODB_URI="mongodb+srv://..." \
  -e JWT_ACCESS_SECRET="your_secret" \
  -e JWT_REFRESH_SECRET="your_secret" \
  -e GMAIL_USER="delhastt@gmail.com" \
  -e GMAIL_APP_PASSWORD="your_password" \
  -e CLIENT_URL="http://localhost:5000" \
  delhast-app:latest
```

---

## 🛡️ Production Checklist

- [x] All 26 End-to-End integration & real-time tests passed.
- [x] Production SPA static serving configured with route fallbacks in Express.
- [x] CORS configured for production domain and all HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
- [x] Dynamic Socket.IO fallback supporting single-origin and decoupled origins.
- [x] Rate limiting active (`express-rate-limit`) on sensitive OTP and auth endpoints.
- [x] Strict read-only chat enforcement for delivered orders.
