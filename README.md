<div align="center">

<img src="public/favicon/web-app-manifest-192x192.png" width="96" alt="DesignDojo logo" />

# DesignDojo

**Train for system design interviews: an AI design mentor, HLD/LLD workspaces and an architecture generator on an infinite canvas.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

</div>

---

## Overview

DesignDojo combines an Excalidraw-based canvas with diagram parsers that turn what you draw into a structured graph (AST). An LLM then reviews your design, chats about it, generates code or Terraform, or acts as a mock interviewer.

## Features

| Module | What it does |
| --- | --- |
| **Blank Canvas** | Freeform infinite whiteboard for brainstorming. |
| **LLD Workspace** | UML class, interface, object, activity and sequence diagrams. Relationships (inheritance, aggregation, composition) are extracted from the drawing; AI review against SOLID/OOP; boilerplate code generation. |
| **HLD Workspace** | 50+ cloud components (Kafka, Redis, load balancers, gateways…), protocol-aware edges, cost estimation, SPOF/bottleneck highlighting, Terraform (`main.tf`) generation. |
| **AI Design Mentor** | Streaming chat with mentor / interview / review / learning modes and PDF context, plus saved conversations. |
| **AI Design Generator** | Describe a system in plain English and get an HLD diagram plus a written explanation. |
| **Admin dashboard** | Visitor analytics, per-feature AI usage, global and per-user AI quotas, role management. |

## Tech stack

| Category | Technologies |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion |
| Diagramming | Excalidraw, Mermaid, custom AST extraction |
| AI | Groq (`openai/gpt-oss-120b`) via REST and the Vercel AI SDK |
| Backend | Next.js route handlers, MongoDB (Mongoose), NextAuth (Google/GitHub) + email/password JWT |

## Getting started

### Prerequisites
- Node.js 20+
- A MongoDB database (local or Atlas)
- A [Groq API key](https://console.groq.com/keys)

### Setup

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Open http://localhost:3000.

### Environment variables

See [`.env.example`](.env.example) for the full list. The essentials:

| Variable | Required | Notes |
| --- | --- | --- |
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `GROQ_API_KEY` | ✅ | Server-only. **Never** use a `NEXT_PUBLIC_` prefix for it. |
| `JWT_SECRET` | ✅ | ≥ 32 random characters (`openssl rand -base64 48`). The app refuses to issue logins without it. |
| `NEXTAUTH_SECRET`, `NEXTAUTH_URL` | ✅ | Needed by NextAuth |
| `NEXT_PUBLIC_SITE_URL` | ✅ in prod | Public URL used for metadata, sitemap and robots. Must be set **at build time** (`NEXT_PUBLIC_*` values are inlined by `next build`). |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Recommended | Seeds the admin account on first DB connection (password ≥ 12 chars). If the email already exists, that user is promoted to admin. |
| `GOOGLE_*`, `GITHUB_*` | Optional | OAuth providers are only enabled when configured |
| `SMTP_*` | Optional | Needed for password-reset emails |

## Security model

- **Auth.** Email/password logins get an httpOnly, `SameSite=Strict` JWT that holds only the user id. Role and email are re-read from the database on every request, so promoting or demoting a user takes effect immediately.
- **No default credentials.** The admin account exists only if you configure `ADMIN_EMAIL`/`ADMIN_PASSWORD`.
- **Password reset.** OTPs are 6-digit and generated with `crypto.randomInt`. Only a SHA-256 hash is stored, they expire after 10 minutes, and each allows 5 attempts, counted atomically.
- **Input handling.** Credentials and IDs are type-checked before they reach MongoDB, which blocks NoSQL operator injection. Chat histories, ASTs, PDFs and history records all have size caps.
- **AI cost control.** Every AI endpoint requires sign-in and goes through atomic per-user quotas. The mentor's system prompt is built on the server, and clients can't inject `system` messages.
- **Rate limiting** applies to login, signup, password reset, feedback and PDF parsing. It's in-memory and per instance; for strict limits on serverless, swap in a shared store such as Upstash Redis.
- **Rendering.** Mermaid runs with `securityLevel: 'strict'`. Internal error details are hidden in production responses.
- **Account linking.** OAuth sign-ins aren't automatically linked to existing email/password accounts, because sign-up doesn't verify email ownership.

## Project structure

```text
src/
├── app/                  # App Router pages, layouts and API route handlers
│   ├── api/              # auth, ai/*, admin/*, analytics, feedback
│   └── dashboard/        # canvas, hld, lld, ai-generator, mentor, admin
├── components/           # UI, canvas plugins (HLD / LLD / AI generator), mentor chat
├── context/ store/       # Auth context, Zustand mentor store
├── lib/                  # db, auth, jwt, quota, rate limiting, site config
├── models/               # Mongoose schemas
└── services/ai/          # Groq provider, prompts, input sanitisation
public/                   # icons, PWA manifest, service worker
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build (type-checked) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |

## Credits & license

DesignDojo is a modified version of [ArchMind](https://github.com/Varni1512/ArchMind) by **Varnikumar Patel**, used under the MIT License. See [LICENSE](LICENSE).

The main changes from the original:
- Security hardening: removed the hardcoded admin account, forgeable JWTs, NoSQL injection in password reset, prompt injection in the mentor chat, unauthenticated AI endpoints and loose Mermaid rendering.
- Atomic quotas and mentor chat persistence (one save per reply instead of one per streamed chunk).
- Fixed PDF parsing for pdf-parse v2.
- Build: type errors are no longer ignored; lint errors fixed.
- New branding.
