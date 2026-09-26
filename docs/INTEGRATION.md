# AlertBridge Integration Guide

This guide covers the next phase after the independent frontend and backend branches: replacing frontend mock state with the live backend contract.

## Current Integration Status

The client and server API-first lifecycle is now implemented:

- Citizen alert loading, view tracking, and acknowledgement use the HTTP API.
- Authority create, process, send, history, and statistics use the HTTP API.
- Frontend realtime handlers merge server events and filter authority events by `alertId`.
- Backend validation rejects invalid languages, invalid expiry values, and expired sends.
- Frontend tests, backend tests, and the frontend production build pass.

Still pending:

- Two-browser manual verification against a running server.
- A future `alert:expired` event contract and scheduler, if required.
- Production persistence, authentication, and security hardening.

## Local Environment

### Backend

Create `server/.env` from `server/.env.example`:

```text
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
```

### Frontend

Create `client/.env` from `client/.env.example`:

```text
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

Do not commit either `.env` file.

## Run Both Applications

From the repository root, use two terminals:

```bash
npm run dev:server
npm run dev:client
```

Open `http://localhost:5173`. Check backend health at `http://localhost:3000/health`.

## Integration Order

1. Run the two-browser verification against a clean backend start.
2. Keep Socket.IO event handlers focused on refreshing or merging persisted server state.
3. Preserve the existing mock adapter as a fallback for offline UI development.
4. Plan production persistence, authentication, and security hardening separately from MVP integration.

## Workstream Independence

The branches can proceed in parallel until the live integration boundary:

| Work                                   | Independent? | Coordination needed                                 |
| -------------------------------------- | ------------ | --------------------------------------------------- |
| Frontend F1 API service boundary       | Yes          | Use `docs/CONTRACT.md`; mock HTTP responses         |
| Frontend F4 tests and lint             | Yes          | None beyond shared scripts                          |
| Backend B1 contract/API tests          | Yes          | Keep response shapes canonical                      |
| Backend B2 lifecycle/model work        | Yes          | Preserve status and immutability rules              |
| Backend B4 backend tests               | Yes          | Run against seeded in-memory backend                |
| Frontend F2 citizen live integration   | No           | Backend `/view`, `/acknowledge`, and alert payloads |
| Frontend F3 authority live integration | No           | Backend statistics and lifecycle responses          |
| Backend B3 client integration support  | No           | Frontend adapters and realtime event consumers      |

Special care is required for `alertId` filtering, `totalRecipients` statistics naming, idempotent acknowledgement retries, and event ordering after persistence.

## Two-Browser Verification

1. Start the backend and frontend.
2. Open one browser window at `/authority` and another at `/citizen`.
3. Create and process an alert in the authority window.
4. Send the alert and confirm the citizen window receives `alert:received`.
5. Open the official message in the citizen window and verify it is unchanged.
6. View and acknowledge the alert as the citizen.
7. Confirm the authority statistics update through HTTP and Socket.IO.
8. Refresh both windows and verify persisted server state is still represented.

## Branch and Merge Procedure

- Frontend work continues on `feature/frontend-citizen-authority` or its current successor branch.
- Backend work continues on `feature/backend-alert-platform`.
- Contract changes must be made first in [CONTRACT.md](CONTRACT.md) and called out in the pull request.
- Merge only after both branches pass their own checks.
- Resolve root `package.json`, lockfile, and environment documentation changes together.

## Required Checks

```bash
npm run build
npm run test
npm run test:client
```

## Known Integration Risks

- The frontend currently uses local mock state for authority workflows and local storage for citizen history.
- The backend statistics response uses `totalRecipients`; the authority UI currently uses a local `recipients` field.
- Backend persistence is in-memory, so restart behavior is not production persistence.
- Socket events require the backend server to be running; disconnected UI states should remain usable.
