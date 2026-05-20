# System Overview

HelpDesk is a three-tier full-stack application organized as an npm workspaces
monorepo. The system is intentionally small enough for learning, but structured
like a professional codebase so collaboration, testing, and review habits are
realistic.

## Architecture Diagram

```text
┌──────────────────────────┐
│ React Client             │
│ Vite + TypeScript        │
│ Pages, components, hooks │
└─────────────┬────────────┘
              │ JSON over HTTP
              ▼
┌──────────────────────────┐
│ Express API              │
│ Routes, controllers,     │
│ services, data access    │
└─────────────┬────────────┘
              │ Prisma Client
              ▼
┌──────────────────────────┐
│ SQLite Database          │
│ Tickets, users, comments,│
│ teams, tags, articles    │
└──────────────────────────┘
```

The client talks to the API through JSON HTTP requests. The API owns business
rules and database access. SQLite stores the project data through Prisma, which
gives the TypeScript backend typed database queries.

## Monorepo Structure

The repository uses npm workspaces:

```text
packages/
├── client/   React frontend
├── server/   Express API and Prisma integration
└── shared/   Types and utilities used by both client and server
```

The monorepo is useful for this project because frontend and backend changes
often need to move together. A ticket status type, for example, should be updated
once in `@helpdesk/shared` and consumed by both the API and UI. Keeping the
packages in one repository allows atomic pull requests, a single install step,
and one CI pipeline that can validate the whole system.

The trade-off is that every contributor shares the same dependency tree and
project history. That is acceptable here because the app is intentionally small
and the learning value of seeing the full stack in one place is high.

## Backend Architecture

The backend follows a layered structure:

```text
routes -> controllers -> services -> data access -> Prisma -> database
```

### Routes

Routes register URLs, HTTP methods, middleware, and controller functions. A route
file should answer "what endpoint exists?" but not "what business rule applies?"

Routes should contain:

- Express router setup
- URL paths and HTTP methods
- Middleware composition
- References to controller functions

Routes should not contain:

- Prisma calls
- Ticket workflow rules
- Response formatting beyond attaching middleware

### Controllers

Controllers translate HTTP concepts into application concepts. They read params,
query strings, and request bodies; call services; choose response status codes;
and pass errors to centralized error middleware.

Controllers should contain:

- Request parsing
- Input handoff to services
- Success response mapping
- Error forwarding

Controllers should not contain:

- Database queries
- Complex business decisions
- UI-specific behavior

### Services

Services own business logic. They decide whether a ticket can move from one
status to another, whether required fields are present, and which domain
operation should happen next.

Services should contain:

- Workflow rules
- Validation beyond basic request shape checks
- Coordination between multiple data access calls
- Domain-focused return values

Services should not contain:

- Express request or response objects
- Raw HTTP status codes
- React or UI assumptions

### Data Access and Prisma

The data access layer owns Prisma calls and database-specific query details. It
keeps the rest of the backend from depending directly on table structure.

Data access should contain:

- Prisma queries
- Query filters and includes
- Persistence-focused mapping

Data access should not contain:

- HTTP response behavior
- UI formatting
- Cross-feature business orchestration

## Frontend Architecture

The frontend will be organized around route-level pages, reusable components,
custom hooks, and API services.

### Pages

Pages represent route-level screens such as a ticket list, ticket detail, or
dashboard. A page composes smaller UI pieces and coordinates the screen-level
data needs.

### Components

Components are reusable UI building blocks. They should receive data through
props, emit events through callbacks, and avoid knowing how API requests are made
unless they are intentionally container-level components.

### Hooks

Hooks manage reusable state and data-fetching behavior. For example,
`useTickets` could eventually own loading state, filters, pagination, and API
calls for ticket lists.

### Services

Frontend services isolate HTTP calls. Components and hooks should call a typed
API client rather than hand-writing `fetch` calls throughout the UI.

## Data Flow: Create Ticket

This is the expected flow for creating a ticket once Phase 1 begins:

1. A requester fills out the React ticket form and clicks submit.
2. The form validates basic client-side requirements like title and description.
3. A frontend hook or submit handler calls the API client.
4. The API client sends `POST /api/tickets` with a JSON request body.
5. The Express route receives the request and delegates to the ticket controller.
6. The controller reads the body, maps it into a service input, and calls the ticket service.
7. The service applies business rules such as default status, allowed priority, and required requester data.
8. The service calls the data access layer.
9. The data access layer uses Prisma Client to insert the ticket into SQLite.
10. Prisma returns the persisted ticket.
11. The service returns a domain result to the controller.
12. The controller sends a `201 Created` JSON response.
13. The API client returns the created ticket to the React code.
14. The UI updates the ticket list or navigates to the ticket detail page.

This flow keeps each layer focused. The form handles user interaction, the
controller handles HTTP, the service handles business rules, and Prisma handles
persistence.

## Intentionally Out of Scope

Real authentication is out of scope for the early phases. The project may use
mocked users or simplified role assumptions so the team can focus on architecture
and collaboration before security complexity.

Real deployment is out of scope. Docker and CI/CD are included for learning, but
the app is not intended to become a hosted production service.

WebSockets and live updates are out of scope. Ticket systems often benefit from
real-time updates, but polling or manual refresh is enough for the learning goals
of this project.

Advanced observability is out of scope at first. Structured logging with Pino is
included so the team can learn useful operational habits without building a full
monitoring platform.
