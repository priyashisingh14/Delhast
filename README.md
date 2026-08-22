# 🍔 Delhast — Campus Food Delivery & Student Portal

> **A modern, full-stack peer-to-peer campus food delivery and verified student authentication platform built on the MERN stack with Socket.IO, Google Gemini Multimodal Vision AI, and Brevo/Resend email infrastructure.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-delhast.onrender.com-236B48?style=for-the-badge&logo=render)](https://delhast.onrender.com)
[![MERN Stack](https://img.shields.io/badge/Stack-MongoDB%20%7C%20Express%20%7C%20React%20%7C%20Node-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com)
[![Socket.IO](https://img.shields.io/badge/Real--Time-Socket.IO-black?style=for-the-badge&logo=socket.io)](https://socket.io)
[![Gemini Vision AI](https://img.shields.io/badge/AI%20Vision-Google%20Gemini%203.6-4285F4?style=for-the-badge&logo=google)](https://aistudio.google.com)

---

## 📌 Overview

**Delhast** is a campus-centric platform designed for college and university ecosystems. It solves two major student needs:
1. **Peer-to-Peer Food Delivery**: Students in hostel rooms can order meals from any campus canteen, while fellow students walking by the canteen can pick up orders and earn delivery fees.
2. **Verified Student Identity**: Ensures only legitimate campus students can participate through email OTP verification and **Google Gemini Vision AI** ID card analysis.

---

## ✨ Key Features

### 🎓 1. 4-Step Verified Student Authentication
- **Step 1: Real-Time Email OTP Verification**: Dispatches a cryptographically generated 6-digit OTP code to the student's Gmail via HTTPS REST APIs (Brevo / Resend) with 5-minute expiry, cooldown protection, and rate limiting.
- **Step 2: Student Profile Details**: Captures full name, Indian mobile number (`+91` 10-digit validation), and student college Registration / Roll Number.
- **Step 3: AI Vision ID Card Verification**: Analyzes uploaded student ID card photos with **Google Gemini 3.6 Flash Multimodal Vision AI** to verify that the Name and Registration Number on the card match the entered details.
- **Step 4: Secure Password Creation**: Enforces strong password rules (8+ chars, uppercase, lowercase, numbers, symbols) and secures credentials with `bcrypt` salt hashing.
- **🔄 Instant Session Recovery**: Automatic session restoration on browser revisit; authenticated students are seamlessly directed straight to their `/dashboard`.

---

### 🛵 2. Campus Food Delivery & Order Management
- **Available Deliveries Feed**: Real-time listing of student meal requests across all campus canteens, displaying pickup location, drop-off hostel/room, delivery fee, item details, and timestamp.
- **My Food Orders Tab**: Track your placed food orders in real-time, view live delivery statuses, and chat with your assigned delivery peer.
- **My Deliveries Tab**: Manage orders you have accepted to deliver, advance delivery stages, and earn delivery fees.
- **Atomic Acceptance & Concurrency**: Atomic MongoDB operations ensure an order can only be accepted by one delivery person, preventing race conditions.
- **4-Stage Delivery Lifecycle**:
  $$\text{AVAILABLE} \longrightarrow \text{ACCEPTED} \longrightarrow \text{PICKED\_UP} \longrightarrow \text{DELIVERED}$$
  *(or $\text{CANCELLED}$ if aborted before pickup)*

---

### 💬 3. Real-Time In-App Chat (Socket.IO)
- **Direct Order Chat**: Private, low-latency communication channel established between the customer and their delivery partner upon order acceptance.
- **Verified Registration Number Badge**: Chat header displays the student's verified campus Registration Number (`Reg. No: XXXXX`) for trust and verification.
- **Interactive Messaging**: Real-time typing indicators, read receipts, and automatic message scroll.
- **Live Unread Badges**: Real-time notification counters on feed tabs and order cards.
- **Post-Delivery Archival**: Automatically locks conversations into read-only mode once the meal is marked delivered.

---

## 🏗️ System Architecture

```
                                  REACT CLIENT (Vite + Tailwind CSS)
                             ├── Zustand Auth Store & Synchronous Storage
                             ├── React Router v6 (Auto-Routing & Guards)
                             ├── Socket.IO Client (Bidirectional Events)
                             └── Axios HTTP Client (Interceptors & Tokens)
                                                 │
                                                 ▼ [HTTPS REST API + WSS]
                                       EXPRESS SERVER (Node.js)
                             ├── Security: Helmet, CORS, Rate Limiters, Trust Proxy
                             ├── Middlewares: Cookie Parser, Auth JWT Guard, Multer
                             └── Services Layer:
                                  ├── Auth Service (JWT + Refresh Session Rotation)
                                  ├── Gemini Vision AI (Multimodal ID Card Analysis)
                                  ├── Email Service (Brevo / Resend / Gmail SMTP)
                                  └── Booking & Order Service (Atomic Transitions)
                                                 │
                                                 ▼
                                        MONGODB ATLAS DATABASE
                             ├── Users (Unique email, phone, regNo)
                             ├── Orders (Status workflow, customer/delivery refs)
                             ├── Messages (Chat history, read receipts)
                             ├── Otps (Hashed codes with TTL auto-expiry)
                             └── SignupSessions (Multi-step verification state)
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Zustand, React Router DOM |
| **Backend** | Node.js, Express.js, Socket.IO, Mongoose, Multer, Zod, BcryptJS, JSON Web Tokens |
| **Database** | MongoDB Atlas (Cloud Database) |
| **AI / Vision** | Google Gemini 3.6 Flash Multimodal Vision API (`@google/genai`) |
| **Email Delivery** | Brevo HTTPS REST API, Resend HTTPS API, Nodemailer |
| **Deployment** | Render (Unified Full-Stack Web Service) |

---

## 📁 Project Structure

```
college-portal/
├── client/                     # React Frontend (Vite)
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── api/                # API client with Axios interceptors
│   │   ├── components/         # Modular UI & Layout components
│   │   │   ├── common/         # Buttons, Inputs, Cards, Modals
│   │   │   ├── layout/         # AppNavbar, Footer, AuthLayout
│   │   │   └── signup/         # Step 1-4 Signup Pipeline Components
│   │   ├── pages/              # DashboardPage, ChatPage, BookingPage, SignUpPage, SignInPage
│   │   ├── socket/             # Socket.IO client instance & event listeners
│   │   ├── store/              # Zustand Auth Store (useAuthStore.js)
│   │   ├── App.jsx             # Top-level Routing & Protected Route Guards
│   │   └── main.jsx            # React root mount
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Express Backend Server
│   ├── src/
│   │   ├── config/             # Environment variables (Zod) & DB connection
│   │   ├── controllers/        # Auth, Identity, Booking, and Chat controllers
│   │   ├── middleware/         # Auth verification, rate limiting, error handler
│   │   ├── models/             # Mongoose schemas (User, Order, Message, OTP, SignupSession)
│   │   ├── routes/             # Express API route declarations
│   │   ├── services/
│   │   │   ├── auth/           # JWT generation, token refresh, authentication
│   │   │   ├── booking/        # Order lifecycle & state progression logic
│   │   │   ├── chat/           # Chat persistence & message retrieval
│   │   │   ├── email/          # BrevoProvider, ResendProvider, GmailProvider
│   │   │   ├── identity/       # Identity verification & matchers
│   │   │   └── ocr/            # GeminiVisionService & image preprocessing
│   │   ├── socket/             # Socket.IO connection handlers & rooms
│   │   ├── utils/              # Normalizers, homoglyph matchers, logger
│   │   ├── app.js              # Express app configuration & static SPA serving
│   │   └── server.js           # HTTP + Socket.IO server entrypoint
│   └── package.json
│
├── package.json                # Root package with unified build & start scripts
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `server/` directory (and configure on your cloud platform):

```env
# Application Environment
NODE_ENV=production
PORT=5000
CLIENT_URL=https://delhast.onrender.com

# Database Connection (MongoDB Atlas)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/delhast?retryWrites=true&w=majority

# JWT Security Keys
JWT_ACCESS_SECRET=your_super_secret_access_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key
JWT_RESET_SECRET=your_super_secret_reset_jwt_key

# Email Delivery Provider (Brevo or Resend)
BREVO_API_KEY=xkeysib-your_brevo_api_key_here
RESEND_API_KEY=re_your_resend_api_key_here
EMAIL_FROM_NAME="Delhast Identity"
EMAIL_FROM_ADDRESS=delhastt@gmail.com

# Google Gemini Vision AI (For ID Card OCR Verification)
GEMINI_API_KEY=your_gemini_api_key_here

# Settings
ENFORCE_MASTER_STUDENT_DB=false
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v18+ or v20+
- **MongoDB**: Local instance or free MongoDB Atlas cluster

### 2. Installation
Clone the repository and install all root, server, and client dependencies:
```bash
git clone https://github.com/priyashisingh14/Delhast.git
cd Delhast
npm run install:all
```

### 3. Run Development Server
Start both backend (`localhost:5000`) and frontend (`localhost:5173`) concurrently:
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser!

---

## 🌐 Production Deployment (Render)

This repository is pre-configured for single-service full-stack deployment on **Render**:

1. Create a new **Web Service** on [Render](https://dashboard.render.com).
2. Connect your GitHub repository: `https://github.com/priyashisingh14/Delhast`.
3. Configure the service settings:
   - **Environment**: `Node`
   - **Build Command**: `npm run install:all && npm run build`
   - **Start Command**: `npm start`
4. Add the **Environment Variables** listed above.
5. Click **Deploy Web Service** — Render builds the Vite client, starts Express, and serves the full application under a single unified URL (e.g. `https://delhast.onrender.com`)!

---

## 📡 API Reference Overview

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/send-otp` | Generate and email a 6-digit verification code |
| `POST` | `/verify-otp` | Verify 6-digit OTP code and create signup session |
| `POST` | `/save-details` | Save student name, phone, and registration number |
| `POST` | `/verify-id-card` | Upload ID card photo & verify with Gemini Vision AI |
| `POST` | `/set-password` | Set account password & complete registration |
| `POST` | `/signin` | Authenticate with email & password |
| `POST` | `/refresh` | Silent session token refresh via HttpOnly cookie |
| `POST` | `/logout` | Revoke active session and clear cookie |

### 📦 Food Orders & Deliveries (`/api/bookings`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/` | Create a new food delivery order |
| `GET` | `/` | Retrieve orders list by feed tab (`available`, `my_orders`, `my_deliveries`) |
| `GET` | `/:orderId` | Get detailed order status and delivery participant info |
| `POST` | `/:orderId/accept` | Accept an available order for delivery (atomic) |
| `PATCH` | `/:orderId/status` | Update delivery stage (`PICKED_UP`, `DELIVERED`, `CANCELLED`) |
| `DELETE` | `/:orderId` | Cancel a pending food order |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
