# Project Management Backend

Backend repository for the internal project, people, feedback, health, milestone,
and financial management platform.

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
npm run start:dev
```

Useful URLs:

- API health: `http://localhost:4001/api/v1/health`
- Swagger UI: `http://localhost:4001/api-docs`

## Database design

- [Version 1 entity-relationship diagram](docs/DATABASE_ERD.md)
- [Interactive local ERD viewer](docs/database-erd-viewer.html)
- [Single-page vector ERD PDF](docs/PROJECT_MANAGEMENT_DATABASE_ERD.pdf)
- [Standalone ERD SVG](docs/DATABASE_ERD.svg)

## Initial domain modules

- Authentication, users, roles, and project-scoped authorization
- Clients and projects
- Project assignments, responsibilities, and experience
- Milestones and MVP acceptance
- Weekly project health, risks, blockers, and actions
- Employee feedback, acknowledgement, and improvement goals
- Manager-only contracts, billing, collections, cost, and margin
- Notifications and audit history
