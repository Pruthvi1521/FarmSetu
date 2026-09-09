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
- **Dynamic Price Intelligence Engine**: Recommends optimal pricing based on historical Mandi modal prices, crop grade quality multipliers, seasonal demand, and location.
- **Net-Payout Market Ranking Engine**: Ranks regional Mandis for any crop lot by computing expected price minus real-time dynamic logistics cost per ton/km.
- **Buyer-Farmer Match Scoring**: Uses vector-like multi-attribute matching (crop compatibility, target price delta, distance, quantity fit) to match farmers with optimal bulk buyers.
- **End-to-End Escrow-Style Transaction Lifecycle**: Structured offer creation, counter-offers, acceptance, binding transaction creation, status tracking, and completion.
- **Hardened Role-Based Portals**: Tailored interfaces for Farmers, Buyers, and Platform Administrators with strict authorization and rate-limiting safeguards.

---

## 🚀 Key Features & Capabilities

### 👨‍🌾 Farmer Portal
- **Lot Listing Management**: Create and manage crop produce listings with specific quantities, harvest dates, locations, quality grades (Grade A, B, C), and desired prices.
- **Smart Price Advisor**: Get instant min, max, and suggested listing price recommendations derived from live market algorithms.
- **Best Market Finder**: Interactive visual comparison ranking top regional markets by projected net earnings after transport deduction.
- **Negotiation Center**: Review buyer offers, accept, reject, or submit binding counter-offers.
- **Financial Analytics**: Real-time dashboard tracking total sales revenue, active listings, and exact calculated transport expenses.

### 🏢 Buyer Portal
- **Marketplace Discovery**: Filter and search crop lots by commodity, location, minimum grade, price range, and quantity.
- **Direct Offer Submission**: Place custom bids on active crop lots with price per unit, delivery terms, and expiry windows.
- **Counter-Offer Resolution**: Respond to farmer counter-proposals seamlessly.
- **Order Tracking**: Monitor purchased crop lots through confirmation, transit, and fulfillment completion phases.

### 🛡️ Admin Portal
- **System Metrics Monitoring**: Aggregate platform statistics including total user count, active lots, completed transactions, and gross merchandise value (GMV).
- **User & Lot Oversight**: Manage platform users, inspect listings, and audit active transactions.
- **Market Price Management**: Update baseline market price data across regional Mandis.

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
│   │   ├── seeders/        # Comprehensive Database Seed Scripts
│   │   └── services/       # Core Mathematical & Algorithmic Engines
└── shared/                 # Common Domain Interfaces & Data Models
```

### Technology Stack Details
- **Frontend Framework**: React 18, Vite 5, TypeScript 5
- **Styling & UI**: Custom CSS Design Tokens, Glassmorphism, Responsive Grid System, Lucide Icons
- **Backend Runtime**: Node.js v18+, Express 4, TypeScript 5 (`ts-node`)
- **Database Layer**: MongoDB 6+ with Mongoose ODM
- **Security**: JSON Web Tokens (JWT), Bcrypt password hashing, Express Rate Limiter, Helmet headers, CORS policies
- **Testing**: Node.js Native Test Runner (`tsx` test runner execution)

---

## 🧮 Mathematical Models & Core Algorithms

### 1. Dynamic Price Suggestion Formula
Calculates recommended price per quintal/kg based on baseline mandi modal price, produce grade, harvest freshness, and location:

$$\text{Suggested Price} = \text{Base Price} \times \text{Quality Multiplier} \times \text{Seasonality Factor} \times \text{Freshness Multiplier}$$

Where:
- **Quality Multipliers**: Grade A = $1.15$, Grade B = $1.00$, Grade C = $0.85$
- **Freshness Multiplier**: Decreases by $0.5\%$ per day post-harvest up to 14 days.

### 2. Net-Payout Market Ranking Formula
Ranks all accessible markets for a farmer's crop lot based on net profitability:

$$\text{Transport Cost} = \text{Base Freight} + (\text{Distance (km)} \times \text{Rate per km/ton} \times \text{Weight (tons)})$$
$$\text{Projected Revenue} = \text{Lot Quantity} \times \text{Market Projected Price}$$
$$\text{Net Payout} = \text{Projected Revenue} - \text{Transport Cost}$$

### 3. Buyer-Farmer Match Score (0–100%)
Determines mutual suitability between a buyer request and a listed lot:

$$\text{Match Score} = W_{grade} \cdot S_{grade} + W_{price} \cdot S_{price} + W_{distance} \cdot S_{distance} + W_{quantity} \cdot S_{quantity}$$

Where:
- $W_{grade} = 0.30$, $W_{price} = 0.35$, $W_{distance} = 0.20$, $W_{quantity} = 0.15$
- $S_{price} = \max\left(0, 1 - \frac{|\text{Offer Price} - \text{Target Price}|}{\text{Target Price}}\right)$
- $S_{distance} = \max\left(0, 1 - \frac{\text{Distance}}{500 \text{ km}}\right)$

---

## ⚙️ Installation & Setup Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local instance running at `mongodb://localhost:27017` or a MongoDB Atlas URI

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
MONGODB_URI=mongodb://localhost:27017/farmsetu
JWT_SECRET=farmsetu_super_secret_jwt_key_2026
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Database Seeding
Populate the database with realistic Mandi market prices, sample users (Farmer, Buyer, Admin), active crop lots, and past transactions:

```bash
cd server
npm run seed
```

### 4. Running the Development Servers

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
| **Lots** | `/api/lots` | `GET` | Public | Query marketplace lots with filters |
| **Lots** | `/api/lots` | `POST` | Farmer | Create new crop lot listing |
| **Lots** | `/api/lots/:id` | `GET` | Public | Retrieve detailed lot information |
| **Lots** | `/api/lots/:id` | `PUT` | Owner | Update active lot details |
| **Lots** | `/api/lots/:id/cancel` | `PATCH` | Owner | Cancel active lot listing |
| **Offers** | `/api/offers` | `POST` | Buyer | Submit price offer on a lot |
| **Offers** | `/api/offers/lot/:lotId` | `GET` | Auth | Get all offers for a specific lot |
| **Offers** | `/api/offers/:id/accept` | `POST` | Owner | Accept offer & trigger transaction |
| **Offers** | `/api/offers/:id/counter`| `POST` | Owner/Buyer | Submit counter-offer proposal |
| **Offers** | `/api/offers/:id/cancel` | `POST` | Sender | Cancel pending offer |
| **Transactions**| `/api/transactions` | `GET` | Auth | View user transactions |
| **Transactions**| `/api/transactions/:id/complete` | `PATCH` | Auth | Finalize transaction fulfillment |
| **Intelligence**| `/api/intelligence/suggest-price` | `GET` | Public | Get dynamic price recommendations |
| **Intelligence**| `/api/intelligence/market-rankings` | `GET` | Public | Get net-payout market rankings |
| **Intelligence**| `/api/intelligence/match-score` | `POST` | Auth | Compute buyer-farmer match score |
| **Analytics** | `/api/analytics/farmer` | `GET` | Farmer | Get revenue & transport analytics |
| **Analytics** | `/api/analytics/admin` | `GET` | Admin | Get platform-wide operational stats |
| **Notifications**| `/api/notifications` | `GET` | Auth | Fetch user in-app notifications |
| **Notifications**| `/api/notifications/:id/read` | `PATCH` | Auth | Mark notification as read |

---

## 🔒 Security & Authorization Architecture

1. **Role-Based Access Control (RBAC)**: Strict middleware enforces endpoint access control based on user roles (`FARMER`, `BUYER`, `ADMIN`).
2. **Resource Ownership Guard**: Modifications to lots, offers, counter-offers, and transactions require strict verification matching `req.user.id` against resource owner fields.
3. **State Transition Safety**: Closed, sold, or cancelled lots reject new offer submissions and state modifications.
4. **API Rate Limiting**: Production middleware throttles excessive requests (100 requests per 15-minute window per IP) to mitigate brute-force and denial-of-service risks.
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
