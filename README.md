# 🏥 Infinity Pharma Solutions — Enterprise Pharmacy Management & POS ERP

> **Presentation & Audio Transcript Guide**  
> _A comprehensive, narrative-driven product presentation of Infinity Pharma Solutions ERP, structured for live executive demonstrations, investor decks, training walkthroughs, and AI Voiceover/TTS transcript generation._

---

## 🎙️ Executive Summary & Key Highlights

Infinity Pharma Solutions is a next-generation desktop ERP built specifically for modern retail pharmacies, wholesale distributors, and multi-counter healthcare facilities. Powered by a high-performance **Electron + React 19 + TypeScript** desktop shell and a **Node.js + PostgreSQL + Prisma ORM** Clean Architecture backend, the application eliminates checkout delays, prevents inventory expiration losses, automates Indian GST compliance, and delivers instant vector PDF invoice generation.

---

## 🎬 Presentation Deck & Feature Walkthrough

### 📍 Act 1: The Startup Diagnostics & Prerequisite Security

_“Reliability begins before the pharmacist touches the keyboard.”_

- **Automated Diagnostic Health Engine**: During initial boot, the application verifies the health of all core services before unlocking the UI.
- **Fail-Safe Startup Locks**:
  1. **PostgreSQL Database Connectivity**: Validates direct connection to the local database and Prisma connection pool.
  2. **Active Network & Internet Connectivity**: Verifies network throughput for cloud syncing and real-time validations.
- **Auto-Recovery & Manual Retries**: Continuously polls every 3 seconds with animated status badges, auto-resuming as soon as connections are restored.

---

### 📍 Act 2: Rapid Point-of-Sale (POS) Billing Counter

_“Sub-second checkout with keyboard-first ergonomics.”_

- **Zero-Mouse Keyboard Navigation**:
  - `F1`: Instant omni-search focus (Brand name, Generic composition, SKU barcode, Shelf rack).
  - `F3`: Real-time toggle between **Retail POS (B2C)** and **Wholesale B2B** billing modes.
  - `F8`: Park / Put current cart on **Hold** without losing customer context.
  - `F9`: **Recall** saved bills instantly.
  - `F10`: Complete sale, calculate change, and generate tax invoice in a single keystroke.
- **Automated FEFO (First-Expiry-First-Out) Allocation**: The system automatically selects the earliest expiring non-expired batch for each item, preventing expired stock from ever reaching a customer.
- **Multi-Mode Payment Engine**: Supports Cash (with instant change calculation), UPI/QR, Debit/Credit Card, and Customer Credit ledgers.

---

### 📍 Act 3: True Vector PDF Printing & Receipt Engine

_“Crisp, legally compliant tax invoices in any format.”_

- **Standard A4 GST Tax Invoice**: Complete GST-compliant layout featuring Pharmacy Drug License (DL), GSTIN, itemized HSN/SAC codes, CGST+SGST breakdown, prescription & doctor metadata, terms & conditions, and pharmacist signature box.
- **80mm High-Speed Thermal Receipt**: High-contrast monospace receipt optimized for rapid POS thermal receipt printers.
- **Direct Vector PDF Output**: Generates clean vector PDF files directly without screen-capturing or raster pixelation.

---

### 📍 Act 4: Real-Time Inventory & Expiry Tracking Matrix

_“Total control over batches, stock alerts, and write-offs.”_

- **Hierarchical Batch Tracking**: Expandable catalog displaying real-time stock, cost price, MRP, retail rate, wholesale rate, and days until expiration.
- **Three-Tier Expiry Watch**:
  - 🟢 **Active Stock**: Batches with healthy expiration runway (> 60 days).
  - 🟡 **Near-Expiry Zone (< 60 Days)**: Highlighted in amber with FEFO priority badges to facilitate early clearance.
  - 🔴 **Expired Stock (Quarantine Zone)**: Zero sales permitted; one-click stock adjustment and write-off logging.
- **Stock Audit & Adjustments**: Audit trail recording damaged goods, expired write-offs, and physical inventory corrections.

---

### 📍 Act 5: Sales Invoices & Credit Settlement Ledger

_“Complete visibility over daily turnover and receivables.”_

- **Live KPI Dashboard**: Real-time summary cards for Total Revenue, Retail Sales, Wholesale B2B Volume, and Outstanding Credit.
- **Local Timezone-Accurate Daywise Filtering**:
  - `Today`: Filter all invoices generated in the current calendar day.
  - `Yesterday`: Instant comparison with previous day transactions.
  - `7 Days`: Last week rolling summary.
  - `This Month`: Month-to-date sales ledger.
  - `Custom Date Picker`: Select any historical date to inspect invoices.
- **Instant Credit Settlement**: Allows selecting pending credit sales, entering received amounts (Cash/UPI/Card), and automatically updating the customer’s outstanding balance.

---

### 📍 Act 6: Purchase Orders (GRN) & Vendor Inward

_“Streamlined supplier procurement and landed cost calculation.”_

- **Goods Received Notes (GRN)**: Record incoming medicine consignments, supplier invoices, batch numbers, manufacturing dates, and expiration dates.
- **Automated Inventory Ingestion**: Recorded purchases automatically generate or increment active batches in the inventory database.
- **Tax Breakdown**: Itemized GST calculation on wholesale purchase price with input tax credit (ITC) tracking.

---

### 📍 Act 7: Multi-Party Management (Customers, Vendors, Doctors)

_“Centralized relationships and ledger accounting.”_

- **Customers**: Manage retail patient profiles and wholesale B2B institutional accounts (with GSTIN, billing addresses, and credit limits).
- **Suppliers & Distributors**: Track pharma distributors, contact representatives, and outstanding purchase liabilities.
- **Prescribing Doctors**: Maintain a verified registry of prescribing physicians for Schedule H / H1 prescription compliance.

---

### 📍 Act 8: Business Intelligence & GSTR-1 Analytics

_“Actionable data to maximize margins and simplify tax filing.”_

- **Financial Analytics**: Net revenue, gross margins, total tax collected, and discount impact.
- **Velocity Metrics**: Fast-moving medicines versus dead/slow-moving inventory to optimize procurement capital.
- **GSTR-1 Tax Summary**: Taxable value and tax liability split across 0%, 5%, 12%, 18%, and 28% GST brackets for accountants.

---

## 🗣️ AI Voiceover / Audio Presentation Transcript

_(Copy and paste this section into any AI text-to-speech generator such as ElevenLabs, OpenAI Audio, or Google Cloud TTS for a professional voice presentation.)_

```text
Welcome to the demonstration of Infinity Pharma Solutions — the intelligent, high-speed desktop ERP engineered for modern pharmacies and healthcare distributors.

Managing a high-volume pharmacy demands precision, speed, and strict compliance. Traditional billing software is slow, cluttered, and vulnerable to stock expiration losses. Infinity Pharma Solutions transforms daily operations with an ultra-responsive, keyboard-first desktop experience.

Let's begin at the billing counter.

With our Rapid POS terminal, cashiers never need to reach for a mouse. By pressing F1, they can instantly search medicines by brand name, generic composition, barcode, or shelf rack location.

What makes our billing terminal extraordinary is our automated First-Expiry-First-Out engine. When an item is added to the cart, the system automatically allocates the batch expiring soonest, ensuring near-expiry medicines are cleared first and expired stock is never sold.

Pharmacists can effortlessly toggle between Retail POS and Wholesale B2B billing with F3, put long-running orders on hold with F8, recall them with F9, and complete checkout with F10.

Invoicing is seamless. With our vector PDF print engine, you can generate crisp A4 GST tax invoices with full tax breakdowns and pharmacist signatures, or instantly print 80-millimeter thermal receipts.

Behind the counter, inventory management is completely proactive. Our Expiry Watch dashboard classifies stock into Active, Near-Expiry, and Expired quarantine zones, giving you full visibility over capital tied up in stock.

In the Sales History and Invoices module, owners can filter daily revenue with accurate local calendar filters, track customer receivables, and settle credit payments with a single click.

Combined with automated Goods Received Notes for purchases, comprehensive party ledgers, and GSTR-1 business analytics, Infinity Pharma Solutions delivers unmatched operational efficiency.

Built on a robust Clean Architecture with React, Electron, Node.js, and PostgreSQL, Infinity Pharma Solutions is enterprise-grade, rock-solid, and ready for deployment.

Thank you for watching the presentation of Infinity Pharma Solutions — Precision Healthcare Management.
```

---

## 🛠️ Technology Stack & System Architecture

### Frontend Desktop Client (`/frontend`)

- **Framework**: React 19 + TypeScript + Vite 8
- **Desktop Shell**: Electron 44 (Sandboxed, Context-Isolated preload)
- **Styling**: Tailored Enterprise Light Theme CSS (Inter typography, JetBrains Mono numbers, 2–4px sharp geometric borders)
- **Icons**: Lucide React
- **Document Engine**: Custom High-Fidelity Vector Print & PDF Renderer

### Backend Server (`/backend`)

- **Runtime**: Node.js + Express + TypeScript
- **Database & ORM**: PostgreSQL + Prisma ORM 7.9 (Direct pg driver adapter)
- **Design Pattern**: Domain-Driven Design (DDD), Clean Architecture & Repository Pattern
- **Production Hardening**: Helmet security headers, Gzip compression, Morgan HTTP logging, Express Rate Limiter, and fail-fast environment validation

---

## 🚀 Quick Start Guide

### 1. Backend Server Setup

```bash
cd backend
pnpm install
pnpm prisma db push
pnpm prisma:seed
pnpm run dev
```

_Server runs on `http://localhost:5000` with active health check at `/health`._

### 2. Frontend Desktop Application Setup

```bash
cd frontend
pnpm install
pnpm run dev
```

_Launches the Electron desktop application with Vite Hot Module Reloading._

---

## 📜 License & Compliance

Designed and engineered for Indian Drug & Cosmetics Act compliance, Schedule H prescription tracking, and GST taxation standards.
