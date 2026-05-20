<!-- Author: Morgan Lee | Issue: Learning Phase 1 -->

# Refactoring Journal

## Purpose

This journal records each improvement phase as if it were a realistic pull
request. It explains what changed, why it changed, what skill it teaches, and
what tradeoffs remain.

## How To Use This Journal

Read this file before reviewing a phase. It gives you the intent behind the
change so you can review the code and docs with the right questions in mind.

Each entry should include:

- date
- phase
- files changed
- summary of change
- reason for change
- what skill this teaches
- tradeoffs
- future improvement ideas

## 2026-05-20 - Phase 1: Learning Documentation Foundation

### Files Changed

- `docs/learning/improvement-plan.md`
- `docs/learning/codebase-reading-guide.md`
- `docs/learning/current-architecture-review.md`
- `docs/learning/mid-level-swe-skills-map.md`
- `docs/learning/refactoring-journal.md`

### Summary Of Change

Added the learning documentation foundation for the next improvement cycle. This
phase did not change runtime behavior. It created a practical plan, a codebase
reading path, an architecture review, a skills map, and this journal.

### Reason For Change

The repo already has a working broad-stack implementation, but the next requested
changes are large: runtime validation, ticket module refactoring, real auth,
RBAC, TanStack Query, database modeling, and expanded tests.

Doing all of that without first documenting the current architecture would make
the project harder to learn from. The documentation establishes the baseline and
explains why each future improvement matters.

### What Skill This Teaches

This phase teaches engineering orientation:

- inspect before changing
- identify architecture seams
- name risks clearly
- plan changes in reviewable phases
- connect technical changes to learning outcomes

Mid-level engineers are expected to understand the system before refactoring it.

### Tradeoffs

The obvious tradeoff is that no runtime weakness is fixed yet. The app still has
manual request parsing, client-provided identity fields, mixed service
responsibilities, manual frontend fetching, and simplified database modeling.

That is acceptable for this phase because the goal was to create a safe plan and
learning map before touching behavior.

### Future Improvement Ideas

- Phase 2 should add Zod and validation middleware.
- Phase 3 should modularize only tickets first, not every domain.
- Phase 4 should remove trust in `createdBy`, `actorId`, and `viewerRole`.
- Phase 5 should replace `useTickets` and `useComments` with TanStack Query
  hooks.
- Phase 6 should normalize tags and introduce first-class teams.

### Debugging Notes

No runtime behavior changed, so debugging risk is low.

If a future phase breaks behavior, use the reading guide to trace the affected
feature before editing.

### Review Checklist

- Do the docs point to real files in this repo?
- Does the plan avoid a giant rewrite?
- Are risks named honestly?
- Does each future phase teach a practical skill?
- Would a junior engineer know what to read next?

## 2026-05-20 - Phase 2: Backend Validation Upgrade

### Files Changed

- `packages/server/package.json`
- `packages/server/src/middleware/validateRequest.ts`
- `packages/server/src/validation/commonSchemas.ts`
- `packages/server/src/validation/ticketSchemas.ts`
- `packages/server/src/validation/commentSchemas.ts`
- `packages/server/src/validation/knowledgeBaseSchemas.ts`
- `packages/server/src/validation/userSchemas.ts`
- `packages/server/src/routes/tickets.ts`
- `packages/server/src/routes/comments.ts`
- `packages/server/src/routes/knowledgeBase.ts`
- `packages/server/src/routes/users.ts`
- `packages/server/src/controllers/ticketController.ts`
- `packages/server/src/controllers/commentController.ts`
- `packages/server/src/controllers/knowledgeBaseController.ts`
- `packages/server/src/controllers/userController.ts`
- `tests/integration/validation.test.ts`
- `docs/learning/runtime-validation-guide.md`

### Summary Of Change

Added Zod-based request validation at the backend route boundary. Routes now
validate request bodies, query strings, and params before controllers run.
Controllers now read parsed input from `res.locals` instead of manually parsing
raw `req.body`, `req.query`, or `req.params`.

### Reason For Change

The previous controller code used TypeScript casts and manual checks for runtime
HTTP input. That is a common early-career mistake: TypeScript can describe valid
data, but it cannot guarantee that a real request contains valid data.

This phase creates a clear trust boundary.

### What Skill This Teaches

This teaches the difference between compile-time types and runtime validation.
It also teaches where validation belongs in a layered API:

```text
route validation -> controller mapping -> service business rules
```

### Tradeoffs

Validation schemas add files and a dependency. They also require discipline:
shape validation should stay in schemas, while business rules should stay in
services.

For example, Zod validates that a ticket status is a known enum value. The ticket
service still validates whether the status transition is allowed.

### Future Improvement Ideas

- Move ticket validation schemas into a ticket module during Phase 3.
- Add auth-aware validation once the server derives current user identity.
- Add OpenAPI generation from Zod schemas if API documentation needs to stay
  synchronized.
- Add frontend form schemas that share validation intent without coupling the UI
  directly to backend request schemas.

### Debugging Notes

If a request now returns `400`, inspect `error.details.issues`. It should name
the invalid field path and the Zod issue code.

If a request returns `422`, the shape was valid but a service-level business rule
failed.

### Review Checklist

- Are routes validating all unsafe request parts?
- Are controllers smaller than before?
- Do validation errors return `400` consistently?
- Do services still own workflow and permission-style rules?
- Are invalid-input tests present?

## 2026-05-20 - Phase 3: Ticket Domain Modular Refactor

### Files Changed

- `packages/server/src/modules/tickets/ticket.routes.ts`
- `packages/server/src/modules/tickets/ticket.controller.ts`
- `packages/server/src/modules/tickets/ticket.schema.ts`
- `packages/server/src/modules/tickets/ticket.service.ts`
- `packages/server/src/modules/tickets/ticket.repository.ts`
- `packages/server/src/modules/tickets/ticket.mapper.ts`
- `packages/server/src/modules/tickets/ticket.permissions.ts`
- `packages/server/src/modules/tickets/ticket.types.ts`
- `packages/server/src/modules/tickets/ticket.test.ts`
- `packages/server/src/routes/tickets.ts`
- `packages/server/src/controllers/ticketController.ts`
- `packages/server/src/services/ticketService.ts`
- `tests/unit/ticketService.test.ts`
- `docs/learning/backend-module-architecture-guide.md`
- `docs/learning/ticket-domain-walkthrough.md`

### Summary Of Change

Moved the ticket backend into a feature module with separate route, controller,
schema, service, repository, mapper, permission, and type files. The old
route/controller/service files now act as compatibility exports so existing code
keeps working while new ticket work has a clearer home.

### Reason For Change

The ticket domain has grown beyond basic CRUD. It now includes pagination,
filtering, assignment rules, status transition rules, activity logging, and
response mapping. Keeping those concerns in broad folders makes the feature
harder to trace and review.

This phase creates a reference implementation for future backend modules.

### What Skill This Teaches

This teaches separation of responsibilities in a real CRUD backend:

- routes register endpoints and middleware
- schemas validate untrusted HTTP input
- controllers translate HTTP to application calls
- services own business rules
- repositories own Prisma persistence details
- mappers shape database records for API responses
- permission helpers isolate authorization-style questions

Mid-level engineers are expected to know where a change belongs and to avoid
turning controllers into catch-all files.

### Tradeoffs

The module pattern adds files and indirection. For a tiny app, that can feel like
ceremony. In this repo it is justified because HelpDesk is intentionally a
learning artifact for larger full-stack CRUD systems.

Only tickets were refactored. Comments, users, dashboard, and knowledge base
still use the older folder-by-layer layout. That is intentional: one safe module
is better than an uncontrolled rewrite.

### Future Improvement Ideas

- Move comments into `modules/comments/` once auth and visibility rules are
  upgraded.
- Move permission helpers from simple role checks to auth-aware current-user
  checks in Phase 4.
- Add repository tests for complex filters.
- Normalize tags so the mapper no longer has to parse serialized tag data.

### Debugging Notes

For ticket requests, debug in this order:

```text
route schema -> controller -> service -> repository -> mapper
```

A `400` points to schema validation. A `422` points to service-level business
rules. Incorrect database filtering points to the repository. Incorrect response
shape points to the mapper.

### Review Checklist

- Are ticket changes inside `modules/tickets/`?
- Are compatibility exports still present?
- Does the service avoid Express-specific response concerns?
- Does the repository avoid workflow decisions?
- Are tests aligned with the new responsibility boundaries?

## 2026-05-20 - Phase 4: Real Authentication And RBAC

### Files Changed

- `packages/server/prisma/schema.prisma`
- `packages/server/prisma/seed.ts`
- `packages/server/src/routes/auth.ts`
- `packages/server/src/controllers/authController.ts`
- `packages/server/src/services/authService.ts`
- `packages/server/src/middleware/auth.ts`
- `packages/server/src/utils/password.ts`
- `packages/server/src/types/express.d.ts`
- `packages/server/src/modules/tickets/ticket.routes.ts`
- `packages/server/src/modules/tickets/ticket.controller.ts`
- `packages/server/src/routes/comments.ts`
- `packages/server/src/controllers/commentController.ts`
- `packages/server/src/routes/dashboard.ts`
- `packages/server/src/routes/knowledgeBase.ts`
- `packages/server/src/controllers/knowledgeBaseController.ts`
- `packages/client/src/auth/AuthProvider.tsx`
- `packages/client/src/auth/ProtectedRoute.tsx`
- `packages/client/src/pages/LoginPage.tsx`
- `packages/client/src/App.tsx`
- `packages/client/src/services/api.ts`
- `tests/unit/authService.test.ts`
- `docs/learning/auth-and-rbac-guide.md`
- `docs/learning/security-mistakes-in-crud-apps.md`

### Summary Of Change

Added a learning-friendly authentication and RBAC flow. Users now have password
hashes, can log in through `/api/auth/login`, receive an opaque bearer session
token, and access protected routes through auth middleware. The frontend now has
an auth provider, a login page, and protected application routes.

### Reason For Change

The previous app trusted client-provided identity fields such as `createdBy`,
`authorId`, `actorId`, and `viewerRole`. That is acceptable in early scaffolding
but teaches the wrong security habit if left in place.

This phase moves identity-sensitive decisions to the server.

### What Skill This Teaches

This teaches the difference between authentication, authorization, and frontend
route protection. It also teaches that TypeScript types do not make HTTP input
trustworthy.

A mid-level engineer should notice where identity comes from and whether the
backend is enforcing the rule.

### Tradeoffs

Sessions are stored in memory. That keeps the implementation easy to read, but
sessions disappear when the server restarts and would not work across multiple
server instances.

Tokens are stored in localStorage. That is simple for a learning app, but a
production app would need a deeper discussion of XSS, cookies, CSRF, expiration,
and refresh tokens.

### Future Improvement Ideas

- Add database-backed sessions with expiration.
- Add ownership checks so customers can only view their own tickets.
- Add integration tests that log in and exercise protected endpoints.
- Add rate limiting to login.
- Replace compatibility identity fields in shared types once all callers are
  migrated.

### Debugging Notes

A `401` means the request has no valid session. A `403` means the user is logged
in but lacks the role required for the route.

If login fails after schema changes, run Prisma generate and reseed the database
so users have `passwordHash` values.

### Review Checklist

- Is `req.currentUser` used instead of trusting body/query identity fields?
- Are dashboard and assignment routes protected server-side?
- Does login avoid returning `passwordHash`?
- Are frontend route guards treated as UX, not security?
- Are the remaining auth limitations documented honestly?
