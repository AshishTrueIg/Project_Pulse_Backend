# Project Management Backend

Backend repository for the internal project, people, feedback, health, milestone,
and financial management platform.

## Product authorship

Project Pulse was conceived, designed and engineered by **Ashish Agrawal**,
Product & Engineering Lead. The product was initiated in 2026.

See [AUTHORS.md](AUTHORS.md) for the permanent creator and contributor record.

## Stack

- Node.js 20.18
- Express 4
- Babel
- PostgreSQL
- Sequelize and Sequelize CLI
- Convict configuration
- AJV and Express Validator
- JWT and bcrypt
- Pino logging
- Jest and Supertest
- OpenAPI/Swagger UI

The structure follows the existing 29B admin backend: configuration, database
models and migrations, versioned REST routes, controllers, services,
middlewares, JSON schemas, errors, and utilities.

## Development

```bash
cp .env.example .env
npm install
docker compose up -d postgres
npm run db:setup
npm run start:dev
```

Useful URLs:

- API health: `http://localhost:4001/api/v1/health`
- Swagger UI: `http://localhost:4001/api-docs`

The local seeds create a clean workspace, the standard access roles and a
bootstrap super administrator. They do not create sample people, clients,
projects, feedback or financial records.

- Email: `admin@pp.com`
- Password: `U$er1234`
- Role: `owner`

Use Settings, Invitations and New project to complete the initial company
setup. The bootstrap credential is for local development only and must never
be used in a deployed environment.

### Invitation email delivery

Local development uses Nodemailer's JSON transport, so creating or resending an
invitation returns a development-only copyable acceptance link. To deliver real
email, set `MAIL_TRANSPORT=smtp` and configure `SMTP_HOST`, `SMTP_PORT`,
`SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM_NAME` and
`MAIL_FROM_ADDRESS` in `.env`.

## Implemented foundation

- Organization-scoped users and standard roles
- Password authentication with bcrypt
- Short-lived JWT access tokens
- Rotating, revocable refresh sessions in an HTTP-only cookie
- Backend permission middleware with active-user checks
- Login audit records
- Secure one-time user invitations with hashed tokens, expiry, resend, revoke,
  SMTP delivery status and audited acceptance
- Project filtering, pagination, scoped detail, creation, and updates
- Audited milestone/MVP, team-assignment, and risk write workflows
- Draft, publish, employee-visibility, and acknowledgement feedback rules
- Permission-isolated contracts and billing records with server-calculated
  outstanding amount, contribution, and estimated margin
- Seeded clients, projects, assignments, milestones, risks, feedback, contracts,
  and billing records
- Protected manager dashboard summary from PostgreSQL
- OpenAPI coverage for the complete project workspace API

## Database design

- [Version 1 entity-relationship diagram](docs/DATABASE_ERD.md)
- [Interactive local ERD viewer](docs/database-erd-viewer.html)
- [Single-page vector ERD PDF](docs/PROJECT_MANAGEMENT_DATABASE_ERD.pdf)
- [Standalone ERD SVG](docs/DATABASE_ERD.svg)

## Project workspace API

- `GET/POST /api/v1/projects`
- `GET/PATCH /api/v1/projects/:projectId`
- `POST/PATCH /api/v1/projects/:projectId/milestones`
- `POST/PATCH/DELETE /api/v1/projects/:projectId/members`
- `POST/PATCH /api/v1/projects/:projectId/risks`
- `GET/POST/PATCH /api/v1/projects/:projectId/feedback`
- `GET/PUT/POST/PATCH /api/v1/projects/:projectId/financials`
