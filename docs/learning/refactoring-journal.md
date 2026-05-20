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
