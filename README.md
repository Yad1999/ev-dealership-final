# BatteriVolt — Next-Gen Electric Vehicle Dealership

**Course:** EECS 4413 — E-Commerce Systems  
**Deliverable:** Deliverable 3 (Full Client-Side Implementation, Cloud-Native Deployment & Chatbot)  

---

## 👥 Team Members

* **Anrey Jazriel Dela Cruz**
* **Vincenzo Tavernese**
* **Sharon Sunny**
* **Vernon Chun**

---

## 🌐 Live Website & Repository

* **Live Running Website:** [https://ev-dealership-final.vercel.app/](https://ev-dealership-final.vercel.app/)
* **Client Hosting:** Cloud-Native deployment on **Vercel** with automatic SSL/HTTPS and Edge CDN distribution.
* **Backend Microservice:** Spring Boot on **AWS Elastic Beanstalk** (Amazon Linux 2 / Corretto Java 17).
* **Database:** **AWS RDS (Relational Database Service)**.

---

## ⚡ Project Overview

**BatteriVolt** is a modern, high-performance, cloud-native e-commerce platform designed specifically for electric vehicles (EVs), customized add-ons, and EV ownership ecosystem services. 

### Key Features (Deliverable 3 Demo Alignment):
1. **Cloud-Native & Secure:** Deployed on Vercel and AWS with HTTPS/TLS encryption and `/api` reverse proxy security.
2. **User Authentication & Profile Management:** Complete registration, login, logout, and multi-field shipping address persistence.
3. **Vehicle Catalog, Filtering & Sorting:** Dynamic inventory browsing with multi-criteria filters (brand, vehicle type, price range, acceleration) and interactive sorting.
4. **Custom Vehicle Configuration & Cart:** Vehicle add-on part customization, instant subtotal calculation, cart item removal, and persistent checkout drawer.
5. **Itemized Checkout & Tax Computation:** Real-time 15% sales tax calculation, shipping address modification per order, payment selection, and automated order confirmation.
6. **Order History & 5-Star Reviews:** Persistent order timeline, formatted placement dates, and verified customer review submission with 5-star ratings.
7. **Interactive EV Charger Finder (Distinguished Feature):** Real-time HTML5 Geolocation, Leaflet GIS mapping, dynamic **10 km to 150 km** search radius slider, OpenStreetMap Nominatim geocoding, and Haversine distance calculations powered by the **Open Charge Map REST API**.
8. **AI Conversational Chatbot:** Intelligent assistant powered by **Google Gemini AI** featuring stateful multi-turn memory, domain knowledge guardrails, and autonomous **Function Calling (Tool Use)** for live EV charging recommendations.
9. **Financial Loan Calculator:** Embedded vehicle financing calculator computing estimated monthly payments based on vehicle price, down payment, loan duration, and APR.
10. **Hot Deals & Promotions:** Featured vehicle spotlight displaying original vs. promotional discounted pricing.

---

## 🛠️ Technology Stack

* **Frontend Framework:** React 19 (`react`, `react-dom` v19.2)
* **Build Tooling:** Vite 8 with Rolldown and Babel React Compiler optimizations
* **Type System:** TypeScript 6 (`typescript` ~6.0)
* **Styling & Design System:** Tailwind CSS v4 (`@tailwindcss/vite`), Framer Motion micro-animations, Lucide React icons
* **Mapping & GIS:** Leaflet, React-Leaflet, OpenStreetMap Tiles
* **AI & External APIs:** Google Generative AI SDK (`@google/generative-ai`), Open Charge Map POI API, Nominatim Geocoding API
* **State Management:** React Context API + Provider Pattern (`AuthContext`, `CartContext`, `OrderContext`)
* **Routing:** React Router DOM v7

---

## 🚀 Getting Started & Local Installation

### Prerequisites
* **Node.js:** v18.0.0 or higher
* **npm:** v9.0.0 or higher

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ev-dealership-final.git
cd ev-dealership-final
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory (or use the provided defaults):

```env
# Backend API Base URL
VITE_API_URL=http://evsystem-backend-env.eba-vpyzicjy.us-east-1.elasticbeanstalk.com

# Open Charge Map API Key
VITE_OPENCHARGEMAP_API_KEY=your_openchargemap_api_key

# Google Gemini Generative AI Key
VITE_GEMINI_API_KEY=your_google_gemini_api_key
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the application with live Hot Module Replacement (HMR).

### 5. Build for Production
```bash
npm run build
```
The optimized, minified production assets will be compiled into the `dist/` directory.

### 6. Preview Production Build Locally
```bash
npm run preview
```

---

## 📁 Project Directory Structure

```
ev-dealership-final/
├── public/                     # Static media and brand assets
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── AuthModal.tsx       # Sign In / Sign Up modal with address fields
│   │   ├── Chatbot.tsx         # AI Conversational Chatbot with Gemini Tool Calling
│   │   ├── CheckoutModal.tsx   # Order shipping address editor modal
│   │   ├── Deals.tsx           # Promotional vehicle deals section
│   │   ├── EVChargerMap.tsx    # Leaflet interactive map with radius search
│   │   ├── Footer.tsx          # Application footer
│   │   ├── LoanCalculator.tsx  # Interactive financing calculator
│   │   ├── Navbar.tsx          # Navigation bar with cart drawer and auth menu
│   │   ├── ReviewModal.tsx     # 5-star rating & review submission modal
│   │   └── VehicleDetailsModal.tsx # Vehicle customization & parts configuration
│   ├── context/                # Global state management providers
│   │   ├── AuthContext.tsx     # User session & address state
│   │   ├── CartContext.tsx     # Cart items, upgrades & 15% tax calculations
│   │   └── OrderContext.tsx    # Order placement, persistence & review sync
│   ├── pages/                  # Top-level SPA views
│   │   ├── HomePage.tsx        # Landing page with hero, deals, and charger map
│   │   ├── Shop.tsx            # Vehicle catalog with sorting & filtering
│   │   ├── CheckoutPage.tsx    # Final checkout & address confirmation
│   │   ├── OrderConfirmationPage.tsx # Post-checkout receipt & summary
│   │   └── OrderHistoryPage.tsx      # Past orders, tracking & review submission
│   ├── types/                  # TypeScript interface and DTO definitions
│   ├── index.css               # Design system & Tailwind styling tokens
│   ├── App.tsx                 # Root component & route declarations
│   └── main.tsx                # React DOM root mounting
├── index.html                  # HTML5 entry point
├── package.json                # Project dependencies and npm scripts
├── tsconfig.json               # TypeScript configuration
├── vercel.json                 # Vercel cloud deployment & API proxy rewrites
└── vite.config.ts              # Vite configuration & dev proxy rules
```

---

## 📄 License & Academic Integrity
This project was developed for academic evaluation in **EECS 4413: E-Commerce Systems**. All rights reserved by the project authors.
