# FarmSetu — Next-Gen Agricultural Marketplace & Market Intelligence Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0+-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.0+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-brightgreen.svg)](https://www.mongodb.com/)

**FarmSetu** is an end-to-end digital agricultural marketplace and intelligent decision-support ecosystem built for **Smart India Hackathon (SIH)**. It bridges the gap between smallholder farmers, bulk agricultural buyers, and logistics providers by delivering transparent price discovery, AI-driven market ranking, dynamic buyer-farmer match scoring, dynamic freight cost estimation, and secure transaction lifecycle management.

---

## 🌾 Problem Statement & Core Value Proposition

Traditional agricultural supply chains in India suffer from major inefficiencies:
1. **Asymmetric Price Information**: Middlemen exploit farmers due to lack of real-time market rate visibility across regional Mandis.
2. **Suboptimal Market Selection**: Farmers sell produce at local markets without knowing if neighboring markets offer higher net returns after accounting for transport costs.
3. **Counterparty & Offer Risks**: Buyers and farmers lack structured counter-offer negotiation tools and verified offer fulfillment guarantees.
4. **Opaque Freight Costs**: High hidden logistics fees eat into farmer profit margins.

**FarmSetu addresses these challenges through:**
- **Dynamic Price Intelligence Engine**: Predicts multi-day market prices using WMA + Holt's Double Exponential Smoothing + Seasonality + Arrival Penalty.
- **Net-Payout Market Ranking Engine**: Ranks regional Mandis using a 6-factor matrix computing expected net revenue after transport and APMC fees.
- **Buyer-Farmer Match Scoring**: Uses a weighted 6-attribute matching model (crop fit, quantity fit, grade, proximity, verification, reliability) to match farmers with bulk buyers.
- **End-to-End Escrow-Style Transaction Lifecycle**: Structured offer creation, counter-offers, acceptance, binding transaction creation, status tracking, and completion.
- **Hardened Role-Based Portals**: Tailored interfaces for Farmers, Buyers, and Platform Administrators with strict authorization and rate-limiting safeguards.

---

## 🚀 Key Features & Capabilities

### 👨‍🌾 Farmer Portal
- **Lot Listing Management**: Create and manage crop produce listings with specific quantities, harvest dates, locations, quality grades (Grade A, B, C), and desired prices.
- **Smart Price Advisor**: Get instant price forecasts, trend indicators, and confidence intervals derived from live algorithmic models.
- **Best Market Finder**: Interactive visual comparison ranking top regional markets by projected net earnings after transport and APMC fee deductions.
- **Negotiation Center**: Review buyer offers, accept, reject, or submit binding counter-offers.
- **Financial Analytics**: Real-time dashboard tracking total sales revenue, active listings, and exact calculated transport expenses over rolling 12-month windows.

### 🏢 Buyer Portal
- **Marketplace Discovery**: Filter and search crop lots by commodity, location, minimum grade, price range, and quantity.
- **Direct Offer Submission**: Place custom bids on active crop lots with price per unit, delivery terms, and expiry windows.
- **Counter-Offer Resolution**: Respond to farmer counter-proposals seamlessly.
- **Order Tracking**: Monitor purchased crop lots through confirmation, transit, and fulfillment completion phases.

### 🛡️ Admin Portal
- **System Metrics Monitoring**: Aggregate platform statistics including total user count, active lots, completed transactions, and gross merchandise value (GMV).
- **User & Lot Oversight**: Manage platform users, inspect listings, and audit active transactions.
- **Market Price Management**: Access baseline market price data across regional Mandis.

---

## 📐 System Architecture & Tech Stack

FarmSetu is structured as a modern monorepo separating client frontend, server backend, and shared TypeScript domain interfaces.

```
FarmSetu/
├── client/                 # React + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/     # Farmer, Buyer, Admin & Shared UI Components
│   │   ├── context/        # Auth & State Context Providers
│   │   ├── pages/          # Full Page Routing Views
│   │   ├── services/       # Frontend API Client Service Layer
│   │   └── types/          # UI-specific TypeScript Types
├── server/                 # Express + TypeScript + Mongoose Backend
│   ├── src/
│   │   ├── controllers/    # Request Handlers & Business Controllers
│   │   ├── middleware/     # JWT Auth, Authorization, Rate Limiting
│   │   ├── models/         # MongoDB Mongoose Schemas & Models
│   │   ├── providers/      # Market Data Abstraction Layer
│   │   ├── routes/         # Express REST API Route Definitions
│   │   ├── seed/           # Comprehensive Database Seed Scripts
│   │   └── services/       # Core Mathematical & Algorithmic Engines
└── shared/                 # Common Domain Interfaces & Data Models
```

### Technology Stack Details
- **Frontend Framework**: React 18, Vite 5, TypeScript 5
- **Styling & UI**: Custom CSS Design Tokens, Glassmorphism, Responsive Grid System, Lucide Icons
- **Backend Runtime**: Node.js v18+, Express 4, TypeScript 5 (`ts-node`)
- **Database Layer**: MongoDB 6+ (with MongoMemoryServer auto-fallback when offline)
- **Security**: JSON Web Tokens (JWT), Bcrypt password hashing, Express Rate Limiter, Helmet headers, CORS policies
- **Testing**: End-to-End Automated Test Runner (`ts-node` test execution)

---

## 🧮 Mathematical Models & Core Algorithms

### 1. Multi-Day Price Forecasting Model
Predicts future commodity prices for a target market horizon ($T$ days) combining Weighted Moving Average (7-day window), Holt's Double Exponential Smoothing ($\alpha = 0.3, \beta = 0.1$), Monthly Seasonality Ratio, and Arrival Volume Penalty:

$$\text{Ensemble Price} = \left(0.5 \cdot \text{WMA}_7 + 0.5 \cdot \text{Holt}_T\right) \times \text{Seasonality Multiplier} - \text{Arrival Penalty}$$

- **Confidence Score (60–95%)**: Decays based on standard deviation ($\sigma$) and forecast horizon ($T$):
$$\text{Confidence Score} = \min\left(95, \max\left(60, 92 - 2.5\sigma - 1.5T\right)\right)$$

### 2. Market Ranking Engine (6-Factor Matrix)
Ranks candidate APMC Mandis for a farmer's produce lot using normalized 6-factor decision weights:

1. **Net Revenue Score (40%)**: Profit after transport & APMC fees.
2. **Forecast Price Score (20%)**: Projected market price.
3. **Demand Level Score (15%)**: Market demand index ($\text{HIGH}=100, \text{MEDIUM}=65, \text{LOW}=30$).
4. **Proximity Score (10%)**: Haversine distance decay.
5. **Price Trend Score (10%)**: Trajectory ($\text{INCREASING}=100, \text{STABLE}=60, \text{DECREASING}=20$).
6. **Forecast Confidence Score (5%)**: Prediction accuracy index.

**Net Payout Formula**:
$$\text{Gross Revenue} = \text{Lot Quantity (kg)} \times \text{Market Forecasted Price}$$
$$\text{APMC Fee} = \text{Gross Revenue} \times \frac{\text{APMC Fee \%}}{100}$$
$$\text{Expected Net Revenue} = \text{Gross Revenue} - \text{Transport Cost} - \text{APMC Fee}$$

### 3. Buyer-Farmer Match Score (0–100%)
Determines mutual suitability between a bulk buyer and a listed produce lot across 6 weighted attributes:

$$\text{Match Score} = 0.30 \cdot S_{\text{crop}} + 0.20 \cdot S_{\text{qty}} + 0.15 \cdot S_{\text{quality}} + 0.15 \cdot S_{\text{dist}} + 0.10 \cdot S_{\text{verif}} + 0.10 \cdot S_{\text{rel}}$$

Where:
- $S_{\text{crop}}$: 100 if commodity is in buyer's preferred list, else 20.
- $S_{\text{qty}}$: Quantity fit score ($\min(100, \max(50, \frac{\text{quantityKg}}{2000} \cdot 85))$).
- $S_{\text{quality}}$: Grade A (100), Grade B (80), Grade C (60).
- $S_{\text{dist}}$: Haversine distance score ($\max(20, 100 \cdot (1 - \frac{\text{distanceKm}}{200}))$.
- $S_{\text{verif}}$: Verification status score.
- $S_{\text{rel}}$: Buyer reliability rating score ($0–100\%$).

### 4. Dynamic Freight Transport Model
Estimates logistics costs using Haversine distance ($R=6371\text{ km}$) and vehicle capacity tiers:
- **$\le 1,500\text{ kg}$**: Tractor (1–2 Tonnes) @ ₹20/km
- **$\le 3,500\text{ kg}$**: Small Truck (1–3 Tonnes) @ ₹25/km
- **$> 3,500\text{ kg}$**: Medium Truck (3–8 Tonnes) @ ₹38/km

$$\text{Estimated Freight Cost} = \max\left(800, \text{Math.round}(\text{Distance (km)} \times \text{Rate per km})\right)$$

---

## ⚙️ Installation & Setup Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local instance running at `mongodb://localhost:27017` (Auto-spins `MongoMemoryServer` if local daemon is offline)

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/Pruthvi1521/FarmSetu.git
cd FarmSetu

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `server` folder based on `.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/farmsetu
JWT_SECRET=farmsetu_super_secret_jwt_key_2026
CLIENT_ORIGIN=http://localhost:5173,http://localhost:3000
NODE_ENV=development
```

### 3. Database Seeding
Populate the database with realistic Mandi market prices (2,000+ price/arrival records), sample users (Farmer, Buyer, Admin), active crop lots, demand records, and weather updates:

```bash
cd server
npm run seed
```

### 4. Running Development Servers

**Start Backend Server:**
```bash
cd server
npm run dev
# Server starts at http://localhost:5000
```

**Start Frontend Application:**
```bash
cd client
npm run dev
# App starts at http://localhost:5173
```

---

## 🔌 REST API Endpoints Overview

| Category | Endpoint | Method | Access | Description |
|---|---|---|---|---|
| **Auth** | `/api/auth/register` | `POST` | Public | Register new Farmer or Buyer |
| **Auth** | `/api/auth/login` | `POST` | Public | Authenticate user & return JWT token |
| **Auth** | `/api/auth/me` | `GET` | Authenticated | Fetch current user session profile |
| **Auth** | `/api/auth/demo-login` | `POST` | Public | Instant demo login for evaluation |
| **Market Intelligence** | `/api/market-intelligence/commodities` | `GET` | Public | Get list of supported commodities |
| **Market Intelligence** | `/api/market-intelligence/prices/current` | `GET` | Public | Get current mandi market prices |
| **Market Intelligence** | `/api/market-intelligence/prices/history` | `GET` | Public | Fetch historical prices for a crop/market |
| **Market Intelligence** | `/api/market-intelligence/recommend` | `POST` | Public | Execute market ranking & price forecast engine |
| **Market Intelligence** | `/api/market-intelligence/parse-input` | `POST` | Public | Parse unstructured text/voice query |
| **Lots** | `/api/lots` | `GET` | Public | Query marketplace lots with filters |
| **Lots** | `/api/lots` | `POST` | Farmer | Create new crop lot listing |
| **Lots** | `/api/lots/:id` | `GET` | Public | Retrieve detailed lot information |
| **Lots** | `/api/lots/:id/offers` | `POST` | Buyer | Submit or update price offer on a lot |
| **Lots** | `/api/lots/offers/:offerId/accept` | `POST` | Owner | Accept offer & trigger transaction |
| **Lots** | `/api/lots/:id/cancel` | `PATCH` | Owner | Cancel active lot listing |
| **Transactions** | `/api/transactions` | `GET` | Auth | View user transactions |
| **Transactions** | `/api/transactions/:id/complete` | `PATCH` | Auth | Finalize transaction fulfillment |
| **Analytics** | `/api/analytics/farmer-summary` | `GET` | Farmer | Get revenue & dynamic transport analytics |
| **Analytics** | `/api/analytics/buyer-summary` | `GET` | Buyer | Get buyer spending & transaction stats |
| **Analytics** | `/api/analytics/market-summary` | `GET` | Public | Get market-wide trading summary |
| **Analytics** | `/api/analytics/price-trend` | `GET` | Public | Fetch price trend analytics |
| **Notifications** | `/api/notifications` | `GET` | Auth | Fetch user in-app notifications |
| **Notifications** | `/api/notifications/:id/read` | `PATCH` | Auth | Mark notification as read |

---

## 🔒 Security & Authorization Architecture

1. **Role-Based Access Control (RBAC)**: Strict middleware enforces endpoint access control based on user roles (`FARMER`, `BUYER`, `ADMIN`).
2. **Resource Ownership Guard**: Modifications to lots, offers, counter-offers, and transactions require strict verification matching `req.user.id` against resource owner fields.
3. **State Transition Safety**: Closed, sold, or cancelled lots reject new offer submissions and state modifications.
4. **API Rate Limiting**: Production middleware throttles excessive authentication requests (10 requests per 15-minute window) and API calls.
5. **Input Validation**: All request bodies undergo strict validation for positive non-zero prices, quantities, valid MongoDB ObjectIds, and valid enum values.

---

## 🧪 Quality Assurance & Test Verification

FarmSetu includes an end-to-end automated verification suite. All 29 QA tests pass across 7 core functional domains:

1. **Authentication & Authorization**: Password security, token validation, role isolation.
2. **Market Intelligence Engines**: Price suggestion boundaries, market ranking sorting, match scoring math.
3. **Marketplace & Lot Management**: Filter accuracy, listing lifecycle, owner authorization.
4. **Offer Negotiation Lifecycle**: Offer placement, counter-offer validation, cancellation logic.
5. **Transaction Integrity**: Binding contract creation, status transitions, escrow state safety.
6. **Analytics Computation**: Dynamic revenue calculation, transport cost accuracy without hardcoding.
7. **Notification System**: Trigger events on offer submission, counter-offer, acceptance, and transaction updates.

---

## 📜 License & Acknowledgments

This project is developed for the **Smart India Hackathon (SIH)** competition. Built with dedication to empowering Indian agriculture through technology.

Distributed under the MIT License. See `LICENSE` for more information.
