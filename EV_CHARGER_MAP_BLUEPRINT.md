# Blueprint: EV Charger Map Implementation & Deployment Strategy

This document serves as the master technical specification for implementing a simple, localized EV charging station map (50km radius) for the dealership website. It spans the React/Vite frontend integration, security analysis, local prototyping configurations, and production scaling via Vercel.

---

## 1. Architectural Strategy
To deliver a responsive user experience while maintaining security, the application utilizes a **Hybrid Client-Server Architecture**. 

1. **Frontend Layer:** Built with React + Vite, leveraging `react-leaflet` and free OpenStreetMap tiles to render interactive maps without requiring a paid Google Maps license.
2. **Backend Proxy Layer:** Powered by Vercel Serverless Functions to securely handle API coordination and payload caching.
3. **Data Provider:** Consumes geospatial Point-of-Interest (POI) data via the free, community-driven Open Charge Map (OCM) API registry.

---

## 2. Security Analysis & Risk Mitigation

### The Pure Frontend Vulnerability (Why We Avoid It)
In standard single-page applications (SPAs), embedding third-party API keys directly into components using environment variables like `import.meta.env.VITE_OCM_API_KEY` compiles the raw key into the public production JavaScript bundles. 

* **The Risk:** Anyone opening the browser console or monitoring the network tab can extract the key, using your credentials for their own apps or scraping operations.
* **The Financial Impact:** While Open Charge Map is free, if you migrate to premium data layers (like Google Places or TomTom) later, key theft can run up massive, unexpected usage bills.

### The Serverless Solution
By implementing a Vercel Serverless Function proxy layer, the browser never communicates with Open Charge Map directly. It speaks exclusively to a local `/api/get-chargers` endpoint. The secret key stays locked on Vercel's backend environment (`process.env`), invisible to client-side network inspectors.

---

## 3. Technical Requirements & Dependencies

The agent must install the following packages to handle rendering and cross-platform map normalization:

```bash
npm install leaflet react-leaflet
```
*Note: Leaflet CSS files must be imported globally in your main entry file (e.g., `main.jsx` or `App.jsx`) to avoid corrupted tile grids.*

---

## 4. Local Prototyping Workflow

Because Vite natively only manages frontend static file serving, standard commands like `npm run dev` cannot execute serverless backend files written inside the root `/api/` directory. The environment must mimic Vercel's edge network locally.

### Step-by-Step Local Setup Instructions for the Agent:

1. **Install Vercel CLI:** Install the tooling globally or manage it via `npx`.
   ```bash
   npm install -g vercel
   ```
2. **Link the Repository:** The agent must link the local directory to your Vercel cloud profile to sync configurations.
   ```bash
   vercel link
   ```
3. **Configure Environment Variables:** Create a `.env` file at the root.
   * **Rule:** Do NOT use the `VITE_` prefix. Name the variable exactly `OPENCHARGEMAP_API_KEY`.
4. **Boot the Unified Dev Server:**
   ```bash
   vercel dev
   ```
   * **How it works:** This command boots your Vite frontend, launches a miniature local Node.js serverless engine for `/api/*`, links them on a single port (usually `localhost:3000`), and eliminates Cross-Origin Resource Sharing (CORS) development roadblocks.

---

## 5. Component & API Specification (Implementation Plan)

### The Backend Function (`/api/get-chargers.js`)
* **Task:** Accept incoming HTTP GET requests containing `latitude` and `longitude` query strings.
* **Logic:** Perform an upstream server-to-server fetch request to the Open Charge Map API endpoint passing the parameters, a maximum results limit of 80, a strict `distance=50`, and `distanceunit=KM`.
* **Caching Strategy:** Inject server headers (`Cache-Control: s-maxage=300, stale-while-revalidate=60`). If multiple customers visit your dealership from the same city, Vercel will serve cached data instantly from its global edge networks instead of making repetitive trips to the OCM API.

### The Frontend Component (`src/components/EVChargerMap.jsx`)
* **Geolocation Access:** Use the browser's native `navigator.geolocation.getCurrentPosition` API to prompt the user for their latitude and longitude coordinates upon loading.
* **Leaflet Asset Correction:** Implement a manual override script for Leaflet's default marker asset paths. Vite's bundling pipeline often breaks default Leaflet relative paths, causing pin graphics to display as broken image icons.
* **Dynamic Map Recenter:** Implement an isolated sub-component that hooks into Leaflet's `useMap()` context. Whenever the user accepts location permissions and coordinates resolve, programmatically trigger `map.setView()` to shift the perspective cleanly to their position at zoom level 10 (ideal for a 50km cross-section).
* **Data Parsing:** Map out the JSON array. The component will generate a unique user location pin and distinct pins for each charger matching `AddressInfo.Latitude` and `AddressInfo.Longitude`. Popups should reveal the station name (`Title`), street layout (`AddressLine1`), and loop through available `Connections` to detail connector configurations and power limits in kW.

---

## 6. Execution Check for the Agent
* Ensure all terminal server logs for serverless debugging are monitored directly inside the active command line panel, not the browser window.
* Verify error banners handle edge cases gracefully, such as when users deny browser location access permissions.
