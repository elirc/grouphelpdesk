# HelpDesk

HelpDesk is a full-stack learning project that simulates an internal support ticket
system and the collaborative engineering practices around it. The goal is not to
ship a production product; the goal is to practice planning, architecture, Git
workflows, review habits, CI/CD, documentation, testing, and operational thinking
in a realistic codebase.

## Team Roster

| Persona     | GitHub Username   | Ownership Area                                             |
| ----------- | ----------------- | ---------------------------------------------------------- |
| Alex Chen   | `alex-chen-dev`   | Backend API, database schema, Prisma, business logic       |
| Sam Rivera  | `sam-rivera-dev`  | Frontend React components, pages, UI/UX, client-side state |
| Jordan Park | `jordan-park-dev` | Infrastructure, Docker, CI/CD, monitoring, logging         |
| Morgan Lee  | `morgan-lee-dev`  | Shared types, auth utilities, testing, docs                |

## Tech Stack

| Layer      | Technology                                                     |
| ---------- | -------------------------------------------------------------- |
| Frontend   | React 18+ with TypeScript, Tailwind CSS, Vite                  |
| Backend    | Node.js, Express, TypeScript                                   |
| Database   | SQLite via Prisma ORM                                          |
| Testing    | Vitest for unit/integration tests, Playwright scaffolded later |
| CI/CD      | GitHub Actions                                                 |
| Containers | Docker and Docker Compose                                      |
| Logging    | Pino structured JSON logging                                   |
| Monorepo   | npm workspaces                                                 |

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+

### Install Dependencies

From the repository root:

```bash
npm install
```

Phase 0 contains project structure, configuration, and documentation only.
Application code begins in Phase 1.

## Project Structure

```text
helpdesk/
├── .github/          GitHub issue templates, PR template, and future workflows
├── docs/             Architecture notes, team guides, ADRs, and learning journal
├── packages/         npm workspace packages for client, server, and shared code
├── docker/           Future Docker and Docker Compose configuration
├── tests/            Future cross-package unit and integration test structure
├── package.json      Root workspace manifest and shared tooling scripts
└── CONTRIBUTING.md   Collaboration, branching, commit, and review guidelines
```

## Packages

| Package            | Purpose                                                                       |
| ------------------ | ----------------------------------------------------------------------------- |
| `@helpdesk/client` | React frontend application, implemented starting in Phase 1                   |
| `@helpdesk/server` | Express API and Prisma-backed business logic, implemented starting in Phase 1 |
| `@helpdesk/shared` | Shared TypeScript types and cross-cutting utilities used by client and server |

## Documentation

Start with [CONTRIBUTING.md](./CONTRIBUTING.md) to understand how the team works
together. The [docs](./docs) directory contains architecture decisions, API
design notes, Git workflow guidance, coding conventions, and the learning journal
that tracks what this project is teaching along the way.
