# AlertBridge Backend Guide

Owner: Person B
Primary branch: `feature/backend-alert-platform`

This document describes the current backend implementation and remaining production work. The shared client/server contract lives in [docs/CONTRACT.md](docs/CONTRACT.md).

## Current Implementation

- Express application in `server/`
- CORS, JSON parsing, health route, 404 handling, and centralized API errors
- Alert routes for create, list, detail, process, send, view, acknowledge, and statistics
- In-memory alert and recipient models with indexes
- Seeded cyclone alert and recipient delivery/view/acknowledgement records
- Immutable `officialMessage` model property
- Deterministic processing service for simplified, translated, and visual representations
- Socket.IO service for sent, received, viewed, acknowledged, and error events
- Validation middleware for alert creation
- Node built-in test runner with health and backend behavior coverage

## Persistence Reality

The current database layer is an in-memory model, not PostgreSQL. Data is initialized on server start and is lost on restart. PostgreSQL, migrations, backups, and production retention policies are future work.

## Run and Test

From the repository root:

```bash
npm run dev:server
npm run test
```

Health endpoint: `http://localhost:3000/health`

## API Ownership

The backend owns the HTTP and Socket.IO contract documented in [docs/CONTRACT.md](docs/CONTRACT.md). Lifecycle state must be persisted before its corresponding realtime event is emitted.

Important invariants:

- `officialMessage` cannot be replaced by generated content.
- Recipient status progresses only from `PENDING` to `DELIVERED` to `VIEWED` to `ACKNOWLEDGED`.
- Repeated acknowledgement is idempotent.
- Missing alerts use the shared error response format.
- Statistics currently expose `totalRecipients`, `delivered`, `viewed`, `acknowledged`, and `acknowledgementRate`.

## Remaining Backend Work

- Replace in-memory models with PostgreSQL and migrations.
- Add authentication and role-based authorization for authorities.
- Add signed alerts, audit logs, rate limiting, and secure secret handling.
- Add stronger lifecycle validation for send and expiration behavior.
- Add production AI provider integration behind the processing service interface.
- Add broader API, socket, and persistence tests.

## Backend Handoff

Before merging client integration:

- [ ] Contract responses are covered by API tests.
- [ ] View and acknowledgement endpoints are idempotent and tested.
- [ ] Statistics match the documented response shape.
- [ ] Socket events are emitted only after persistence.
- [ ] Seeded demo flow works after a clean server start.
- [ ] Client integration has been verified in two browser sessions.
