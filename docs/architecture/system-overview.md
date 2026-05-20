<!-- Author: Morgan Lee | Issue: #42 -->

# System Overview

HelpDesk is a TypeScript monorepo with a React client, Express API, shared types,
SQLite database, and operational tooling.

## Final Architecture

```text
React + Vite Client
  pages, components, hooks, api client
        |
        | JSON over HTTP
        v
Express API
  routes -> controllers -> services -> Prisma
        |
        v
SQLite
  users, tickets, comments, articles, activity logs

Operational layer:
  Pino logs, request IDs, response timing, /health, Docker, GitHub Actions
```

## Monorepo Packages

- `@helpdesk/client` owns React UI, routing, hooks, forms, dashboard charts, and
  knowledge base screens.
- `@helpdesk/server` owns Express, Prisma, services, routes, middleware, logging,
  and database seed data.
- `@helpdesk/shared` owns enums and interfaces consumed by both client and
  server.

## Backend Layers

Routes register URLs and HTTP methods. Controllers translate request/response
details. Services own business rules and Prisma queries. Utilities handle shared
concerns like errors, logging, and status transitions.

```text
routes -> controllers -> services -> Prisma -> SQLite
```

## Frontend Layers

Pages represent routes. Components render focused UI. Hooks manage data fetching
state. `services/api.ts` centralizes fetch, query string construction, response
typing, and API error handling.

```text
pages -> hooks/components -> api client -> Express API
```

## Main Data Flows

Creating a ticket starts in `TicketForm`, moves through `api.tickets.create`,
reaches `POST /api/tickets`, passes through the ticket controller, and is created
by the ticket service through Prisma. The service also writes an activity log.

Adding a comment goes through the comment API. The service filters internal notes
based on viewer role when reading comments.

Dashboard metrics are computed by `dashboardService` using Prisma counts,
grouping, and tag aggregation.

Knowledge base articles are stored as markdown and rendered in the client with a
small markdown renderer.

## Operational Concerns

Pino emits structured JSON logs. Request middleware assigns request IDs so logs
can be correlated. Response-time middleware records request counts, average
latency, and slow requests for the system dashboard endpoint.

## Out of Scope

Real authentication, production deployment, WebSockets, and full RBAC remain
future learning opportunities.
