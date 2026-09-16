# InnovProcure

InnovProcure is a government innovation procurement platform for discovering, evaluating, piloting, and scaling startup solutions.

## Stack

- Frontend: React + Vite + React Router + Tailwind CSS + Recharts
- Backend: Node.js + Express + Prisma + PostgreSQL + JWT
- Auth: bcrypt + JWT + role-based access control
- File uploads: Multer
- AI abstraction: modular service with deterministic fallback
- Python rules analyzer: `server/ai/analyzer.py`, automatically used when Python is available

## Features

- Government problem management and publishing
- Startup discovery and matching
- Proposal submission and evaluation
- Pilot and KPI tracking
- Procurement readiness engine
- Innovation repository
- Audit log timeline
- Admin management dashboard
- Notifications

## Project structure

```text
innovprocure/
├── client/
│   └── src/
├── server/
│   ├── prisma/
│   └── src/
├── uploads/
├── .env.example
├── README.md
└── package.json
```

## Local setup

1. Create PostgreSQL database `innovprocure`
2. Copy `.env.example` to `server/.env` and replace `<POSTGRES_PASSWORD>` with the password created during PostgreSQL installation
3. Install dependencies
4. Run Prisma migrations and seed
5. Start frontend and backend

### Install

```bash
npm install
```

### Database migration

```bash
npm run db:migrate
npm run db:seed
```

### Run app

```bash
npm run dev
```

## Real AI setup

Problem analysis supports Google Gemini and Blackbox API providers. Create a key from the provider you choose, then put it only in `server/.env`:

```env
AI_PROVIDER="gemini"
AI_MODEL="gemini-2.0-flash"
AI_API_KEY="your-real-gemini-key"
```

For a Blackbox-style key beginning with `sk-bl`, use:

```env
AI_PROVIDER="blackbox"
AI_MODEL="blackboxai/openai"
AI_API_KEY="your-real-blackbox-key"
```

The endpoint `POST /api/problems/analyze` returns `503` when the key is missing or the provider rejects it; it does not silently label deterministic demo output as real AI. The Python analyzer in `server/ai/analyzer.py` remains available for local experimentation when `AI_PROVIDER="python"` is explicitly selected.

## Demo accounts

After seeding, use:

- Admin: admin@innovprocure.gov / admin123
- Government: officer@urban.gov / officer123
- Startup: founder@smartroute.ai / startup123
- Evaluator: eva@innovation.gov / evaluator123

## Notes

This is a fictional demo system for local development.
