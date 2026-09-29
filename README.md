# EquipLocal 🚜

> **Hyper-Local Equipment Rental Marketplace MVP (Airbnb / OLX for Machinery & Tools)**

EquipLocal connects local equipment owners (contractors, farmers, tool rental owners) with builders, farmers, DIYers, and trade professionals who need short-term equipment access without high capital purchases.

---

## 1. Core Architecture

EquipLocal uses a clean **3-Tier Architecture**:

```text
                    ┌─────────────────────────┐
                    │        Frontend         │
                    │ React + Tailwind + Vite │
                    └────────────┬────────────┘
                                 │
                                HTTP (Axios + JWT)
                                 │
                    ┌────────────▼────────────┐
                    │         Backend         │
                    │   Node.js + Express.js  │
                    └────────────┬────────────┘
                                 │
                              Mongoose
                                 │
                    ┌────────────▼────────────┐
                    │        Database         │
                    │         MongoDB         │
                    └─────────────────────────┘
```

---

## 2. Complete Project Structure

```text
EquipLocal/
│
├── client/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Responsive navigation with role-aware links
│   │   │   ├── Footer.jsx           # Marketplace footer and trust signals
│   │   │   ├── EquipmentCard.jsx    # Card preview with price, location, deposit & badge
│   │   │   ├── SearchBar.jsx        # Search keyword, category & location filter
│   │   │   └── BookingCard.jsx      # Booking request card with Accept / Reject / Cancel
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Hero, popular categories, featured equipment & CTA
│   │   │   ├── Login.jsx            # Authentication with 1-click demo logins
│   │   │   ├── Signup.jsx           # Registration with Renter vs. Owner role selector
│   │   │   │
│   │   │   ├── user/
│   │   │   │   ├── EquipmentList.jsx     # Equipment catalog with search & filters
│   │   │   │   ├── EquipmentDetails.jsx  # Machinery specs, price, date picker & booking form
│   │   │   │   └── MyBookings.jsx        # Renter's booking tracker with status tabs
│   │   │   │
│   │   │   └── owner/
│   │   │       ├── Dashboard.jsx         # Metrics (equipment count, pending, revenue)
│   │   │       ├── AddEquipment.jsx      # Machinery listing form with photo presets
│   │   │       ├── ManageEquipment.jsx   # Equipment inventory table (Edit, Delete, Availability)
│   │   │       └── BookingRequests.jsx   # Review renter inquiries (Accept / Reject)
│   │   │
│   │   ├── services/
│   │   │   └── api.js               # Axios instance with JWT auth interceptors
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # User state, token persistence & role guards
│   │   │
│   │   ├── App.jsx                  # React Router routes and route guards
│   │   ├── main.jsx                 # Client entry point
│   │   └── index.css                # Tailwind styling
│   │
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   │
│   ├── controllers/
│   │   ├── authController.js        # Register, Login, GetMe
│   │   ├── equipmentController.js   # Equipment CRUD and search / filter queries
│   │   └── bookingController.js     # Booking creation, approval, rejection, cancellation
│   │
│   ├── models/
│   │   ├── User.js                  # User model with bcrypt password hashing
│   │   ├── Equipment.js             # Equipment model with category, pricing, deposit
│   │   └── Booking.js               # Booking model connecting Renter, Owner & Equipment
│   │
│   ├── routes/
│   │   ├── authRoutes.js            # /api/auth
│   │   ├── equipmentRoutes.js       # /api/equipment
│   │   └── bookingRoutes.js         # /api/bookings
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT verification & role authorization
│   │   └── errorMiddleware.js       # Global 404 & Mongoose error handler
│   │
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   │
│   ├── seeder.js                    # Database seeder with realistic machinery & demo users
│   ├── server.js                    # Main Express application entry point
│   ├── .env                         # Server environment configuration
│   └── package.json
│
├── package.json                     # Root orchestrator scripts
└── README.md
```

---

## 3. Database Schema & Data Models

### 1. User Model (`server/models/User.js`)
* `_id`: ObjectId
* `firstName`: String (required)
* `lastName`: String (optional)
* `email`: String (required, unique)
* `password`: String (bcrypt hashed, `select: false`)
* `phone`: String (required)
* `role`: `'user'` (Renter) | `'owner'` (Equipment Owner) — *strictly two roles*
* `location`: String (required, e.g., Delhi, Noida, Faridabad, Ghaziabad)
* `avatar`: String (optional)
* `status`: `'active'` | `'suspended'` | `'deleted'`
* `lastLoginAt`: Date
* `createdAt` / `updatedAt`: Timestamps

### 2. Equipment Model (`server/models/Equipment.js`)
* `_id`: ObjectId
* `ownerId`: ObjectId (ref: `User`)
* `name`: String (e.g., "Concrete Mixer 10/7")
* `category`: `'Construction'` | `'Agriculture'` | `'Event'` | `'Cleaning'` | `'Power Tools'` | `'Transportation'` | `'Other'`
* `description`: String
* `pricePerDay`: Number
* `securityDeposit`: Number (Refundable deposit)
* `location`: String
* `image`: String (URL)
* `availability`: Boolean (default: `true`)
* `createdAt` / `updatedAt`: Timestamps

### 3. Booking Model (`server/models/Booking.js`)
* `_id`: ObjectId
* `equipmentId`: ObjectId (ref: `Equipment`)
* `renterId`: ObjectId (ref: `User`)
* `ownerId`: ObjectId (ref: `User`)
* `startDate`: Date
* `endDate`: Date
* `totalAmount`: Number (`rentalDays * pricePerDay`)
* `status`: `'pending'` | `'accepted'` | `'rejected'` | `'completed'` | `'cancelled'`
* `createdAt` / `updatedAt`: Timestamps

---

## 4. API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user or owner |
| `POST` | `/api/auth/login` | Public | Authenticate user & get JWT token |
| `GET` | `/api/auth/me` | Private | Retrieve logged-in user profile |

### Equipment (`/api/equipment`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/equipment` | Public | Search & filter equipment catalog |
| `GET` | `/api/equipment/:id` | Public | Get single equipment details |
| `GET` | `/api/equipment/owner/my` | Private (Owner) | Get current owner's equipment inventory |
| `POST` | `/api/equipment` | Private (Owner) | Add new equipment listing |
| `PUT` | `/api/equipment/:id` | Private (Owner) | Update equipment details / pricing |
| `DELETE` | `/api/equipment/:id` | Private (Owner) | Delete equipment listing |

### Bookings (`/api/bookings`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/bookings` | Private (Renter) | Request a rental booking |
| `GET` | `/api/bookings/my` | Private (Renter) | View current user's booking history |
| `GET` | `/api/bookings/owner` | Private (Owner) | View incoming rental requests for owner's equipment |
| `PUT` | `/api/bookings/:id/accept` | Private (Owner) | Accept booking request |
| `PUT` | `/api/bookings/:id/reject` | Private (Owner) | Reject booking request |
| `PUT` | `/api/bookings/:id/cancel` | Private (Renter) | Cancel pending booking |

---

## 5. Quick Start Guide

### Prerequisites
* **Node.js** (v18+)
* **MongoDB** (Local instance or MongoDB Atlas)

---

### Step 1: Install Dependencies

From root:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

---

### Step 2: Configure Environment Variables

The server `.env` file is already created at `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/equiplocal
JWT_SECRET=equiplocal_super_secret_jwt_key_2026_secure
```

*(If using MongoDB Atlas, replace `MONGO_URI` with your connection string).*

---

### Step 3: Seed Demo Data

Run the seeder script to populate realistic machinery and demo accounts:

```bash
cd server
npm run seed
```

---

### Step 4: Run the Application

#### Start Backend (Terminal 1)
```bash
cd server
npm run dev
# Server runs on: http://localhost:5000
```

#### Start Frontend (Terminal 2)
```bash
cd client
npm run dev
# Client runs on: http://localhost:3000
```

Open your browser at **`http://localhost:3000`**.

---

## 6. Demo Accounts (Ready to Test)

The database includes ready-to-test accounts for both sides of the marketplace:

| Role | Name | Email | Password | City |
|---|---|---|---|---|
| **Owner** | Rahul Sharma | `rahul@gmail.com` | `password123` | Delhi |
| **Owner** | Priya Patel | `priya@gmail.com` | `password123` | Noida |
| **Renter** | Aakash Rajawat | `aakash@gmail.com` | `password123` | Faridabad |
| **Renter** | Vikram Singh | `vikram@gmail.com` | `password123` | Ghaziabad |

*(On the Login screen, click **"Owner Demo"** or **"Renter Demo"** to auto-fill credentials instantly).*

---

## 7. Complete User Flow Walkthrough

### Renter Flow:
1. Open the homepage `http://localhost:3000`.
2. Browse categories or search for **"Concrete Mixer"** or filter by location (**Delhi**, **Noida**, **Faridabad**, **Ghaziabad**).
3. Click on **"View Details & Rent"**.
4. Select rental dates (e.g. 3 days). The estimate computes automatically (`₹1,200 × 3 = ₹3,600`).
5. Click **"Request Booking"**.
6. Navigate to **"My Bookings"** (`/user/bookings`) to view the status (**Pending**).

### Owner Flow:
1. Log in as **Rahul Sharma** (`rahul@gmail.com`).
2. Visit **Owner Dashboard** (`/owner/dashboard`) to view statistics:
   - Total Equipment: 5
   - Pending Requests: 1 (Concrete Mixer from Aakash)
3. Click **"Accept"** on the incoming booking request.
4. Go to **"My Equipment"** (`/owner/equipment`) to add or edit daily rental rates or toggle machine availability.

5. Automatic deployment testing now----
