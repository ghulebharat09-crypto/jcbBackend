# JCB Fleet Management System – Backend

A production-ready Enterprise Backend for the **JCB Fleet Management System** built with **Node.js, TypeScript, Fastify, Sequelize ORM, and MySQL**.

Following the reference MVC architecture pattern with strict file separation:
- `Interface` -> Data types, Create/Update inputs, query filters
- `Model` -> Sequelize model, MySQL table schema, hooks, associations
- `Service` -> Database queries, transactions, business logic
- `Controller` -> Request handling, validation, HTTP response formatting
- `Routes` -> Fastify route definitions and controller mapping

---

## 1. Technology Stack

- **Runtime:** Node.js (CommonJS / ES2020)
- **Language:** TypeScript 5.x
- **Framework:** Fastify 5.x
- **ORM:** Sequelize 6.x
- **Database Driver:** mysql2
- **Database:** MySQL 8.0 (`jcb_fleet_management`)
- **Authentication:** JWT (`@fastify/jwt` & `jsonwebtoken`)
- **Password Security:** `bcrypt` (10 rounds)
- **File Uploads:** `@fastify/multipart` (10MB limit, UUID filenames)
- **CORS:** `@fastify/cors`
- **Logger:** `pino-pretty`

---

## 2. Architecture & File Structure

```
backend/
│
├── src/
│   ├── config/
│   │   └── env.config.ts                      # Centralized typed environment configs
│   │
│   ├── interface/                             # TypeScript interfaces for every module
│   │   ├── auth.interface.ts
│   │   ├── user.interface.ts
│   │   ├── customer.interface.ts
│   │   ├── machine.interface.ts
│   │   ├── operator.interface.ts
│   │   ├── booking.interface.ts
│   │   ├── maintenance.interface.ts
│   │   ├── payment.interface.ts
│   │   ├── invoice.interface.ts
│   │   ├── dashboard.interface.ts
│   │   ├── schedule.interface.ts
│   │   ├── report.interface.ts
│   │   └── profile.interface.ts
│   │
│   ├── models/                                # Sequelize Models with hooks & associations
│   │   ├── user.model.ts
│   │   ├── customer.model.ts
│   │   ├── machine.model.ts
│   │   ├── operator.model.ts
│   │   ├── booking.model.ts
│   │   ├── maintenance.model.ts
│   │   ├── payment.model.ts
│   │   ├── invoice.model.ts
│   │   ├── invoice-item.model.ts
│   │   ├── operator-assignment.model.ts
│   │   └── user-setting.model.ts
│   │
│   ├── services/                              # Business logic, Sequelize queries, transactions
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── customer.service.ts
│   │   ├── machine.service.ts
│   │   ├── operator.service.ts
│   │   ├── booking.service.ts
│   │   ├── maintenance.service.ts
│   │   ├── payment.service.ts
│   │   ├── invoice.service.ts
│   │   ├── dashboard.service.ts
│   │   ├── schedule.service.ts
│   │   ├── report.service.ts
│   │   ├── profile.service.ts
│   │   └── file-upload.service.ts
│   │
│   ├── controllers/                           # Fastify controllers
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── customer.controller.ts
│   │   ├── machine.controller.ts
│   │   ├── operator.controller.ts
│   │   ├── booking.controller.ts
│   │   ├── maintenance.controller.ts
│   │   ├── payment.controller.ts
│   │   ├── invoice.controller.ts
│   │   ├── dashboard.controller.ts
│   │   ├── schedule.controller.ts
│   │   ├── report.controller.ts
│   │   └── profile.controller.ts
│   │
│   ├── routes/                                # Fastify Route registrations
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── customer.routes.ts
│   │   ├── machine.routes.ts
│   │   ├── operator.routes.ts
│   │   ├── booking.routes.ts
│   │   ├── maintenance.routes.ts
│   │   ├── payment.routes.ts
│   │   ├── invoice.routes.ts
│   │   ├── dashboard.routes.ts
│   │   ├── schedule.routes.ts
│   │   ├── report.routes.ts
│   │   ├── profile.routes.ts
│   │   └── index.ts
│   │
│   ├── plugins/
│   │   ├── sequelize-plugin.ts                # Sequelize connection plugin
│   │   └── modelinitializer-plugin.ts         # Central model initializer & associations
│   │
│   ├── db/
│   │   └── hooks/
│   │       ├── convert-empty-string-to-null.ts # Strips empty string to null on save
│   │       └── time-formate.ts                # Standardized date formatting
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts                 # JWT Bearer token authentication
│   │   └── role.middleware.ts                 # Role-based access control
│   │
│   ├── utils/
│   │   ├── response.util.ts                   # Standardized API response formatters
│   │   ├── code-generator.util.ts             # JCB-2026-XXX and INV-2026-XXX generators
│   │   └── password.util.ts                   # bcrypt hash and compare
│   │
│   ├── seeders/
│   │   └── admin.seeder.ts                    # Seeds Admin, default settings, sample data
│   │
│   └── app.ts                                 # Fastify app bootstrap
│
├── uploads/                                   # Safe multipart file storage
│   ├── machines/
│   ├── operators/
│   ├── customers/
│   └── documents/
│
├── postman_collection.json                    # Full Postman Collection for import
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 3. Getting Started

### Prerequisites
- Node.js >= 18.x
- MySQL Server 8.0 running locally on port 3306

### Environment Setup (`.env`)
```env
PORT=8200
HOST=0.0.0.0
NODE_ENV=development
LOG_LEVEL=info

# Database Config
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=Bharat123
DATABASE_NAME=jcb_fleet_management

# JWT Config
JWT_SECRET=jcb_fleet_management_secure_jwt_token_secret_key_2026
JWT_EXPIRES_IN=7d

# Admin Secret
ADMIN_REGISTRATION_KEY=jcb_admin_secret_2026
```

### Installation & Run

```bash
# 1. Install dependencies
npm install

# 2. Build TypeScript
npm run build

# 3. Start development server (with hot reload)
npm run dev

# 4. Start production server
npm start
```

On initial launch, Sequelize automatically creates all tables and runs `admin.seeder.ts` with seeded default accounts:
- **Admin Email:** `admin@jcbfleet.com`
- **Admin Password:** `Admin@123`
- **Sample Machine:** `JCB 3CX Eco Backhoe Loader` (`MH-12-JC-4821`)
- **Sample Operator:** `Ramesh Pawar` (`9822001122`)
- **Sample Customer:** `Shree Ganesh Infra Ltd` (`9890123456`)

---

## 4. Health Checks

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health-check` | Database connectivity & uptime status |
| `GET` | `/auth/health-check` | Auth service health status |

---

## 5. API Endpoints Reference

Base URL: `http://localhost:8200/api/v1`

### Authentication (`/auth`)
- `POST /auth/login` – Login with email or phone + password
- `POST /auth/signup` – Register new user
- `POST /auth/forgot-password` – Reset password request
- `POST /auth/reset-password` – Set new password
- `GET /auth/me` – Get authenticated user info (Bearer token)

### Customers (`/customers`)
- `POST /customers/create-customer` – Create customer (auto-detects corporate vs individual)
- `GET /customers/getAll-customer` – Paginated customer list with search & filter
- `GET /customers/customer/:customer_id` – Customer details & active rentals
- `PUT /customers/customer/:customer_id/update-customer` – Update customer details
- `DELETE /customers/customer/:customer_id/delete-customer` – Soft delete customer
- `GET /customers/customer/:customer_id/bookings` – Customer booking history

### Machines (`/machines`)
- `POST /machines/create-machine` – Register JCB machine
- `GET /machines/getAll-machine` – List machines with status filters (`available`, `rented_out`, `maintenance`)
- `GET /machines/check-availability?start_date=&end_date=` – Query available machines in date range
- `GET /machines/machine/:machine_id` – Machine specs & assigned operators
- `PUT /machines/machine/:machine_id/update-machine` – Update machine details
- `PATCH /machines/machine/:machine_id/update-status` – Switch status
- `DELETE /machines/machine/:machine_id/delete-machine` – Soft delete machine
- `POST /machines/machine/:machine_id/upload-image` – Multipart machine photo upload

### Operators (`/operators`)
- `POST /operators/create-operator` – Register operator with license
- `GET /operators/getAll-operator` – List operators
- `GET /operators/available-operators` – Get currently available operators
- `GET /operators/operator/:operator_id` – Operator profile & assignments
- `PUT /operators/operator/:operator_id/update-operator` – Update operator
- `PATCH /operators/operator/:operator_id/update-status` – Switch status (`available`, `on_duty`, `off_duty`)
- `DELETE /operators/operator/:operator_id/delete-operator` – Soft delete operator
- `POST /operators/operator/:operator_id/upload-document` – Multipart license/document upload

### Bookings (`/bookings`)
- `POST /bookings/create-booking` – Create booking with date conflict check, automatic rate calculation & advance payment
- `GET /bookings/getAll-booking` – List bookings with pagination & status filters
- `GET /bookings/booking/:booking_id` – Full booking details with payments & invoice
- `PUT /bookings/booking/:booking_id/update-booking` – Update booking details
- `PATCH /bookings/booking/:booking_id/update-status` – Transition status (`scheduled` -> `active` -> `completed`)
- `PATCH /bookings/booking/:booking_id/cancel-booking` – Cancel booking & free up machine/operator
- `DELETE /bookings/booking/:booking_id/delete-booking` – Soft delete booking

### Maintenance (`/maintenance`)
- `POST /maintenance/create-maintenance` – Log maintenance record & set machine status to `maintenance`
- `GET /maintenance/getAll-maintenance` – List service logs
- `GET /maintenance/expenses-summary` – Aggregated maintenance costs by service type
- `GET /maintenance/maintenance/:maintenance_id` – Maintenance record details
- `PUT /maintenance/maintenance/:maintenance_id/update-maintenance` – Update record
- `DELETE /maintenance/maintenance/:maintenance_id/delete-maintenance` – Soft delete record

### Payments & Billing (`/payments`)
- `GET /payments/calculate-bill/:booking_id` – Auto-calculate rental charges, overtime, fuel & advance deduction
- `POST /payments/create-payment` – Process payment (advance / final / partial), auto-updates balance & booking status
- `GET /payments/getAll-payment` – List all payments
- `GET /payments/payment/:payment_id` – Payment receipt details
- `GET /payments/booking/:booking_id` – Payments for specific booking

### Invoices (`/invoices`)
- `POST /invoices/create-invoice` – Create invoice with itemized line items
- `GET /invoices/getAll-invoice` – List all invoices
- `GET /invoices/invoice/:invoice_id` – Invoice details with line items
- `GET /invoices/booking/:booking_id` – Invoice for specific booking

### Dashboard (`/dashboard`)
- `GET /dashboard/get-summary` – KPI metrics: total machines, available, rented, maintenance, customers, active rentals, monthly revenue, pending balance
- `GET /dashboard/recent-bookings` – 5 most recent bookings

### Fleet Work Schedule (`/schedule`)
- `GET /schedule/daily-schedule?date=YYYY-MM-DD` – Shift calendar for a date
- `GET /schedule/weekly-schedule?start_date=YYYY-MM-DD` – 7-day schedule

### Reports & Analytics (`/reports`)
- `GET /reports/revenue-analytics?year=YYYY` – 12-month revenue chart data
- `GET /reports/fleet-utilization` – Fleet utilization percentage

### Profile & Settings (`/profile`)
- `GET /profile/get-profile` – Authenticated user profile and pricing defaults
- `PUT /profile/update-profile` – Update profile, default hourly/daily rates, notifications
- `PUT /profile/change-password` – Change password

---

## 6. Postman Testing

A complete Postman collection is included in the project root:
- File: `postman_collection.json`

### To use in Postman:
1. Open Postman -> Click **Import** -> Select `postman_collection.json`.
2. Run the `Login (Admin)` request under `1. Authentication`.
3. The test script in the request **automatically sets the `token` variable** across the entire collection!
4. All subsequent requests automatically use `Bearer {{token}}`.
