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

## Current Boundary

The UI is mock-first. `client/src/services/api.js` contains the HTTP boundary, and `client/src/services/socket.js` contains the realtime boundary, but the main pages still use local demo state for some workflows.

Current gaps:

- Add `viewAlert` and `acknowledgeAlert` methods to the API service.
- Load citizen alerts through `GET /api/alerts` and `GET /api/alerts/:id`.
- Replace citizen acknowledgement timer/local history with `/view` and `/acknowledge` requests.
- Replace authority local create/process/send state with API calls.
- Load statistics from the backend response shape, including `totalRecipients`.
- Add API, authority, and Socket.IO integration tests.
- Add a lint command or remove lint from the required checks until configured.

## Ownership Rules

- Keep frontend implementation inside `client/`.
- Do not change the shared contract silently; update [docs/CONTRACT.md](docs/CONTRACT.md) first.
- Keep official message display separate from generated content.
- Keep mock adapters available while live integration is being developed.
- Do not commit `.env` files or secrets.

## Frontend Handoff

Before merging the integration work:

- [ ] API response adapters are tested.
- [ ] Citizen view and acknowledgement use server persistence.
- [ ] Authority create/process/send/statistics use the backend.
- [ ] Realtime events refresh persisted state correctly.
- [ ] Frontend tests and build pass.
- [ ] Two-browser authority/citizen flow passes.
