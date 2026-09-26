# AlertBridge Backend Implementation

Owner: Person B
Branch: `feature/backend-alert-platform`

This file is the implementation guide for the backend branch. Frontend work happens in `FRONTEND_IMPLEMENTATION.md` on a separate branch.

## Common Rules

These rules apply to both branches and must not be changed independently:

- Preserve `officialMessage` exactly as submitted.
- Use the shared alert object and API contract below.
- Acknowledgement means communication confirmation, not proof that a person is safe.
- Enforce the status order `PENDING -> DELIVERED -> VIEWED -> ACKNOWLEDGED`.
- Do not commit secrets. Use `.env.example` for required configuration.
- Keep backend implementation inside `server/`, `api/`, and database-owned files; avoid editing frontend-owned files.

## Shared Alert Contract

All API responses must use this alert shape:

```javascript
{
  id: "ALR-001",
  type: "cyclone",
  severity: "critical",
  affectedArea: "Coastal Odisha",
  officialMessage: "Original authority message",
  simplified: {
    title: "CYCLONE APPROACHING",
    summary: "Move to a safe location immediately.",
    actions: ["Leave low-lying areas", "Go to a safe shelter"]
  },
  translations: { en: {}, hi: {}, or: {} },
  visualInstructions: [{ icon: "shelter", text: "Go to a safe shelter" }],
  status: "active",
  createdAt: "2026-01-01T12:00:00.000Z",
  expiresAt: "2026-01-02T12:00:00.000Z"
}
```

Required endpoints:

```text
POST /api/alerts                 Create a draft alert
GET  /api/alerts                 List alerts
GET  /api/alerts/:id             Get one alert
POST /api/alerts/:id/process     Generate accessible representations
POST /api/alerts/:id/send        Send an alert
POST /api/alerts/:id/view        Record a citizen view
POST /api/alerts/:id/acknowledge Record acknowledgement
GET  /api/alerts/:id/statistics  Get delivery and acknowledgement totals
```

Required realtime events:

```text
alert:sent
alert:received
alert:viewed
alert:acknowledged
```

All errors must use this format:

```javascript
{ "error": { "code": "ALERT_NOT_FOUND", "message": "Alert was not found" } }
```

## Implementation Tasks

### 1. Service foundation

- [x] Set up Node.js, Express, Socket.IO, and environment configuration.
- [x] Add health endpoint and centralized error middleware.
- [x] Add request validation and CORS configuration.
- [x] Add database connection and migration/seed strategy.
- [x] Add cyclone demo seed data.

### 2. Data model

- [x] Define alert persistence with original message, generated content, status, and timestamps.
- [x] Define translations and visual instructions.
- [x] Define recipient delivery, viewed, and acknowledgement timestamps.
- [x] Add indexes for alert status, creation time, and recipient lookup.
- [x] Ensure generated data cannot replace `officialMessage`.

### 3. Alert lifecycle API

- [x] Implement create, list, detail, process, send, view, acknowledge, and statistics endpoints.
- [x] Validate required fields and reject malformed alert data with the shared error format.
- [x] Enforce `PENDING -> DELIVERED -> VIEWED -> ACKNOWLEDGED` transitions.
- [x] Make acknowledgement idempotent.
- [x] Return the shared alert shape from detail and lifecycle responses.

### 4. Processing service

- [x] Implement a deterministic demo processor for simplified text, translations, actions, and visual instructions.
- [x] Put processing behind a service interface so a real AI provider can replace the demo implementation later.
- [x] Store generated representations separately from the official message.
- [x] Add tests proving the official message is byte-for-byte unchanged.

### 5. Realtime delivery

- [x] Emit `alert:sent` after a successful send.
- [x] Emit `alert:received` for the citizen delivery simulation.
- [x] Emit `alert:viewed` and `alert:acknowledged` after successful state changes.
- [x] Include alert id and relevant status/statistics data in event payloads.
- [x] Handle disconnected clients without corrupting persistence state.

## Backend Acceptance Criteria

- [x] API tests cover validation, all lifecycle endpoints, status transitions, and predictable errors.
- [x] Repeated acknowledgement requests do not create duplicate state or inflate statistics.
- [x] Statistics correctly report sent, delivered, viewed, and acknowledged totals.
- [x] Socket events are emitted only after the corresponding state is persisted.
- [x] Seeded data supports the complete authority-to-citizen demo.
- [x] Secrets and database credentials come only from environment variables.
- [x] No backend task requires a change to frontend implementation files.

## Handoff To Integration

Before opening the pull request:

1. Run backend tests, lint, and build checks (`npm test`).
2. Confirm every endpoint and event matches this document exactly.
3. Document the backend start command and required environment variables.
4. Rebase onto the latest `main`.
5. Provide a seeded alert id and example requests for frontend integration.

### Frontend Integration Information

- **Start Command**: `npm run dev:server` (or `npm --workspace server run start`)
- **Base URL**: `http://localhost:3000`
- **Health Check**: `GET http://localhost:3000/health`
- **Environment Variables**:
  - `PORT`: Server port (default `3000`)
  - `CLIENT_ORIGIN`: Allowed CORS origin (default `http://localhost:5173`)
  - `NODE_ENV`: Environment mode (`development` / `test` / `production`)

### Seeded Demo Alert

- **Seeded Alert ID**: `ALR-001` (Cyclone Demo Scenario)
- **API Endpoints**:
  - `GET /api/alerts`: List alerts
  - `GET /api/alerts/ALR-001`: Get single alert
  - `POST /api/alerts/ALR-001/process`: Generate accessibility versions
  - `POST /api/alerts/ALR-001/send`: Activate alert
  - `POST /api/alerts/ALR-001/view`: Record citizen view
  - `POST /api/alerts/ALR-001/acknowledge`: Record acknowledgement (idempotent)
  - `GET /api/alerts/ALR-001/statistics`: Get delivery statistics

Do not silently modify the alert contract. Raise contract changes in the pull request description first.
