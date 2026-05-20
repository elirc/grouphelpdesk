<!-- Author: Jordan Park | Issue: #30 -->

# Getting Started

HelpDesk can run either directly on your machine or through Docker.

## Prerequisites

- Node.js 20+
- npm 9+
- Docker Desktop for container-based setup
- Git

## Quick Start with Docker

From the repository root:

```bash
docker compose -f docker/docker-compose.yml up --build
```

The client is available at `http://localhost:3000`. The API is available at
`http://localhost:3001`.

## Development Setup

Install dependencies:

```bash
npm install
```

Create a local `.env` file for the server:

```bash
DATABASE_URL="file:./dev.db"
PORT=3001
LOG_LEVEL=info
```

Generate Prisma client code:

```bash
npm run db:generate --workspace @helpdesk/server
```

Create and seed the SQLite database:

```bash
npm run db:push --workspace @helpdesk/server
npm run db:seed --workspace @helpdesk/server
```

Run the server:

```bash
npm run dev --workspace @helpdesk/server
```

Run the client in another terminal:

```bash
npm run dev --workspace @helpdesk/client
```

## Logs

The API writes structured JSON logs through Pino. For easier local reading:

```bash
npm run dev --workspace @helpdesk/server | npx pino-pretty
```

## Validation

```bash
npm run lint
npm run typecheck
npm test
```

## CI

GitHub Actions runs lint, type-check, Prisma generation, and tests on pull
requests and pushes to `main`. A lighter lint-only workflow provides fast PR
feedback.
