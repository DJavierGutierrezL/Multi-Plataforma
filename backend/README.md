# Multi-Plataforma Backend (Generated scaffold)

## Overview
This repository contains:
- `frontend/` - your existing React + TypeScript frontend (copied from your uploaded ZIP).
- `backend/` - Express + Prisma scaffold implementing the API contract described.

## Backend quickstart
1. Install dependencies
```bash
cd backend
npm install
```

2. Set environment variables
- Edit `.env` and set `DATABASE_URL` (already set in this package using the value you provided) and `JWT_SECRET`.

3. Initialize Prisma (generate client & migrate)
```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. (Optional) Seed data
```bash
node scripts/seed.js
```

5. Start server
```bash
npm run dev
# or
npm start
```

Server listens on port defined in `.env` (default 10000). API base: `/api`

## Notes
- The Prisma client requires `npx prisma generate` before running the server.
- The `.env` file in this package contains the DATABASE_URL you provided. Keep it secure.
- The scaffold provides endpoints for authentication, business data synchronization, admin dashboard, and subscriptions.