# Usher Track (VIOTRACK)

A comprehensive Usher Attendance Tracking and Monitoring System using QR Codes, Real-Time Dashboard, and Mobile Scanner.

## 🚀 Features
- **Hierarchical Role Management**: Primary Leader $\rightarrow$ Assistant Leader $\rightarrow$ Regular Member.
- **QR Code Generation & Scanning**: Dynamic badges with downloadable QR cards and instant camera scanning.
- **Sunday Services Timeline**: Track attendance across active, past, and upcoming Sunday services.
- **Live Attendance Feed**: Real-time logging of on-time, late, and excused member arrivals.
- **Supabase / PostgreSQL Backend**: Relational schema with UUIDs, roles, timestamps, and indexes.

## 📁 Repository Structure
- `dashboard/`: React + Vite + TypeScript + Tailwind/CSS web management dashboard.
- `mobile/`: React Native (Expo) mobile scanner & member digital badge application.
- `database/`: PostgreSQL / Supabase schemas (`schema.sql`) and sample seed records (`seed.sql`).

## 🛠️ Quick Start

### Web Dashboard
```bash
cd dashboard
npm install
npm run dev
```

### Mobile App
```bash
cd mobile
npm install
npm start
```
