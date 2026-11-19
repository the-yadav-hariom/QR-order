# Zaika · Full-Stack Live Restaurant Management System

A live restaurant management platform with real-time synchronization between **Guest Ordering**, **Staff Dashboard**, and **Kitchen Display System (KDS)**.

Converted from a single-file application into a production-grade **React.js + Tailwind CSS** frontend and a modular **Node.js** backend with persistent JSON storage and real-time Server-Sent Events (SSE).

---

## 🏗️ Architecture Overview

```
zaiki/
├── client/                     # FRONTEND (React.js + Tailwind CSS)
│   ├── dist/                   # Production-built bundle (HTML, JS, CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── guest/          # Guest ordering, menu, quiz, bill & live tracking
│   │   │   │   ├── GuestView.jsx
│   │   │   │   ├── GuestMenu.jsx
│   │   │   │   ├── DishModal.jsx
│   │   │   │   ├── WaitHub.jsx
│   │   │   │   ├── WaiterCall.jsx
│   │   │   │   ├── BillSection.jsx
│   │   │   │   └── GuestSidePanel.jsx
│   │   │   ├── staff/          # Staff dashboard, floor map, order & menu management
│   │   │   │   ├── StaffView.jsx
│   │   │   │   ├── StaffKPIs.jsx
│   │   │   │   ├── StaffOrders.jsx
│   │   │   │   ├── StaffFloor.jsx
│   │   │   │   ├── MenuManager.jsx
│   │   │   │   └── MenuModal.jsx
│   │   │   ├── kitchen/        # Kitchen Display System (KDS) for kitchen stations
│   │   │   │   └── KitchenView.jsx
│   │   │   ├── split/          # 3-column responsive split view (Guest, Staff, KDS)
│   │   │   │   └── SplitView.jsx
│   │   │   ├── TopBar.jsx      # Navigation, view switcher, speed, audio & locks
│   │   │   ├── PinModal.jsx    # Numeric PIN authentication modal
│   │   │   └── Toasts.jsx      # Real-time toast notifications
│   │   ├── context/
│   │   │   └── RestaurantContext.jsx  # Central state, audio synth & real-time sync
│   │   ├── App.jsx             # Main app container
│   │   ├── main.jsx            # React root mount
│   │   └── index.css           # Tailwind directives, animations & theme styles
│   ├── index.html              # HTML entry point with Tailwind CDN & fonts
│   ├── package.json            # React + Tailwind + Vite configuration
│   ├── tailwind.config.js      # Tailwind CSS theme extension
│   ├── postcss.config.js       # PostCSS configuration
│   └── vite.config.js          # Vite build & API proxy setup
│
├── service/                    # BACKEND (Node.js REST API + Real-time SSE)
│   ├── data/
│   │   └── db.json             # Persistent JSON file database (auto-created & synced)
│   ├── src/
│   │   ├── config/
│   │   │   ├── index.js        # Port, paths, and environment settings
│   │   │   └── defaultData.js  # Seed menu, stations, and initial sample data
│   │   ├── storage/
│   │   │   └── db.js           # File-backed database manager with auto-save
│   │   ├── services/
│   │   │   └── eventService.js # Server-Sent Events (SSE) live broadcaster
│   │   ├── middleware/
│   │   │   ├── cors.js         # Cross-Origin Resource Sharing & preflight handler
│   │   │   ├── logger.js       # HTTP access logging with response timing
│   │   │   └── errorHandler.js # JSON parser, response formatters, error handling
│   │   ├── controllers/
│   │   │   ├── stateController.js   # State queries, speed control, health check, SSE stream
│   │   │   ├── ordersController.js  # Order placement, send to kitchen, ticket updates, serve
│   │   │   ├── tablesController.js  # Waiter call, resolve alert, bill payment, rating, clear
│   │   │   └── menuController.js    # Dish CRUD, image uploads, availability toggle
│   │   └── routes/
│   │       └── apiRouter.js    # Central API request router
│   ├── server.js               # Main HTTP server & SPA static file host
│   ├── .env                    # Environment variables
│   ├── .env.example            # Environment template
│   └── package.json            # Service package configuration
│
├── package.json                # Root package configuration with unified scripts
└── README.md                   # System documentation
```

---

## ⚡ How the Backend Setup Works

1. **Integrated Server & Frontend Host**:
   - Running `npm start` (or `node service/server.js`) starts the backend server on **`http://localhost:5000`**.
   - The backend automatically hosts both the **REST API** and serves the **production-built React + Tailwind website** from `client/dist`.
   - Single-Page Application (SPA) routing is supported: visiting `http://localhost:5000`, `#guest-5`, `#staff`, `#kitchen`, or `#split` all work smoothly.

2. **Persistent Storage (`service/data/db.json`)**:
   - All restaurant state (orders, menu items, table statuses, receipts, customer ratings, loyalty points, and sales statistics) is automatically saved to disk at `service/data/db.json`.
   - Changes survive server restarts and system crashes.
   - Initial demo seed data is automatically loaded if no database file exists yet.

3. **Real-time Live Sync via Server-Sent Events (SSE)**:
   - Clients connect to `GET /api/events` via `EventSource`.
   - Any order placed by a guest, approved by staff, or marked ready by the kitchen is broadcast instantly to all connected screens.
   - Includes automatic heartbeat to keep connections open.

4. **REST API Endpoints**:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check (uptime, order count, active clients) |
| `GET` | `/api/state` | Full restaurant state (tables, orders, menu, stats) |
| `GET` | `/api/events` | Real-time SSE stream for live updates |
| `POST` | `/api/orders` | Place a new guest order |
| `PATCH` | `/api/orders/:id/send` | Staff approves order & sends tickets to kitchen |
| `PATCH` | `/api/orders/:id/station` | Kitchen marks a station ticket ready |
| `PATCH` | `/api/orders/:id/serve` | Staff marks order served |
| `POST` | `/api/tables/:table/call` | Guest calls waiter (Water, Napkins, Bill, Waiter) |
| `POST` | `/api/tables/:table/resolve` | Staff marks waiter call resolved |
| `POST` | `/api/tables/:table/pay` | Guest pays bill and receives digital receipt |
| `POST` | `/api/tables/:table/rate` | Guest rates dining experience (1–5 stars) |
| `POST` | `/api/tables/:table/clear` | Staff clears and resets table for next guests |
| `GET` | `/api/menu` | List all menu dishes |
| `POST` | `/api/menu` | Add a new dish to the menu |
| `PUT` | `/api/menu/:id` | Update an existing dish |
| `PATCH` | `/api/menu/:id/toggle` | Toggle dish availability (Sold out / Available) |
| `DELETE` | `/api/menu/:id` | Remove a dish from the menu |
| `POST` | `/api/speed` | Change timer multiplier (1×, 10×, 30×) |
| `POST` | `/api/reset` | Reset demo state back to initial seed |

---

## 🚀 Running the Website

### Start the Whole Application (Backend + Frontend)
```powershell
npm start
```
Open your browser at: **`http://localhost:5000`**

### Development Mode (with hot-reloading)
If you want to edit React components with instant hot module replacement:
```powershell
# Terminal 1: Backend service
npm run dev:service

# Terminal 2: React client (Vite)
npm run dev:client
```
Open your browser at: **`http://localhost:3000`** (requests to `/api` are automatically proxied to `:5000`).

---

## 🔑 Access PINs

- **Guest View**: No PIN required. Table selector on top right.
- **Staff Dashboard**: PIN **`1234`**
- **Kitchen Display (KDS)**: PIN **`5678`**
- **Split View**: Enter PINs to unlock all panes simultaneously.
