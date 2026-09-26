# AlertBridge Frontend Guide

Owner: Person A
Primary branch: `feature/frontend-citizen-authority`

This document describes the current frontend implementation and the remaining client/server integration work. The shared client/server contract lives in [docs/CONTRACT.md](docs/CONTRACT.md).

## Current Implementation

### Foundation

- React/Vite application in `client/`
- React Router routes for `/`, `/citizen`, and `/authority`
- Shared layout, loading state, error boundary, API service, and Socket.IO hook
- Demo alert data matching the shared contract

### Citizen Workflow

- Active alert view with severity, location, actions, visual instructions, and expiry
- Official message displayed separately from generated content
- English, Hindi, and Odia representations
- Browser text-to-speech
- Large text, high contrast, reduced motion, and low-connectivity modes
- Local acknowledgement state and demo history
- Realtime replacement of the active alert on `alert:sent` and `alert:received`

### Authority Workflow

- Dashboard statistics and acknowledgement rate
- Alert creation form with validation
- Deterministic mock processing and preview
- Official/generated content separation
- Send confirmation, success, retry, and error states
- Local demo history
- Realtime statistics updates on `alert:viewed` and `alert:acknowledged`

### Hardening

- Vitest/jsdom and Testing Library setup
- Citizen rendering, language, speech, acknowledgement, and accessibility tests
- Production build check

## Run and Test

From the repository root:

```bash
npm run dev:client
npm run build
npm run test:client
```

## Remaining Frontend Implementation

The UI is currently mock-first. Complete these tasks on the frontend branch in this order.

### F1: API Service Boundary

- [ ] Add `viewAlert(alertId, userId)` to `client/src/services/api.js`.
- [ ] Add `acknowledgeAlert(alertId, userId)` to `client/src/services/api.js`.
- [ ] Add a shared response adapter for `{ data: alerts }`.
- [ ] Add a statistics adapter from `totalRecipients` to the authority view's display model.
- [ ] Normalize API errors into the existing error-state format.
- [ ] Add unit tests for methods, request paths, payloads, successful responses, and API errors.

### F2: Citizen Live Integration

- [ ] Load the active alert from `GET /api/alerts` or `GET /api/alerts/:id`.
- [ ] Keep the demo adapter available when the API is unavailable or low-connectivity mode is selected.
- [ ] Send `POST /api/alerts/:id/view` when the active alert is opened, once per alert view.
- [ ] Send `POST /api/alerts/:id/acknowledge` when the citizen confirms the alert.
- [ ] Keep local history as a display cache, but treat the server response as authoritative.
- [ ] Update the active alert from realtime payloads without losing the official message.

### F3: Authority Live Integration

- [ ] Create alerts through `POST /api/alerts`.
- [ ] Process alerts through `POST /api/alerts/:id/process`.
- [ ] Replace local send simulation with `POST /api/alerts/:id/send`.
- [ ] Load history from `GET /api/alerts`.
- [ ] Load statistics from `GET /api/alerts/:id/statistics` after send and on refresh.
- [ ] Merge `alert:viewed` and `alert:acknowledged` events into the server statistics model.
- [ ] Show server errors and retry states for every live request.

### F4: Verification and Developer Experience

- [ ] Add API integration tests for citizen and authority workflows.
- [ ] Add Socket.IO handler tests for sent, received, viewed, and acknowledged payloads.
- [ ] Add authority page tests for validation, preview, send confirmation, and statistics.
- [ ] Add a lint script, or remove lint from required checks until a linter is configured.
- [ ] Verify the two-browser flow against a running backend.

### Frontend Completion Definition

Frontend integration is complete when F1-F4 are checked, `npm run build` and `npm run test:client` pass, and the citizen and authority pages no longer require local timers to represent server lifecycle state.

## Independence and Special Care

### Safe to implement independently

- F1 API service methods and adapters can be built against [docs/CONTRACT.md](docs/CONTRACT.md) with mocked `fetch` responses.
- F4 frontend unit tests, authority tests, accessibility tests, and lint setup can be completed without backend code.
- UI loading, error, retry, and offline fallback states can be developed with the existing mock adapter.

### Requires backend coordination before merge

- F2 live citizen integration depends on the backend response from `/view` and `/acknowledge`.
- F3 live authority integration depends on the backend statistics shape and alert lifecycle responses.
- Realtime handlers must filter events by `alertId`; otherwise a different authority alert can overwrite the current citizen alert or statistics.
- The client must not assume that `recipients` exists; the backend contract currently names the field `totalRecipients`.
- The client must treat the server recipient record as authoritative and keep local storage only as a cache.

### Branch rule

Person A can finish F1 and F4 on the frontend branch while Person B works on B1-B4. Merge F2/F3 only after the contract tests and a seeded backend are available. If the contract changes, update [docs/CONTRACT.md](docs/CONTRACT.md) first and coordinate both pull requests.

## Ownership Rules

- Keep frontend implementation inside `client/`.
- Do not change the shared contract silently; update [docs/CONTRACT.md](docs/CONTRACT.md) first.
- Keep official message display separate from generated content.
- Keep mock adapters available while live integration is being developed.
- Do not commit `.env` files or secrets.

## Frontend Handoff

Before merging the integration work:

- [ ] F1 API service boundary is complete.
- [ ] F2 citizen live integration is complete.
- [ ] F3 authority live integration is complete.
- [ ] F4 verification and developer experience are complete.
- [ ] Frontend tests and build pass.
- [ ] Two-browser authority/citizen flow passes.
