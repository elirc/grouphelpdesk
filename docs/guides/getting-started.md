# Getting Started

This guide explains how to set up the HelpDesk repository during Phase 0. At
this stage, the repository contains structure, configuration, and documentation
only. Application code arrives in Phase 1.

## Prerequisites

Install:

- Node.js 20+
- npm 9+
- Git

Check your versions:

```bash
node --version
npm --version
git --version
```

## Clone the Repository

```bash
git clone https://github.com/elirc/grouphelpdesk.git
cd grouphelpdesk
```

## Install Dependencies

Run installation from the repository root:

```bash
npm install
```

The root `package.json` manages npm workspaces for the client, server, and shared
packages. Installing from the root keeps the workspace dependency tree together.

## Validate the Phase 0 Setup

After dependencies are installed, these commands should be available:

```bash
npm run format
npm run lint
npm run typecheck
```

Because Phase 0 does not include application source code yet, these commands are
mostly validating the workspace and tooling setup.

## Git Persona Setup

The project simulates multiple senior engineers working together. To practice
that workflow, read [git-workflow.md](./git-workflow.md) and set up optional Git
persona aliases for Alex, Sam, Jordan, and Morgan.

## What Comes Later

This guide will expand in later phases when Docker, the Express API, the React
client, Prisma schema, tests, and local development services are added.
