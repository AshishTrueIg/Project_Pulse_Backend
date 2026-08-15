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
- Docker Compose and Make
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

## Docker development (recommended)

The only host requirements are Docker with the Compose plugin and Make. Keep
the `project-management-backend` and `project-management-frontend` repositories
next to each other inside the same parent directory.

```bash
make up
```

On the first run, this command:

1. creates `.env` from `.env.example` when it is missing;
2. builds the API and frontend development images;
3. starts PostgreSQL with a persistent volume;
4. applies all database migrations and idempotent bootstrap seeders;
5. starts the API with Nodemon and the frontend with Next.js hot reload;
6. waits until all three containers are healthy.

The frontend is available at `http://localhost:3000`, the API at
`http://localhost:4001`, Swagger at `http://localhost:4001/api-docs`, and
PostgreSQL is exposed on host port `5433` to avoid clashing with a locally
installed PostgreSQL server.

Useful commands:

```bash
make logs       # follow frontend, API and database logs
make ps         # inspect container health
make shell      # open an API container shell
make db-shell   # open psql
make lint       # run lint inside Docker
make test       # run tests inside Docker
make down       # stop the stack and preserve database data
```

Run `make help` for the complete command list. Database data remains in the
`project-management-postgres` Docker volume after `make down`.

### Portfolio demo mode

The optional portfolio demo is isolated from the normal company workspace and
is disabled by default. Enable it in the backend `.env`:

```env
DEMO_MODE=true
DEMO_ACCOUNT_EMAIL=demo@projectpulse.app
DEMO_ACCOUNT_PASSWORD=Demo@1234
```

Then run `make up`. The idempotent seeder creates a read-only demo account and
a realistic workspace covering the overview, projects, people, feedback,
financials, settings and activity modules. Never enable demo mode for a real
company workspace.

## Production database bootstrap

The production container applies pending migrations and idempotent seeders
before starting the API. A fresh database therefore receives the base
organization, roles and its first owner automatically. Configure the portfolio
owner account in the hosting provider:

```env
NODE_ENV=production
BOOTSTRAP_ADMIN_ENABLED=true
BOOTSTRAP_ADMIN_EMAIL=admin@pp.com
BOOTSTRAP_ADMIN_PASSWORD=U$er1234
BOOTSTRAP_ADMIN_NAME=Project Pulse Administrator
DB_SSL=true
```

Production startup runs in this order:

1. `db:migrate:production` applies only pending schema migrations;
2. `db:seed:production` safely ensures bootstrap and optional demo data exist;
3. `npm start` launches the compiled API.

Bootstrap credentials are used only when creating the first owner; later
deployments do not duplicate or overwrite that account. Setting
`BOOTSTRAP_ADMIN_ENABLED=false` skips owner creation. The public login page
exposes only the read-only demo account, not the full-access owner account.

This startup migration approach is intended for the single API instance used
by the portfolio deployment. A future horizontally scaled deployment should
run migrations once in the hosting platform's release phase instead.

## Native development

```bash
cp .env.example .env
npm install
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
- Clean bootstrap workspace without demo operational records
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
