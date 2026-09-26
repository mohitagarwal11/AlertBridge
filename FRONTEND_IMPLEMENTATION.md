# AlertBridge Frontend Implementation

Owner: Person A
Branch: `feature/frontend-citizen-authority`

This file is the implementation guide for the frontend branch. Backend work happens in `BACKEND_IMPLEMENTATION.md` on a separate branch.

## Common Rules

These rules apply to both branches and must not be changed independently:

- Keep `officialMessage` unchanged and visibly separate from generated content.
- Use the shared alert object and API contract below.
- Acknowledgement means communication confirmation, not proof that a person is safe.
- Use the status order `PENDING -> DELIVERED -> VIEWED -> ACKNOWLEDGED`.
- Do not commit secrets. Use `.env.example` for required configuration.
- Keep frontend implementation files inside `client/` or `src/`; avoid editing backend-owned files.

## Shared Alert Contract

Use this mock shape before the backend is ready:

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

Backend integration uses these endpoints:

```text
GET  /api/alerts
GET  /api/alerts/:id
POST /api/alerts
POST /api/alerts/:id/process
POST /api/alerts/:id/send
POST /api/alerts/:id/view
POST /api/alerts/:id/acknowledge
GET  /api/alerts/:id/statistics
```

Backend errors have this shape:

```javascript
{ "error": { "code": "ALERT_NOT_FOUND", "message": "Alert was not found" } }
```

Realtime events to consume:

```text
alert:sent
alert:received
alert:viewed
alert:acknowledged
```

## Implementation Tasks

### 1. Application foundation

- [x] Set up the React/Vite application.
- [x] Add routing for authority and citizen areas.
- [x] Add shared layout, navigation, loading states, and error states.
- [x] Add an API client with a configurable backend URL.
- [x] Add mock data using the shared alert shape.

### 2. Citizen workflow

- [x] Build the active alert screen.
- [x] Show severity, title, summary, affected area, actions, visual instructions, and expiry.
- [x] Show the official message in a separate, clearly labelled section.
- [x] Add language selection using `translations`.
- [x] Add browser text-to-speech playback and stop controls.
- [x] Add large-text, high-contrast, reduced-motion, and low-connectivity settings.
- [x] Add acknowledgement states: available, submitting, acknowledged, and failed.
- [x] Add citizen alert history.

### 3. Authority workflow

- [x] Build the authority dashboard and alert history.
- [x] Build the create-alert form with validation for message, type, severity, location, and languages.
- [x] Build processing and preview screens.
- [x] Keep official content separate from simplified, translated, and visual content.
- [x] Add send-alert action with confirmation and error handling.
- [x] Add delivery, viewed, and acknowledgement statistics.

### 4. Realtime behavior

- [x] Add a Socket.IO client service.
- [x] Update citizen views when `alert:received` or `alert:sent` arrives.
- [x] Update authority statistics when `alert:viewed` or `alert:acknowledged` arrives.
- [x] Reconnect cleanly and show a non-blocking connection state.

### 5. Frontend hardening

- [x] Add a jsdom/Vitest test setup for React workflows.
- [x] Test alert rendering and official message preservation.
- [x] Test language switching and document language updates.
- [x] Test browser text-to-speech start and stop controls.
- [x] Test acknowledgement persistence and duplicate prevention.
- [x] Test accessibility setting state changes.
- [x] Verify the production build after hardening changes.

## Frontend Acceptance Criteria

- [x] All primary screens work with mock data before backend integration.
- [ ] Replacing the mock adapter with the API client does not change component contracts.
- [x] Official text cannot be overwritten by generated content in the UI.
- [x] The acknowledgement action is idempotent from the user's perspective.
- [x] The interface works on mobile width and with accessibility settings enabled.
- [x] Tests cover alert rendering, language switching, text-to-speech controls, and acknowledgement behavior.
- [x] No frontend task requires a change to backend implementation files.

## Handoff To Integration

Before opening the pull request:

1. Run frontend tests, lint, and build checks.
2. Confirm the mock alert matches the shared contract exactly.
3. Document the frontend start command and required environment variables.
4. Rebase onto the latest `main`.
5. Test the API client against the backend branch or a local backend build.

Do not silently modify the alert contract. Raise contract changes in the pull request description first.
