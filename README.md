# AlertBridge

Accessible, multilingual emergency warnings for the last mile.

AlertBridge preserves an official emergency message while presenting clearer, translated, visual, audio, and acknowledgement-friendly representations for citizens. The project is currently a web prototype with a React client and an Express/Socket.IO server.

## Current Status

### Implemented

- React/Vite client with citizen and authority views
- Alert creation, validation, processing preview, and send simulation
- Official message preservation in the client and server model
- English, Hindi, and Odia demo representations
- Visual instructions, text-to-speech, accessibility modes, and low-connectivity mode
- Citizen acknowledgement and local demo history
- In-memory alert and recipient models
- Alert lifecycle API and deterministic processing service
- Socket.IO delivery, view, and acknowledgement events
- Frontend and backend test commands

### Not Yet Production-Ready

- Frontend API integration is implemented, with demo fallback for offline/low-connectivity use.
- Server data is stored in memory and resets on restart.
- Authentication, authorization, signed alerts, audit logs, and rate limiting are not implemented.
- PostgreSQL, external AI providers, SMS, push, cell broadcast, and IoT delivery are roadmap items.

## Repository Structure

```text
client/                       React + Vite frontend
server/                       Express + Socket.IO backend
docs/CONTRACT.md              Canonical client/server contract
docs/INTEGRATION.md           Integration and merge guide
FRONTEND_IMPLEMENTATION.md    Frontend status and task guide
BACKEND_IMPLEMENTATION.md     Backend status and task guide
```

## Technology

- Frontend: React, Vite, React Router, Socket.IO Client, browser Web APIs
- Backend: Node.js, Express, Socket.IO
- Persistence: in-memory models for the prototype
- Processing: deterministic demo processing service
- Testing: Vitest/Testing Library and Node's built-in test runner

## Setup

Requirements: Node.js 20 or newer.

```bash
git clone <repository-url>
cd AlertBridge
npm install
```

Create local environment files from the examples:

```text
client/.env.example -> client/.env
server/.env.example -> server/.env
```

## Run Locally

Use two terminals from the repository root:

```bash
npm run dev:server
npm run dev:client
```

Open `http://localhost:5173`.

Backend health: `http://localhost:3000/health`

## Checks

```bash
npm run build
npm run test
npm run test:client
```

## Main Routes

- `/` — project entry point
- `/citizen` — active citizen alert and accessibility controls
- `/authority` — authority dashboard, alert creation, preview, send, and statistics

## Demo Flow

1. Open `/authority` and create or process the seeded cyclone warning.
2. Review the generated representation beside the unchanged official message.
3. Send the alert and monitor the authority statistics.
4. Open `/citizen` in another browser window.
5. Change language, use speech/accessibility controls, view the official message, and acknowledge the warning.

## Next Step

Before presenting, run the two-browser authority/citizen verification. After the MVP demo, prioritize persistent storage, authentication, production security, and a formal expiration event.

See [docs/INTEGRATION.md](docs/INTEGRATION.md) for the sequence and [docs/CONTRACT.md](docs/CONTRACT.md) for the shared contract.

## Documentation

- [Shared contract](docs/CONTRACT.md)
- [Integration guide](docs/INTEGRATION.md)
- [Frontend implementation guide](FRONTEND_IMPLEMENTATION.md)
- [Backend implementation guide](BACKEND_IMPLEMENTATION.md)

## Product Principle

An acknowledgement confirms that communication was received and understood by the recipient. It does not prove that the recipient is physically safe.
