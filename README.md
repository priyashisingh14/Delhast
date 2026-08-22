

---

## 2. Key Features

- 🎓 **Multi-Step Verified Signup**:
  - **Step 1 (Gmail OTP)**: Verifies legitimate `@gmail.com` or `@googlemail.com` student email with cryptographically generated 6-digit OTPs (HMAC-hashed in DB, 5-min expiry, 60s cooldown, max 5 attempts).
  - **Step 2 (Student Details)**: Validates full name, Indian mobile number (`+91` 10 digits starting with 6–9), and college registration number (e.g. `23CSE101`).
  - **Step 3 (College ID Card OCR)**: Image validation with `sharp` + OCR text extraction (Tesseract.js WASM engine). Compares extracted Name & Registration Number against entered values and verifies active status in the College Master Student Database.
  - **Step 4 (Password Setup)**: Sets secure password with live strength verification (8+ chars, uppercase, lowercase, number, symbol), enforces database-level uniqueness across email, phone, and registration number, and creates the permanent account.
- 🔐 **Session Persistence & Rotation**:
  - 15-minute short-lived access credentials (JWT).
  - 30-day long-lived refresh sessions stored in secure `HttpOnly`, `SameSite`, `Secure` cookies.
  - Silent token refresh via Axios response interceptors.
- 🚪 **Complete Revocation & Logout**:
  - `POST /api/auth/logout` invalidates session tokens in MongoDB and clears client cookies.
- 🔄 **Forgot Password Recovery**:
  - Registered Gmail -> Verification OTP -> Single-use short-lived Reset Authorization Token -> New Password -> Invalidation of all existing active sessions across all devices.
  - Uniform generic response prevents account enumeration.
- 🎨 **Academic Modern Design**:
  - Custom palette: Soft lavender, muted violet, warm peach, subtle rose, and cream.
  - Responsive across Mobile, Tablet, Laptop, and Desktop with smooth Framer Motion transitions.

---

## 3. Architecture Overview

```
                         REACT FRONTEND (Vite)
                     (RHF + Zod + Zustand + Axios)
                                   │
                                   ▼ [REST API + HttpOnly Cookies]
                         EXPRESS API SERVER
                    (Helmet, Rate Limit, Multer)
                                   │
       ┌───────────────────────────┼───────────────────────────┐
       ▼                           ▼                           ▼
  Auth Service               Email Service              Identity Service
  ├── Access JWT             ├── Email Provider          ├── Sharp Preprocessor
  ├── 30-Day Sessions            Interface               ├── OCR Engine (WASM)
  └── Temporary Signup       ├── Gmail Provider (SMTP)   ├── Text Extractor
       Sessions              └── Mock Provider           ├── Name/Reg Matcher
                                                         └── Master Student DB
                                   │
                                   ▼
                          MONGODB DATABASE
                ├── Users (Unique: email, phone, regNo)
                ├── OTPs (Hashed, TTL Auto-Expiry)
                ├── Sessions (30-day TTL, Revocable)
                ├── Reset Tokens (Single-use, TTL)
                └── MasterStudents (College Records)
```

---

## 4. Technology Stack

### Backend
- **Node.js (v20+) & Express.js (v4)**: High-performance RESTful API server.
- **MongoDB & Mongoose (v8)**: Document database with schema-level unique indexes and TTL auto-cleanup.
- **Nodemailer**: SMTP email transport.
- **Tesseract.js (v6)**: Pure JavaScript/WASM OCR engine requiring zero system dependencies.
- **Sharp (v0.33)**: High-speed image preprocessing (grayscale, contrast normalization, thresholding, deskewing).
- **Zod (v3)**: Schema validation across all API endpoints.
- **Bcryptjs**: Password hashing (12 salt rounds) & HMAC-SHA256 token hashing.
- **Jsonwebtoken**: Access token creation and verification.
- **Helmet & Express-Rate-Limit**: Production HTTP headers and route-specific rate limiting.

### Frontend
- **React 19 & Vite**: Ultra-fast single page application.
- **Tailwind CSS**: Custom academic design system.
- **Framer Motion**: Smooth step transitions and modals.
- **React Hook Form & @hookform/resolvers**: High-performance form state management.
- **Zustand**: Lightweight global auth state with automatic 30-day session hydration.
- **Axios**: HTTP client with silent token refresh interceptors.
- **Lucide React**: Clean icons.

---

## 5. Folder Structure

```
college-portal/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   ├── apiClient.js          # Axios instance + silent refresh interceptor
│   │   │   └── authApi.js            # Typed API calls
│   │   ├── components/
│   │   │   ├── common/               # Button, Input, Card, Modal, Badge
│   │   │   ├── layout/               # Navbar, Footer, AuthLayout
│   │   │   └── signup/               # StepIndicator, Step1-4 components
│   │   ├── pages/
│   │   │   ├── SignUpPage.jsx        # Initial page / registration wizard
│   │   │   ├── SignInPage.jsx        # Login page
│   │   │   ├── ForgotPasswordPage.jsx# 3-step password recovery flow
│   │   │   ├── DashboardPage.jsx     # Verified student dashboard
│   │   │   └── NotFoundPage.jsx
│   │   ├── schemas/
│   │   │   └── authSchemas.js        # Frontend Zod schemas
│   │   ├── store/
│   │   │   └── useAuthStore.js       # Zustand authentication store
│   │   ├── utils/
│   │   │   └── sampleCardRenderer.js # Sample card SVG renderer
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # Mongo connection + auto in-memory fallback
│   │   │   └── env.js                # Validated environment configuration
│   │   ├── constants/
│   │   │   └── otpPurposes.js        # EMAIL_VERIFICATION, PASSWORD_RESET
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── email.controller.js
│   │   │   ├── identity.controller.js
│   │   │   └── password.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js    # JWT authorization header check
│   │   │   ├── error.middleware.js   # Centralized error + E11000 duplicate handler
│   │   │   ├── rateLimiter.middleware.js # Strict route rate limiters
│   │   │   ├── upload.middleware.js  # Multer memory storage + sharp image check
│   │   │   └── validate.middleware.js# Zod body validation
│   │   ├── models/
│   │   │   ├── user.model.js         # Unique email, phone, regNo
│   │   │   ├── otp.model.js          # Hashed OTP + TTL expiry
│   │   │   ├── signupSession.model.js# Temporary session (30-min TTL)
│   │   │   ├── session.model.js      # 30-day refresh session + revocation
│   │   │   ├── passwordResetToken.model.js # Single-use reset authorization
│   │   │   └── masterStudent.model.js# College master student database
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── email.routes.js
│   │   │   ├── identity.routes.js
│   │   │   ├── password.routes.js
│   │   │   └── index.js
│   │   ├── seeds/
│   │   │   └── masterStudents.seed.js# Pre-seeded master student records
│   │   ├── services/
│   │   │   ├── auth/auth.service.js
│   │   │   ├── email/
│   │   │   │   ├── email.service.js  # Decoupled email manager
│   │   │   │   ├── email.provider.interface.js
│   │   │   │   ├── gmail.provider.js # Nodemailer + Gmail SMTP
│   │   │   │   ├── mock.provider.js  # In-memory test provider
│   │   │   │   └── templates/        # Responsive HTML email templates
│   │   │   ├── ocr/
│   │   │   │   ├── ocr.service.js    # OCR orchestrator
│   │   │   │   ├── ocr.preprocessor.js # Sharp image pipeline
│   │   │   │   ├── textExtractor.js  # Regex heuristics
│   │   │   │   └── engines/          # TesseractEngine, MockOcrEngine
│   │   │   ├── identity/identity.service.js
│   │   │   ├── otp/otp.service.js
│   │   │   └── token.service.js
│   │   ├── utils/
│   │   │   ├── crypto.js
│   │   │   ├── logger.js
│   │   │   └── normalizers.js
│   │   ├── app.js
│   │   └── server.js
│   └── tests/
│       ├── unit/
│       │   ├── normalizers.test.js
│       │   └── otp.test.js
│       └── e2e/
│           └── auth.test.js
│
├── sample-id-cards/                  # Generated PNG sample ID cards for testing
├── .env.example
├── .gitignore
├── package.json                      # Monorepo root package
└── README.md
```

---

## 6. Installation & Quick Start

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0

### One-Command Setup
From the project root:
```bash
npm run install:all
```

### Running Both Backend and Frontend Concurrently
```bash
npm run dev
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api/auth`
- **Health Check**: `http://localhost:5000/api/health`

---

## 7. Environment Variables Reference

Create a `.env` file in the root or `server/` directory:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Database (Leave empty for auto in-memory MongoDB)
MONGODB_URI=

# JWT Secrets
JWT_ACCESS_SECRET=super_secret_access_jwt_key_college_portal_2026_change_in_prod
JWT_REFRESH_SECRET=super_secret_refresh_jwt_key_college_portal_2026_change_in_prod
JWT_RESET_SECRET=super_secret_reset_jwt_key_college_portal_2026_change_in_prod

# Token Durations
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=30d
RESET_TOKEN_EXPIRY=15m

# Email Provider ('gmail' or 'mock')
EMAIL_PROVIDER=mock
EMAIL_FROM_NAME="Apex Institute Student Portal"
EMAIL_FROM_ADDRESS=college.portal.auth@gmail.com

# Gmail SMTP Configuration (When EMAIL_PROVIDER=gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_college_portal@gmail.com
SMTP_PASSWORD=your_16_char_google_app_password

# OTP Configuration
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=5
OTP_MAX_ATTEMPTS=5
OTP_RESEND_COOLDOWN_SECONDS=60

# Student Verification Policy
REGISTRATION_NUMBER_REGEX=^[0-9]{2}[A-Z]{2,4}[0-9]{3,4}$
ENFORCE_MASTER_STUDENT_DB=true

# OCR & File Upload Settings
OCR_ENGINE=tesseract
MAX_UPLOAD_SIZE_MB=5
```

---

## 8. Gmail SMTP & App Password Setup Guide

To use real Gmail sending (`EMAIL_PROVIDER=gmail`):

1. **Log in** to your college / personal Google Account.
2. Go to **Google Account Settings** -> **Security**.
3. Enable **2-Step Verification**.
4. In the search bar at the top of Google Account Settings, search for **App Passwords**.
5. Create an App Name (e.g. `Apex College Portal`).
6. Google will generate a **16-character password** (e.g. `abcd efgh ijkl mnop`).
7. Paste this in your `.env` file:
   ```env
   EMAIL_PROVIDER=gmail
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=abcdefghijklmnop
   ```

---

## 9. How the Decoupled Email Architecture Works

The authentication system never invokes `nodemailer` or Gmail directly.
```
AuthService / Controller
         ↓
   EmailService (Domain Methods)
         ↓
EmailProviderInterface (Contract)
   ├── GmailProvider (Nodemailer + Gmail SMTP)
   ├── MockEmailProvider (In-Memory Dev/Test)
   └── FutureProductionProvider (SendGrid/Resend)
```
Switching providers requires only changing `EMAIL_PROVIDER=gmail` or passing a new provider instance via `emailService.setProvider(newProvider)`.

---

## 10. How ID Card OCR & Identity Verification Works

1. **Upload & Preprocessing**:
   - Multer receives the uploaded ID image in memory.
   - Sharp auto-orients EXIF data, converts to grayscale, normalizes contrast, sharpens character edges, and standardizes image resolution.
2. **Text Extraction**:
   - `TesseractEngine` runs OCR on the preprocessed buffer.
   - `TextExtractor` applies anchor patterns (`Reg No:`, `Student Name:`, etc.) and filters OCR noise artifacts.
3. **Identity Verification & Matching**:
   - `matchNames`: Compares user-entered name vs ID Card name (handles casing, spacing, token order, but strictly rejects genuine mismatches like "Rahul Kumar" vs "Rahul Sharma").
   - `matchRegistrationNumbers`: Compares user-entered registration number vs ID Card registration number.
   - `MasterStudent`: Validates the registration number against the College Master Student Database.

---

## 11. Testing & Verification

### Running Automated Test Suite
```bash
npm test
```
Or in the server directory:
```bash
npm run test:unit
npm run test:e2e
```

### Verified Test Cases:
- **Unit Tests**:
  - Gmail domain validation & canonicalization (`googlemail.com` -> `gmail.com`).
  - Indian phone validation (+91 normalization, 10 digits, starts with 6–9).
  - Name and registration number normalization and matching rules.
  - Cryptographic OTP generation, HMAC hashing, 60s cooldown, max 5 attempts.
- **E2E Tests**:
  1. Multi-Step Registration -> Login -> Profile -> 30-Day Session Refresh -> Logout.
  2. Name Mismatch Rejection (User: "Rahul Kumar", Card: "Rahul Sharma").
  3. Registration Number Mismatch Rejection (User: "23CSE102", Card: "23CSE999").
  4. Duplicate Gmail Prevention (`409 Conflict`).
  5. Duplicate Indian Phone Prevention (`400 Bad Request`).
  6. Duplicate Registration Number Prevention (`400 Bad Request`).
  7. Forgot Password OTP Recovery -> Reset -> Old Password Invalidation -> New Password Login.

---

## 12. Security Features Summary

| Security Feature | Implementation |
| :--- | :--- |
| **Password Hashing** | Bcrypt (12 salt rounds), never stored in plaintext |
| **OTP Storage** | HMAC-SHA256 hashed with secret key; zero plaintext storage |
| **OTP Lifetime** | 5 minutes auto-expiration with MongoDB TTL indexes |
| **Brute-Force Protection** | Max 5 attempts per OTP; 60s resend cooldown; express-rate-limit on routes |
| **Account Enumeration** | Forgot password endpoint returns generic response for existing & non-existing emails |
| **Session Persistence** | 15-min JWT access credentials + 30-day revocable refresh sessions in HttpOnly cookies |
| **Session Invalidation** | Password reset and logout revoke all active sessions immediately |
| **File Upload Security** | In-memory processing, strict MIME validation, Sharp header checks, 5MB limit |
| **Database Uniqueness** | MongoDB unique indexes on `email`, `phone`, `registrationNumber` |

---

## 13. College Master Seed Data

The system comes pre-seeded with sample active student records:
- `23CSE101` — Priyashi Singh (B.Tech, Computer Science, Year 2)
- `23CSE102` — Rahul Kumar (B.Tech, Computer Science, Year 2)
- `22ECE045` — Ananya Sharma (B.Tech, Electronics, Year 3)
- `24IT088` — Rohan Verma (B.Tech, Information Technology, Year 1)
- `23MECH014` — Sneha Patel (B.Tech, Mechanical, Year 2)
