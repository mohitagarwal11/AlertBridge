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

## Remaining Backend Implementation

Complete the backend work in this order. B1-B4 are required for the next client integration phase; B5 is production hardening.

### B1: Contract and API Readiness

- [ ] Verify every route in [docs/CONTRACT.md](docs/CONTRACT.md) has an API test.
- [ ] Verify create responses always match the shared alert shape.
- [ ] Verify list responses consistently use `{ data: alerts }`.
- [ ] Verify statistics consistently use `totalRecipients`, `delivered`, `viewed`, `acknowledged`, and `acknowledgementRate`.
- [ ] Verify all failure paths use the shared `{ error: { code, message } }` shape.
- [ ] Add request validation for type, severity, affected area, languages, and expiry.

### B2: Lifecycle and Persistence Guarantees

- [ ] Confirm view and acknowledgement endpoints are idempotent for repeated requests.
- [ ] Confirm backward recipient status transitions are rejected.
- [ ] Validate that send cannot operate on an invalid or expired alert.
- [ ] Define expiration behavior and emit `alert:expired` only after the contract is updated.
- [ ] Keep `officialMessage` immutable through create, process, send, and update paths.
- [ ] Document the in-memory reset behavior until persistent storage is introduced.

### B3: Client Integration Support

- [ ] Provide stable seeded alert data for the two-browser integration flow.
- [ ] Ensure `POST /view` and `POST /acknowledge` return the persisted recipient record.
- [ ] Ensure statistics emitted in Socket.IO payloads match the HTTP statistics response.
- [ ] Emit realtime events only after the corresponding model state is updated.
- [ ] Handle disconnected sockets without affecting HTTP persistence.
- [ ] Provide reproducible local environment values through `server/.env.example`.

### B4: Backend Verification

- [ ] Add API tests for every documented endpoint and error condition.
- [ ] Add persistence tests for create, update, status transitions, and statistics.
- [ ] Add Socket.IO tests for sent, received, viewed, acknowledged, and disconnect behavior.
- [ ] Add a clean-start seeded demo test.
- [ ] Run `npm run test` before every backend pull request.

### B5: Production Hardening

- [ ] Replace in-memory models with PostgreSQL and migrations.
- [ ] Add authentication and role-based authorization for authorities.
- [ ] Add signed alerts, audit logs, rate limiting, and secure secret handling.
- [ ] Add retention, expiration, revocation, and backup policies.
- [ ] Add a production AI provider behind the processing service interface.
- [ ] Add delivery-channel adapters for SMS, push, or other approved channels.

### Backend Completion Definition

Backend integration readiness is complete when B1-B4 are checked, `npm run test` passes, and the frontend can complete create, process, send, view, acknowledge, and statistics flows against a clean backend start. B5 is a separate production-readiness phase.

## Independence and Special Care

### Safe to implement independently

- B1 contract validation and B2 lifecycle/model work can be developed and tested with Node tests without the frontend branch.
- B4 API, persistence, error, and Socket.IO tests can run against the backend's in-memory models.
- B5 PostgreSQL, authentication, audit, rate-limit, and delivery-channel work is a separate production track.

### Requires frontend coordination before merge

- B3 must preserve the exact response and event shapes in [docs/CONTRACT.md](docs/CONTRACT.md).
- Statistics must keep the `totalRecipients` field name or a coordinated contract change must update the frontend adapter.
- View and acknowledgement responses must remain idempotent so retries from the frontend cannot inflate counts.
- Socket events must include `alertId` and must be emitted only after model state is updated.
- Seed data must remain stable while the frontend two-browser flow is being verified.

### Branch rule

Person B can finish B1, B2, and B4 independently. Coordinate B3 with Person A before either integration pull request is merged. Keep B5 separate from the MVP integration unless production infrastructure is explicitly in scope.

## Backend Handoff

Before merging client integration:

- [ ] B1 contract and API readiness is complete.
- [ ] B2 lifecycle and persistence guarantees are complete.
- [ ] B3 client integration support is complete.
- [ ] B4 backend verification is complete.
- [ ] Client integration has been verified in two browser sessions.
