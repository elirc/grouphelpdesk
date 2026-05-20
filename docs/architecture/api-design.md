# API Design

The HelpDesk API is a RESTful JSON API served under `/api`. This document defines
the conventions and the first resource contract the team will implement:
Tickets.

## Base URL

```text
/api
```

All endpoints in this document are relative to that base path.

## General Conventions

### Request and Response Format

Requests with bodies use JSON. Responses return JSON unless the endpoint has no
body.

Clients should send:

```http
Content-Type: application/json
Accept: application/json
```

### Status Codes

| Status | Meaning                                           |
| ------ | ------------------------------------------------- |
| `200`  | Request succeeded                                 |
| `201`  | Resource was created                              |
| `400`  | Request is malformed                              |
| `404`  | Resource was not found                            |
| `422`  | Request is valid JSON but fails domain validation |
| `500`  | Unexpected server error                           |

### Error Shape

All errors should use this shape:

```ts
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

Example:

```json
{
  "error": {
    "code": "TICKET_NOT_FOUND",
    "message": "Ticket could not be found."
  }
}
```

### Pagination

List endpoints use `page` and `limit` query parameters:

```text
?page=1&limit=20
```

Paginated responses use this shape:

```ts
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## Shared Ticket Types

These TypeScript-style shapes describe the API contract. The exact shared types
will live in `@helpdesk/shared` once application code begins.

```ts
type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED';

type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  requesterId: string;
  assigneeId?: string | null;
  teamId?: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  closedAt?: string | null;
}
```

## Tickets Resource

### Create a Ticket

```text
POST /api/tickets
```

Creates a new support ticket. New tickets default to `OPEN` unless a later phase
introduces workflow-specific creation rules.

Request body:

```ts
interface CreateTicketRequest {
  title: string;
  description: string;
  priority: TicketPriority;
  requesterId: string;
  teamId?: string;
  tags?: string[];
}
```

Success response:

```text
201 Created
```

```ts
interface CreateTicketResponse {
  data: Ticket;
}
```

Error cases:

| Status | Code                    | Reason                                 |
| ------ | ----------------------- | -------------------------------------- |
| `400`  | `INVALID_JSON`          | Request body is not valid JSON         |
| `422`  | `VALIDATION_ERROR`      | Required fields are missing or invalid |
| `500`  | `INTERNAL_SERVER_ERROR` | Unexpected server failure              |

Example request:

```json
{
  "title": "Cannot access payroll dashboard",
  "description": "The payroll dashboard shows a blank page after login.",
  "priority": "HIGH",
  "requesterId": "user_123",
  "teamId": "team_it",
  "tags": ["payroll", "access"]
}
```

Example response:

```json
{
  "data": {
    "id": "ticket_001",
    "title": "Cannot access payroll dashboard",
    "description": "The payroll dashboard shows a blank page after login.",
    "status": "OPEN",
    "priority": "HIGH",
    "requesterId": "user_123",
    "assigneeId": null,
    "teamId": "team_it",
    "tags": ["payroll", "access"],
    "createdAt": "2026-05-20T14:30:00.000Z",
    "updatedAt": "2026-05-20T14:30:00.000Z",
    "resolvedAt": null,
    "closedAt": null
  }
}
```

### List Tickets

```text
GET /api/tickets
```

Returns a paginated list of tickets. Filters are optional and can be combined.

Query parameters:

```ts
interface ListTicketsQuery {
  page?: number;
  limit?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  assigneeId?: string;
  requesterId?: string;
  teamId?: string;
  tag?: string;
  search?: string;
}
```

Success response:

```text
200 OK
```

```ts
type ListTicketsResponse = PaginatedResponse<Ticket>;
```

Error cases:

| Status | Code                    | Reason                                       |
| ------ | ----------------------- | -------------------------------------------- |
| `400`  | `INVALID_QUERY`         | Query parameter has an invalid type or value |
| `422`  | `VALIDATION_ERROR`      | Filter combination is not allowed            |
| `500`  | `INTERNAL_SERVER_ERROR` | Unexpected server failure                    |

Example request:

```text
GET /api/tickets?page=1&limit=20&status=OPEN&priority=HIGH
```

Example response:

```json
{
  "data": [
    {
      "id": "ticket_001",
      "title": "Cannot access payroll dashboard",
      "description": "The payroll dashboard shows a blank page after login.",
      "status": "OPEN",
      "priority": "HIGH",
      "requesterId": "user_123",
      "assigneeId": null,
      "teamId": "team_it",
      "tags": ["payroll", "access"],
      "createdAt": "2026-05-20T14:30:00.000Z",
      "updatedAt": "2026-05-20T14:30:00.000Z",
      "resolvedAt": null,
      "closedAt": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### Get a Single Ticket

```text
GET /api/tickets/:id
```

Returns one ticket by ID.

Path parameters:

```ts
interface GetTicketParams {
  id: string;
}
```

Success response:

```text
200 OK
```

```ts
interface GetTicketResponse {
  data: Ticket;
}
```

Error cases:

| Status | Code                    | Reason                            |
| ------ | ----------------------- | --------------------------------- |
| `404`  | `TICKET_NOT_FOUND`      | No ticket exists for the given ID |
| `500`  | `INTERNAL_SERVER_ERROR` | Unexpected server failure         |

### Update a Ticket

```text
PATCH /api/tickets/:id
```

Updates editable ticket fields. Status changes must follow the allowed workflow:
`OPEN -> IN_PROGRESS -> WAITING -> RESOLVED -> CLOSED`.

Path parameters:

```ts
interface UpdateTicketParams {
  id: string;
}
```

Request body:

```ts
interface UpdateTicketRequest {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assigneeId?: string | null;
  teamId?: string | null;
  tags?: string[];
}
```

Success response:

```text
200 OK
```

```ts
interface UpdateTicketResponse {
  data: Ticket;
}
```

Error cases:

| Status | Code                    | Reason                                      |
| ------ | ----------------------- | ------------------------------------------- |
| `400`  | `INVALID_JSON`          | Request body is not valid JSON              |
| `404`  | `TICKET_NOT_FOUND`      | No ticket exists for the given ID           |
| `422`  | `VALIDATION_ERROR`      | Field value or status transition is invalid |
| `500`  | `INTERNAL_SERVER_ERROR` | Unexpected server failure                   |

### Delete a Ticket

```text
DELETE /api/tickets/:id
```

Deletes a ticket. Early phases may implement hard deletion for simplicity. Later
phases can revisit soft deletion if audit requirements become more important.

Path parameters:

```ts
interface DeleteTicketParams {
  id: string;
}
```

Success response:

```text
200 OK
```

```ts
interface DeleteTicketResponse {
  data: {
    id: string;
    deleted: true;
  };
}
```

Error cases:

| Status | Code                    | Reason                            |
| ------ | ----------------------- | --------------------------------- |
| `404`  | `TICKET_NOT_FOUND`      | No ticket exists for the given ID |
| `500`  | `INTERNAL_SERVER_ERROR` | Unexpected server failure         |

## Future Endpoints

These endpoints are planned for later phases. They are listed here to show the
direction of the API without committing to full request and response contracts
too early.

### Comments

```text
POST   /api/tickets/:ticketId/comments
GET    /api/tickets/:ticketId/comments
PATCH  /api/comments/:id
DELETE /api/comments/:id
```

### Assignment

```text
PATCH /api/tickets/:id/assign
PATCH /api/tickets/:id/team
```

### Dashboard

```text
GET /api/dashboard/summary
GET /api/dashboard/tickets-by-category
GET /api/dashboard/agent-workload
```

### Knowledge Base

```text
POST   /api/articles
GET    /api/articles
GET    /api/articles/:id
PATCH  /api/articles/:id
DELETE /api/articles/:id
```

### Users and Teams

```text
GET /api/users
GET /api/users/:id
GET /api/teams
GET /api/teams/:id
```
