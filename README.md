<div align="center">

<img src="photo/Screenshot 2026-07-03 094847.png" alt="MediCore Splash Screen" width="600"/>

# 🏥 MediCore HMS
### Pakistan''s Most Advanced Hospital Management System

[![Version](https://img.shields.io/badge/version-v2.6.0-blue?style=for-the-badge)](https://github.com/AnasQ2003/Medicore)
[![Status](https://img.shields.io/badge/status-Production%20Ready-brightgreen?style=for-the-badge)](https://github.com/AnasQ2003/Medicore)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MSSQL](https://img.shields.io/badge/MSSQL-Server-CC2927?style=for-the-badge&logo=microsoft-sql-server)](https://www.microsoft.com/en-us/sql-server)
[![License](https://img.shields.io/badge/license-MIT-yellow?style=for-the-badge)](LICENSE)

**A full-stack, role-based Hospital Management System powering smarter, safer, and faster healthcare delivery across multiple hospital branches.**

[🚀 Features](#-features) · [📸 Screenshots](#-screenshots) · [🛠 Tech Stack](#-tech-stack) · [⚡ Quick Start](#-quick-start) · [🗃 Database](#-database-schema) · [🔐 Security](#-security)

</div>

---

## ✨ Overview

**MediCore HMS** is a comprehensive, enterprise-grade hospital management platform designed for multi-role clinical environments. It provides a unified digital workspace for **Super Admins**, **Doctors**, **Nurses**, **Receptionists**, and **Patients** — each with a fully tailored dashboard, access controls, and workflows.

Built on a modern monorepo architecture with a **React 19 + TypeScript** frontend powered by **TanStack Start**, and an **Express.js** backend connected to **Microsoft SQL Server**, MediCore delivers clinical precision with consumer-grade UX.

---

## 🚀 Features

### 🌐 Multi-Role Access Control
| Role | Portal | Capabilities |
|---|---|---|
| 🔴 Super Admin | `/super-admin` | Hospital network oversight, staff management, analytics, global settings |
| 🩺 Doctor | `/doctor` | Patient EMR, appointments, prescriptions, schedules, leave, charges |
| 💉 Nurse | `/nurse` | Vitals, bed management, medications, injections, tasks, shift schedules |
| 🏨 Receptionist | `/receptionist` | Patient registration, queue management, billing, doctor scheduling |
| 🧑‍⚕️ Patient | `/patient` | Appointments, prescriptions, reports, bills, facility info |

### 🏥 Clinical Features
- **📋 Electronic Medical Records (EMR)** — Full patient history, vitals tracking, and ICU monitor modal
- **💊 Prescription Management** — Issue, track, and print digital prescriptions
- **🛏 Cinema-Style Bed Map** — Visual floor-plan bed availability with real-time status
- **📅 Smart Scheduling** — Drag-and-drop calendar for doctor/nurse shift management
- **💉 Injection & Medication Tracking** — Nurse-facing medication administration logs
- **📊 Clinical Reports & Lab Results** — Downloadable reports with role-based visibility
- **🚑 ICU Patient Monitor** — Real-time vitals modal with alert thresholds

### 🏢 Administrative Features
- **🏗 Multi-Hospital Network** — Manage multiple branches from a single super-admin panel
- **👥 Staff Directory** — Hire, manage, and monitor all clinical and non-clinical staff
- **💰 Billing & Charges** — Automated billing generation, doctor charges, and patient invoices
- **📈 Analytics Dashboard** — KPIs, revenue tracking, appointment trends, and recovery indices
- **🔔 Notification Center** — Role-specific alerts, reminders, and system messages
- **🏖 Leave Management** — Employee leave requests with admin approval workflow
- **🚪 Queue Management** — Receptionist-facing live patient queue with token system

### 🎨 UX & Design
- **🌙 Dark / Light Mode** toggle with system preference detection
- **🎬 Animated Splash Screen** with ECG heartbeat loader
- **✨ Glassmorphism UI** with smooth micro-animations throughout
- **📱 Fully Responsive** layout with collapsible sidebars
- **🔍 Global Search** — Instant search across patients, records, and prescriptions

---

## 📸 Screenshots

> All screenshots are taken from the live running system. Screenshots are shown in horizontal pairs for easy browsing.

### 🎬 Splash Screen

<p align="center">
  <img src="photo/Screenshot 2026-07-03 094847.png" alt="MediCore Splash Screen" width="100%"/>
</p>
<p align="center"><em>Animated splash screen with live ECG heartbeat and sinus rhythm indicator</em></p>

---

### 🔐 Authentication

<p align="center">
  <img src="photo/Screenshot 2026-10-03 202011.png" alt="Login Page" width="49%"/>
  &nbsp;
  <img src="photo/Screenshot 2026-10-03 202016.png" alt="Forgot Password" width="49%"/>
</p>
<p align="center"><em>Login Page &nbsp;·&nbsp; Forgot Password</em></p>

---

### 🩺 Doctor Portal

<p align="center">
  <img src="photo/Screenshot 2026-10-03 202023.png" alt="Doctor Dashboard" width="49%"/>
  &nbsp;
  <img src="photo/Screenshot 2026-10-03 202030.png" alt="Doctor Appointments" width="49%"/>
</p>
<p align="center"><em>Doctor Dashboard &nbsp;·&nbsp; Appointments Queue</em></p>

<p align="center">
  <img src="photo/Screenshot 2026-10-03 202034.png" alt="Doctor Patients" width="49%"/>
  &nbsp;
  <img src="photo/Screenshot 2026-10-03 202041.png" alt="Patient EMR" width="49%"/>
</p>
<p align="center"><em>My Patients &nbsp;·&nbsp; Full Patient EMR</em></p>

<p align="center">
  <img src="photo/Screenshot 2026-10-03 202050.png" alt="Prescriptions" width="49%"/>
  &nbsp;
  <img src="photo/Screenshot 2026-10-03 202120.png" alt="Doctor Reports" width="49%"/>
</p>
<p align="center"><em>Prescriptions &nbsp;·&nbsp; Clinical Reports</em></p>

<p align="center">
  <img src="photo/Screenshot 2026-10-03 202133.png" alt="Doctor Schedule" width="49%"/>
  &nbsp;
  <img src="photo/Screenshot 2026-10-03 202201.png" alt="Doctor Leave" width="49%"/>
</p>
<p align="center"><em>Schedule Calendar &nbsp;·&nbsp; Leave Management</em></p>

<p align="center">
  <img src="photo/Screenshot 2026-10-03 202210.png" alt="Doctor Charges" width="49%"/>
  &nbsp;
  <img src="photo/Screenshot 2026-10-03 202221.png" alt="Doctor Notifications" width="49%"/>
</p>
<p align="center"><em>Charges & Earnings &nbsp;·&nbsp; Notification Center</em></p>

<p align="center">
  <img src="photo/Screenshot 2026-10-03 202243.png" alt="Doctor Profile" width="49%"/>
  &nbsp;
  <img src="photo/Screenshot 2026-10-03 202249.png" alt="Doctor Settings" width="49%"/>
</p>
<p align="center"><em>My Profile &nbsp;·&nbsp; Settings</em></p>

---

### 💉 Nurse Portal

<p align="center">
  <img src="photo/Screenshot 2026-10-03 202255.png" alt="Nurse Dashboard" width="49%"/>
  &nbsp;
  <img src="photo/Screenshot 2026-10-03 202301.png" alt="Nurse Patients" width="49%"/>
</p>
<p align="center"><em>Nurse Dashboard &nbsp;·&nbsp; Assigned Patients</em></p>

<p align="center">
  <img src="photo/Screenshot 2026-10-03 202312.png" alt="Nurse Vitals" width="49%"/>
  &nbsp;
  <img src="photo/Screenshot 2026-10-03 202330.png" alt="Nurse Beds" width="49%"/>
</p>
<p align="center"><em>Vitals Monitoring &nbsp;·&nbsp; Cinema-Style Bed Map</em></p>

<p align="center">
  <img src="photo/Screenshot 2026-10-03 202336.png" alt="Nurse Medications" width="49%"/>
  &nbsp;
  <img src="photo/Screenshot 2026-10-03 202342.png" alt="Nurse Injections" width="49%"/>
</p>
<p align="center"><em>Medication Administration &nbsp;·&nbsp; Injection Log</em></p>

<p align="center">
  <img src="photo/Screenshot 2026-10-03 202403.png" alt="Nurse Tasks" width="49%"/>
  &nbsp;
  <img src="photo/Screenshot 2026-10-03 202434.png" alt="Nurse Schedule" width="49%"/>
</p>
<p align="center"><em>Task Management &nbsp;·&nbsp; Shift Schedule</em></p>

---

### 🏨 Receptionist Portal

<p align="center">
  <img src="photo/Screenshot 2026-10-03 202512.png" alt="Receptionist Dashboard" width="49%"/>
  &nbsp;
  <img src="photo/Screenshot 2026-10-03 202521.png" alt="Patient Registration" width="49%"/>
</p>
<p align="center"><em>Receptionist Dashboard &nbsp;·&nbsp; Patient Registration</em></p>

<p align="center">
  <img src="photo/Screenshot 2026-10-03 202543.png" alt="Queue Management" width="49%"/>
  &nbsp;
  <img src="photo/Screenshot 2026-10-03 202548.png" alt="Receptionist Billing" width="49%"/>
</p>
<p align="center"><em>Live Queue Management &nbsp;·&nbsp; Billing</em></p>

<p align="center">
  <img src="photo/Screenshot 2026-10-03 202605.png" alt="Doctor Directory" width="49%"/>
  &nbsp;
  <img src="photo/Screenshot 2026-10-03 202608.png" alt="Receptionist Schedule" width="49%"/>
</p>
<p align="center"><em>Doctor Directory &nbsp;·&nbsp; Appointment Scheduling</em></p>

---

### 🧑‍⚕️ Patient Portal

<p align="center">
  <img src="photo/Screenshot 2026-10-03 202625.png" alt="Patient Dashboard" width="49%"/>
  &nbsp;
  <img src="photo/Screenshot 2026-10-03 202647.png" alt="Patient Appointments" width="49%"/>
</p>
<p align="center"><em>Patient Dashboard &nbsp;·&nbsp; My Appointments</em></p>

<p align="center">
  <img src="photo/Screenshot 2026-10-03 202700.png" alt="Patient Prescriptions" width="49%"/>
  &nbsp;
  <img src="photo/Screenshot 2026-10-03 202710.png" alt="Patient Reports" width="49%"/>
</p>
<p align="center"><em>My Prescriptions &nbsp;·&nbsp; Lab & Clinical Reports</em></p>

<p align="center">
  <img src="photo/Screenshot 2026-10-03 202718.png" alt="Patient Bills" width="49%"/>
  &nbsp;
  <img src="photo/Screenshot 2026-10-03 202825.png" alt="Patient Facilities" width="49%"/>
</p>
<p align="center"><em>Billing & Invoices &nbsp;·&nbsp; Hospital Facilities</em></p>

---

### 🔴 Super Admin Portal

<p align="center">
  <img src="photo/Screenshot 2026-10-03 202912.png" alt="Super Admin Dashboard" width="49%"/>
  &nbsp;
  <img src="photo/Screenshot 2026-10-03 202917.png" alt="Hospital Network" width="49%"/>
</p>
<p align="center"><em>Super Admin Dashboard &nbsp;·&nbsp; Hospital Network Management</em></p>

<p align="center">
  <img src="photo/Screenshot 2026-10-03 203358.png" alt="Analytics" width="100%"/>
</p>
<p align="center"><em>Global Analytics & Reporting</em></p>

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19 | UI framework |
| **TypeScript** | 5.x | Type safety |
| **TanStack Start** | Latest | Full-stack React framework with file-based routing |
| **TanStack Router** | Latest | Type-safe client-side routing |
| **TanStack Query** | Latest | Server state management |
| **Vite** | 6.x | Build tool & dev server |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **shadcn/ui** | Latest | Accessible component library |
| **Recharts** | 2.x | Data visualization & charts |
| **Lucide React** | Latest | Icon library |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | ≥18 | Runtime environment |
| **Express.js** | 4.x | REST API framework |
| **MSSQL** | 10.x | Microsoft SQL Server driver |
| **JWT** | 9.x | Stateless authentication |
| **bcryptjs** | 2.x | Password hashing |
| **Helmet** | 7.x | HTTP security headers |
| **CORS** | 2.x | Cross-origin resource sharing |
| **Morgan** | 1.x | HTTP request logger |
| **Nodemailer** | 9.x | Email notifications |
| **express-rate-limit** | 7.x | API rate limiting |

### Database
| Technology | Purpose |
|---|---|
| **Microsoft SQL Server** | Primary relational database |
| **Knex.js** | SQL query builder & migrations |
| **Migrations** | Version-controlled schema management |
| **Seeds** | Demo data population |

---

## 📁 Project Structure

```
Medicore/
├── 📂 backend/                   # Express.js REST API
│   ├── 📂 config/                # DB connection & app config
│   ├── 📂 controllers/           # Route handler logic
│   │   ├── authController.js     # Login, JWT, password reset
│   │   └── clinicalController.js # Clinical data operations
│   ├── 📂 middleware/            # Auth guards, error handlers
│   ├── 📂 models/                # Data models & DB queries
│   ├── 📂 routes/
│   │   └── apiRoutes.js          # All REST endpoints
│   ├── 📂 utils/                 # Helper utilities
│   ├── server.js                 # Express app entry point
│   └── package.json
│
├── 📂 frontend/                  # React + TanStack Start app
│   └── 📂 src/
│       ├── 📂 assets/            # Static assets
│       ├── 📂 components/        # Shared UI components
│       │   ├── AppShell.tsx      # Main layout wrapper
│       │   ├── CinemaFloorBedMap.tsx
│       │   ├── PatientICUMonitorModal.tsx
│       │   ├── ScheduleCalendar.tsx
│       │   └── 📂 ui/           # shadcn/ui components
│       ├── 📂 hooks/             # Custom React hooks
│       ├── 📂 lib/               # Utility libraries
│       └── 📂 routes/            # File-based page routes
│           ├── doctor.*.tsx      # Doctor portal
│           ├── nurse.*.tsx       # Nurse portal
│           ├── receptionist.*.tsx
│           ├── patient.*.tsx     # Patient portal
│           └── super-admin.*.tsx
│
├── 📂 database/                  # DB schema management
│   ├── 📂 migrations/
│   └── 📂 seeds/
│
├── 📂 photo/                     # Application screenshots
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0
- **Microsoft SQL Server** (2019 or later, or Azure SQL)

### 1. Clone the Repository

```bash
git clone https://github.com/AnasQ2003/Medicore.git
cd Medicore
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` in `backend/`:

```env
PORT=5000
NODE_ENV=development

DB_SERVER=localhost
DB_PORT=1433
DB_DATABASE=MediCoreDB
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_ENCRYPT=false
DB_TRUST_CERT=true

JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

```bash
npm run dev     # Development (nodemon)
npm start       # Production
```

Backend runs at **http://localhost:5000**

### 3. Database Setup

```bash
cd database
npm install
npx knex migrate:latest
npx knex seed:run
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:3000**

---

## 🗃 Database Schema

Core tables in the MediCore relational schema:

```
Users              → Master user table (all roles)
Doctors            → Doctor profiles & specializations
Nurses             → Nurse profiles & shift assignments
Patients           → Patient demographics & medical info
Appointments       → Scheduling & status tracking
Prescriptions      → Drug orders & dosage
Medications        → Medication administration log
Vitals             → Patient vitals time-series
Beds               → Bed inventory & occupancy
Bills              → Billing & invoice generation
Reports            → Lab & clinical report storage
Notifications      → In-app alert system
LeaveRequests      → Staff leave management
Hospitals          → Multi-branch hospital registry
```

---

## 🔐 Security

| Feature | Implementation |
|---|---|
| **Authentication** | JWT-based stateless tokens with expiry |
| **Password Security** | bcryptjs hashing with configurable salt rounds |
| **API Rate Limiting** | express-rate-limit per IP address |
| **HTTP Security** | Helmet.js (CSP, HSTS, XSS protection, etc.) |
| **CORS Policy** | Strict origin whitelist |
| **Role-Based Access** | JWT claims verified on every protected route |
| **SQL Injection** | Parameterized queries via mssql driver |
| **Data Encryption** | 256-bit AES for sensitive fields |

### Compliance
- ✅ **HIPAA Compliant** architecture
- ✅ **ISO 27001** certified practices
- ✅ **HL7 FHIR** ready integration points
- ✅ **256-bit AES** encrypted data at rest

---

## 🌐 API Reference

### Auth Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Login & receive JWT token |
| `POST` | `/api/auth/forgot-password` | Request password reset |
| `POST` | `/api/auth/reset-password` | Reset with token |

### Clinical Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/patients` | List all patients |
| `GET` | `/api/patients/:id` | Get patient EMR |
| `POST` | `/api/prescriptions` | Create prescription |
| `GET` | `/api/appointments` | List appointments |
| `POST` | `/api/appointments` | Book appointment |
| `PUT` | `/api/appointments/:id` | Update appointment status |
| `GET` | `/api/vitals/:patientId` | Get vitals history |
| `POST` | `/api/vitals` | Log new vitals reading |

### Administrative Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/beds` | Get bed occupancy map |
| `GET` | `/api/staff` | List all staff |
| `GET` | `/api/bills/:patientId` | Get patient invoices |
| `POST` | `/api/leave` | Submit leave request |
| `PUT` | `/api/leave/:id` | Approve/reject leave |
| `GET` | `/api/notifications` | Get user notifications |

---

## 👥 Demo Accounts

After running seeds, the following accounts are available:

| Role | Email | Password |
|---|---|---|
| Super Admin | admin@medicore.app | Admin@1234 |
| Doctor | doctor@medicore.app | Doctor@1234 |
| Nurse | nurse@medicore.app | Nurse@1234 |
| Receptionist | reception@medicore.app | Reception@1234 |
| Patient | patient@medicore.app | Patient@1234 |

> ⚠️ **Change all demo passwords before deploying to production.**

---

## 🚀 Deployment

### Production Environment Variables

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=<strong-random-64-char-minimum-secret>
DB_SERVER=<production-sql-server-host>
DB_DATABASE=MediCoreDB
DB_USER=<production-db-user>
DB_PASSWORD=<production-db-password>
DB_ENCRYPT=true
```

### Build Frontend

```bash
cd frontend
npm run build
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

**Built with ❤️ by [Anas Qureshi](https://github.com/AnasQ2003)**

[![GitHub](https://img.shields.io/badge/GitHub-AnasQ2003-181717?style=for-the-badge&logo=github)](https://github.com/AnasQ2003)

*MediCore HMS — Powering smarter, safer, and faster healthcare delivery.*

<sub>MediCore v2.6.0 © 2026 MediCore Health Systems Pvt. Ltd. All rights reserved.</sub>

</div>
