# AlertBridge

### Making emergency warnings understandable, accessible, and acknowledgeable at the last mile.

AlertBridge is a multilingual emergency alert accessibility and delivery platform designed to bridge the gap between **official emergency warnings** and the people who need to understand and act on them.

Emergency authorities often issue warnings through official channels, but those messages may be difficult to understand because they are lengthy, technical, language-specific, or inaccessible to people with different literacy and accessibility needs.

AlertBridge keeps the **original official message unchanged**, while generating simplified, multilingual, visual, and accessible representations that make the warning easier to understand.

The platform also introduces a **closed-loop acknowledgement system**, allowing authorities to see whether recipients have received, viewed, and acknowledged an emergency warning.

---

## The Problem

During emergencies such as cyclones, floods, earthquakes, fires, or extreme weather events, delivering an alert is only the first step.

A warning can fail to protect people if:

- The recipient does not understand the language.
- The message is too long or technical.
- The recipient has limited literacy.
- The warning relies heavily on text.
- The recipient has accessibility requirements.
- Internet connectivity is poor.
- Authorities have no way of knowing whether the message was understood.
- People receive multiple warnings but cannot determine what action is required.

The core problem is therefore:

> **How do we make official emergency warnings clear, accessible, multilingual, and actionable while preserving the integrity of the original message?**

---

# Our Solution

AlertBridge acts as an accessibility and communication layer between emergency authorities and citizens.

```text
Official Emergency Alert
          │
          ▼
   ┌───────────────┐
   │  AlertBridge  │
   └───────┬───────┘
           │
     ┌─────┼─────────────┐
     ▼     ▼             ▼
 Simplify Translate   Visualise
     │     │             │
     └─────┼─────────────┘
           ▼
     Accessible Alert
           │
           ▼
       Citizen
           │
           ▼
      Acknowledge
           │
           ▼
      Authority
      Dashboard
```

The official message is always preserved.

AlertBridge creates additional representations around it:

1. **Simplified explanation**
2. **Local-language translation**
3. **Visual instructions**
4. **Voice playback**
5. **Accessibility-friendly presentation**
6. **Acknowledgement mechanism**
7. **Delivery and acknowledgement monitoring**

---

# Core Features

## 1. Official Message Preservation

The original message supplied by the authority is stored separately and remains unchanged.

Example:

### Official Message

> Due to the severe cyclonic storm expected to make landfall, residents in low-lying coastal areas are advised to evacuate to designated shelters.

AlertBridge does not replace this message.

Instead, it creates an accessible representation.

### Simplified Version

> **CYCLONE APPROACHING**
>
> If you live in a low-lying coastal area, leave now and move to a safe shelter.

This separation ensures that the simplified version does not become the authoritative source.

---

# 2. Multilingual Alerts

Emergency alerts can be generated in multiple languages.

Example:

```text
English
Hindi
Odia
Bengali
Tamil
Telugu
```

The architecture allows additional languages to be added later.

Users can select their preferred language from the citizen interface.

The original official message remains available regardless of the selected language.

---

# 3. Visual Emergency Instructions

Important information is converted into simple visual actions.

Example:

```text
🌪️ CYCLONE

🏃 EVACUATE
Move to a safe location.

🏠 FIND SHELTER
Go to a designated safe building.

🚫 AVOID THE SEA
Stay away from coastal areas.

📱 KEEP YOUR PHONE CHARGED
```

Visual instructions can make emergency information easier to understand for users with limited literacy or language barriers.

---

# 4. Text-to-Speech

Citizens can listen to an emergency alert instead of reading it.

The web application uses browser-based speech synthesis for the prototype.

```text
🔊 Listen to Alert
```

This provides an additional accessibility layer for users who have difficulty reading the displayed text.

---

# 5. Accessibility Mode

AlertBridge provides an accessibility-focused interface with options such as:

- Large text
- High contrast
- Reduced motion
- Simplified interface
- Voice playback
- Screen-reader-friendly structure

The goal is to make emergency information usable under stressful conditions rather than relying on a conventional notification interface.

---

# 6. Acknowledgement System

AlertBridge introduces a closed-loop communication mechanism.

Instead of:

```text
Alert Sent
```

the system tracks:

```text
Alert Sent
    ↓
Delivered
    ↓
Viewed
    ↓
Acknowledged
```

Citizens explicitly confirm that they have understood the alert.

Example:

```text
┌──────────────────────────────┐
│       CYCLONE WARNING        │
│                              │
│ Move to a safe location.     │
│                              │
│     [ I UNDERSTAND ]         │
└──────────────────────────────┘
```

After acknowledgement:

```text
✓ Alert Acknowledged

Acknowledged at 18:42
```

---

# 7. Authority Monitoring

Authorities can monitor the status of an alert in real time.

Example:

```text
CYCLONE WARNING

Recipients       10,000
Delivered         9,640
Viewed            8,920
Acknowledged      7,840

Acknowledgement Rate
████████████████░░░░ 78.4%
```

This allows authorities to identify areas where acknowledgement rates are lower and potentially use additional communication channels.

Important distinction:

> An acknowledgement means that the recipient confirmed the alert. It does not mean that the person is safe.

---

# 8. Real-Time Alert Delivery

For the web prototype, AlertBridge uses real-time communication to simulate emergency alert delivery.

When an authority sends an alert:

```text
Authority Browser
       │
       │ Socket connection
       ▼
    Backend
       │
       ▼
Citizen Browser
```

The citizen interface updates without requiring a page refresh.

This can later be extended to other delivery mechanisms.

---

# 9. Low-Bandwidth Design

Emergency communication should not depend on a heavy web experience.

AlertBridge is designed so that the essential emergency information can be represented using:

- Plain text
- Minimal HTML
- Small payloads
- Cached content
- Progressive loading
- Minimal images
- Local browser storage

The current MVP can also provide a **Low Connectivity Mode** that removes non-essential UI and prioritizes the core emergency message.

---

# Future Delivery Channels

The current MVP focuses on the web application.

The architecture is intentionally designed to support additional delivery channels.

```text
                  AlertBridge
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
        Web          SMS          Push
          │
          ├──────── MQTT
          │
          ├──────── Community Hub
          │
          └──────── IoT / ESP32
```

Potential future integrations include:

- SMS
- Push notifications
- Cell broadcast
- MQTT
- Community information hubs
- IoT emergency receivers
- Local mesh networks
- Public display systems

These are outside the scope of the current MVP.

---

# Application Architecture

AlertBridge has two primary user roles.

## Authority

Authorities can:

- Create alerts
- Enter official messages
- Select emergency type
- Set severity
- Specify affected areas
- Select languages
- Generate accessible representations
- Preview alerts
- Send alerts
- Monitor delivery
- Monitor acknowledgement
- View alert history

## Citizen

Citizens can:

- Receive alerts
- Read simplified alerts
- View the official message
- Change language
- View visual instructions
- Listen to alerts
- Enable accessibility features
- Acknowledge alerts
- View previous alerts

---

# Page Structure

```text
/
│
├── Landing Page
│
├── authority/
│   ├── login
│   ├── dashboard
│   ├── alerts/create
│   ├── alerts/:id/process
│   ├── alerts/:id/preview
│   ├── alerts/:id
│   └── history
│
└── citizen/
    ├── home
    ├── alerts/:id
    ├── history
    └── settings
```

---

# Main User Flow

## Authority Flow

```text
Login
  ↓
Dashboard
  ↓
Create Alert
  ↓
Enter Official Message
  ↓
Select Languages
  ↓
Generate Accessible Alert
  ↓
Review
  ↓
Preview Citizen Experience
  ↓
Send Alert
  ↓
Monitor Delivery
  ↓
Monitor Acknowledgement
```

## Citizen Flow

```text
Open AlertBridge
       ↓
Receive Emergency Alert
       ↓
View Simplified Message
       ↓
Select Language
       ↓
View Visual Instructions
       ↓
Listen to Alert
       ↓
View Original Official Message
       ↓
Acknowledge
       ↓
Confirmation
```

---

# Technology Stack

## Frontend

- React
- Vite
- React Router
- Tailwind CSS
- Web APIs

## Backend

- Node.js
- Express.js
- Socket.IO

## Database

PostgreSQL

The database stores:

- Users
- Alerts
- Alert translations
- Alert processing results
- Recipients
- Delivery status
- View status
- Acknowledgements

## AI Layer

The AI layer is responsible for generating structured accessibility representations.

Potential tasks:

```text
Official Message
      │
      ├── Simplification
      │
      ├── Translation
      │
      ├── Action Extraction
      │
      └── Visual Instruction Generation
```

The AI layer should never overwrite the original official message.

---

# React Architecture

```text
src/
│
├── components/
│   ├── ui/
│   ├── alert/
│   ├── authority/
│   └── accessibility/
│
├── pages/
│   ├── authority/
│   └── citizen/
│
├── context/
│   ├── AuthContext.jsx
│   ├── AlertContext.jsx
│   ├── LanguageContext.jsx
│   └── AccessibilityContext.jsx
│
├── services/
│   ├── api.js
│   ├── alertService.js
│   ├── translationService.js
│   └── socket.js
│
├── hooks/
│   ├── useAlerts.js
│   ├── useSocket.js
│   └── useAccessibility.js
│
├── data/
│   └── demoAlerts.js
│
├── App.jsx
└── main.jsx
```

---

# Alert Data Model

A simplified alert object:

```javascript
{
  id: "ALR-001",

  type: "cyclone",

  severity: "critical",

  affectedArea: "Coastal Odisha",

  officialMessage: "...",

  simplified: {
    title: "CYCLONE APPROACHING",
    summary: "Move to a safe location immediately.",
    actions: [
      "Leave low-lying coastal areas",
      "Move to a safe shelter",
      "Stay away from the sea"
    ]
  },

  translations: {
    en: {},
    hi: {},
    or: {}
  },

  visualInstructions: [
    {
      icon: "evacuate",
      text: "Move to a safe location"
    },
    {
      icon: "shelter",
      text: "Go to a designated shelter"
    }
  ],

  status: "active",

  createdAt: "...",
  expiresAt: "..."
}
```

---

# Acknowledgement Model

Each recipient has an alert status.

```javascript
{
  alertId: "ALR-001",
  userId: "USR-104",

  deliveredAt: "...",
  viewedAt: "...",
  acknowledgedAt: "...",

  status: "acknowledged"
}
```

Possible states:

```text
PENDING
   ↓
DELIVERED
   ↓
VIEWED
   ↓
ACKNOWLEDGED
```

---

# API Structure

Example API endpoints:

```text
POST   /api/auth/login

POST   /api/alerts
GET    /api/alerts
GET    /api/alerts/:id
PUT    /api/alerts/:id
POST   /api/alerts/:id/send

POST   /api/alerts/:id/process
POST   /api/alerts/:id/acknowledge

GET    /api/alerts/:id/statistics
GET    /api/alerts/:id/recipients
```

---

# Real-Time Events

Socket.IO events can include:

```text
alert:created
alert:sent
alert:received
alert:viewed
alert:acknowledged
alert:expired
```

Example:

```javascript
socket.on("alert:new", (alert) => {
  // Display emergency alert
});
```

When a citizen acknowledges:

```javascript
socket.emit("alert:acknowledge", {
  alertId,
});
```

The authority dashboard can receive:

```javascript
socket.on("alert:acknowledged", (data) => {
  // Update acknowledgement statistics
});
```

---

# Design Principles

## 1. Understandability over information density

During an emergency, users should immediately understand:

**What happened?**

**Am I affected?**

**What should I do?**

---

## 2. Official information remains authoritative

The original message is never silently modified.

All AI-generated content is presented as an accessible representation of the official warning.

---

## 3. Accessibility is a core feature

Accessibility should not be an afterthought or a separate version of the application.

The same alert should be usable through:

- Text
- Language
- Visual instructions
- Audio
- High contrast
- Large text

---

## 4. Low bandwidth first

The emergency information itself should remain usable even when additional UI elements cannot load.

---

## 5. Acknowledgement is not proof of safety

The platform records communication status, not physical safety.

---

# Security Considerations

A production version would require additional security controls.

These include:

- Authority authentication
- Role-based access control
- Signed alerts
- Audit logs
- Message integrity verification
- Rate limiting
- Secure API authentication
- Encryption
- Protection against fake emergency alerts
- Expiration and revocation of alerts

Emergency alerts should never be generated or modified by unauthorized users.

---

# Privacy Considerations

The acknowledgement system should collect only the information necessary for emergency communication.

Possible production principles:

- Minimize personally identifiable information.
- Store acknowledgement timestamps rather than unnecessary user activity.
- Apply appropriate retention policies.
- Restrict authority access to recipient information.
- Aggregate statistics where individual identification is unnecessary.

---

# Current MVP Scope

The current version focuses on the **web application**.

### Included

- Authority dashboard
- Alert creation
- Official message preservation
- AI-assisted simplification
- Multilingual representation
- Visual instructions
- Text-to-speech
- Accessibility mode
- Citizen alert interface
- Real-time alert delivery
- Alert acknowledgement
- Authority acknowledgement dashboard
- Alert history

### Not currently included

- Physical IoT devices
- ESP32 receivers
- SMS gateway
- Cell broadcast
- Satellite communication
- Mesh networking
- Government emergency-system integration
- Production-grade authentication

These can be integrated as future delivery channels.

---

# Future Roadmap

## Phase 1 — Web MVP

```text
React
+
Node.js
+
Socket.IO
+
AI
+
PostgreSQL
```

## Phase 2 — Additional Delivery Channels

```text
SMS
Push Notifications
Email
```

## Phase 3 — Offline / Low Connectivity

```text
PWA
Service Workers
IndexedDB
Local caching
```

## Phase 4 — Physical Last-Mile Infrastructure

```text
ESP32
MQTT
Community receivers
LED displays
Buzzers
Local mesh
```

## Phase 5 — Emergency Infrastructure Integration

Potential integration with official emergency alert providers and government communication systems.

---

# Demo Scenario

For demonstrating AlertBridge, use a realistic cyclone scenario.

### Authority

Creates:

```text
Type: Cyclone
Severity: Critical
Location: Coastal Odisha
Language: English + Odia
```

Official message:

> Due to the severe cyclonic storm expected to make landfall, residents in low-lying coastal areas are advised to evacuate to designated shelters.

### AlertBridge generates

**Simplified:**

> **CYCLONE APPROACHING**
>
> If you live in a low-lying coastal area, evacuate now and move to a safe shelter.

**Actions:**

```text
🏃 Evacuate
🏠 Go to a safe shelter
🚫 Stay away from the sea
📱 Keep your phone charged
```

**Odia translation:**

> Corresponding localized emergency instructions.

### Citizen

Receives the alert → switches to Odia → listens to it → reads the instructions → clicks:

**I UNDERSTAND**

### Authority

Immediately sees:

```text
Delivered:       96%
Viewed:          89%
Acknowledged:    81%
```

This demonstrates the complete communication loop.

---

# Project Vision

Emergency communication should not stop at **"alert sent."**

AlertBridge aims to create a system where an official warning can be:

> **Received → Understood → Accessed → Acknowledged**

regardless of language, literacy level, or accessibility requirement.

The long-term goal is to provide an interoperable accessibility layer that can sit on top of existing emergency warning systems and extend their reach to the last mile.

---

## Status

**Prototype / Ideathon MVP**

Built with React and a modular backend architecture designed for future integration with low-bandwidth and offline delivery systems.

---

# Parallel Implementation Plan

This plan is designed for two people to work simultaneously in separate branches. The work is divided by ownership boundary so that both branches can be developed and tested independently before integration.

## Implementation Handoff Files

Use these files as the direct task lists for each branch:

- [Frontend implementation guide](FRONTEND_IMPLEMENTATION.md) — Person A, branch `feature/frontend-citizen-authority`
- [Backend implementation guide](BACKEND_IMPLEMENTATION.md) — Person B, branch `feature/backend-alert-platform`

The **Common Rules** and **Shared Contract** sections in both files are mandatory for both people. They intentionally repeat the same alert shape, endpoints, events, status transitions, and error format so either person can work independently without depending on an unmerged branch. Any change to common behavior must be discussed and updated in both files before implementation continues.

## Working Agreement

- `main` contains only integrated, working code.
- Both branches start from the same baseline commit.
- Each person owns their branch's directories and does not edit the other person's implementation files.
- Shared behavior is agreed through the contracts below before implementation.
- Use small, focused commits. Do not mix formatting, dependency upgrades, or unrelated refactors into feature commits.
- Open a pull request only after the branch's local checks pass.

## Branch Ownership

| Branch                               | Owner    | Primary responsibility                                                     | Main directories                                 |
| ------------------------------------ | -------- | -------------------------------------------------------------------------- | ------------------------------------------------ |
| `feature/frontend-citizen-authority` | Person A | React user experience for authority and citizen workflows                  | `client/`, `src/`, frontend tests                |
| `feature/backend-alert-platform`     | Person B | API, persistence, alert processing, acknowledgement, and realtime delivery | `server/`, `api/`, database files, backend tests |

If the repository has not been scaffolded yet, Person A owns the frontend scaffold and Person B owns the backend scaffold. Keep them as separate `client` and `server` applications so the branches remain mergeable.

## Shared Contract

Both branches should use this alert shape. Person B implements it; Person A uses mock data with the same shape until the API is available.

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

The following endpoints and events are the integration boundary:

```text
POST /api/alerts                 Create a draft alert
GET  /api/alerts                 List alerts
GET  /api/alerts/:id             Get one alert
POST /api/alerts/:id/process     Generate accessible representations
POST /api/alerts/:id/send        Send an alert
POST /api/alerts/:id/view        Record that a citizen viewed it
POST /api/alerts/:id/acknowledge Record acknowledgement
GET  /api/alerts/:id/statistics  Get delivery and acknowledgement totals

alert:sent
alert:received
alert:viewed
alert:acknowledged
```

API errors should use one predictable format:

```javascript
{ "error": { "code": "ALERT_NOT_FOUND", "message": "Alert was not found" } }
```

## Person A: Frontend Workstream

### A1. Application shell and navigation

- Set up React, routing, shared layout, loading states, and error states.
- Add role-based entry points for authority and citizen views.
- Add a small API client that can later switch from mock data to the backend URL.

### A2. Citizen experience

- Build active alert view with title, severity, summary, actions, visual instructions, and official message.
- Add language selector using the `translations` contract.
- Add browser text-to-speech controls.
- Add large-text, high-contrast, reduced-motion, and low-connectivity settings.
- Add acknowledgement flow and confirmation state.
- Add citizen alert history.

### A3. Authority experience

- Build dashboard summary cards and alert history.
- Build create-alert form with validation for official message, type, severity, affected area, and languages.
- Build process/preview screen showing official content separately from generated content.
- Build send action and acknowledgement statistics view.

### A4. Frontend completion criteria

- Every primary screen works with the shared mock alert.
- Official text is visibly separate and never overwritten by simplified content.
- The acknowledgement button has disabled, loading, success, and error states.
- Layout remains usable on mobile width and with accessibility settings enabled.
- Component tests cover alert rendering, language switching, and acknowledgement behavior.

## Person B: Backend Workstream

### B1. Service and data foundation

- Set up Node.js, Express, Socket.IO, environment configuration, and error middleware.
- Define alert, translation, recipient status, and acknowledgement persistence models.
- Add seed data for the cyclone demo scenario.
- Add validation for incoming alert payloads.

### B2. Alert lifecycle API

- Implement create, list, detail, process, send, view, acknowledge, and statistics endpoints.
- Preserve `officialMessage` exactly as submitted.
- Enforce valid status transitions: `PENDING -> DELIVERED -> VIEWED -> ACKNOWLEDGED`.
- Make acknowledgement idempotent so repeated requests do not create duplicate state.
- Return the shared alert shape and predictable errors.

### B3. Processing and realtime delivery

- Implement a deterministic demo processor for simplified text, translations, and visual instructions.
- Keep the processor behind a service interface so a real AI provider can be added later.
- Emit the agreed Socket.IO events when alerts change state.
- Add CORS configuration and a health endpoint for local integration.

### B4. Backend completion criteria

- API tests cover validation, preservation of the official message, status transitions, idempotent acknowledgement, and statistics.
- Socket events are emitted with the alert id and relevant status data.
- Seeded demo data supports the complete authority-to-citizen flow.
- Secrets and database credentials are read from environment variables, never committed.

## Integration Sequence

1. Merge the backend branch first if the client API client already targets the agreed contract; otherwise merge the frontend branch first with its mock adapter intact.
2. Resolve only integration files such as root scripts, environment examples, and dependency lockfiles together.
3. Start the backend and verify the frontend can load the seeded alert.
4. Replace frontend mock calls one workflow at a time: list/detail, create/process, send, view, acknowledge, then statistics.
5. Verify realtime delivery in two browser sessions: one authority session and one citizen session.
6. Run the full test suite and perform a manual accessibility pass before merging to `main`.

## Suggested Milestones

| Milestone          | Person A                             | Person B                             | Exit check                               |
| ------------------ | ------------------------------------ | ------------------------------------ | ---------------------------------------- |
| M1: Foundations    | Shell, routes, mock alert            | Server, models, health endpoint      | Both apps run independently              |
| M2: Core flow      | Citizen alert and acknowledgement UI | Alert lifecycle API                  | Mock and API flows use the same contract |
| M3: Authority flow | Create, preview, dashboard UI        | Process, send, statistics API        | Authority can send a seeded alert        |
| M4: Integration    | API client and Socket.IO client      | Realtime events and final validation | Two-browser end-to-end demo passes       |
| M5: Hardening      | Accessibility and responsive tests   | API/security/error tests             | Release checklist is green               |

## Merge Checklist

- [ ] Branch is rebased or updated from the latest `main`.
- [ ] No edits were made to the other workstream's owned implementation files.
- [ ] Shared contract has not changed silently.
- [ ] Tests and lint/type checks pass.
- [ ] `.env.example` documents required non-secret configuration.
- [ ] Official message preservation is verified.
- [ ] Acknowledgement is clearly described as communication confirmation, not proof of safety.
- [ ] The complete demo scenario works from alert creation to authority statistics.

---

# Project Setup

The repository is initialized as an npm workspace with separate frontend and backend applications:

```text
client/   React + Vite citizen/authority interface
server/   Express + Socket.IO API foundation
```

## First-Time Setup

```bash
git clone <repository-url>
cd AlertBridge
npm install
```

On Windows PowerShell, use `npm.cmd install` if the PowerShell execution policy blocks `npm`.

Create local environment files from the committed examples when needed:

```text
client/.env.example -> client/.env
server/.env.example -> server/.env
```

## Run Locally

Open two terminals from the repository root:

```bash
npm run dev:server
npm run dev:client
```

The client runs at `http://localhost:5173` and the server health check is available at `http://localhost:3000/health`.

Useful checks:

```bash
npm run build
npm test
```

## Start Separate Work

After cloning and installing, each person creates their own branch from `main`:

```bash
git checkout -b feature/frontend-citizen-authority
```

or:

```bash
git checkout -b feature/backend-alert-platform
```

Person A follows [FRONTEND_IMPLEMENTATION.md](FRONTEND_IMPLEMENTATION.md). Person B follows [BACKEND_IMPLEMENTATION.md](BACKEND_IMPLEMENTATION.md). Commit only the files owned by that workstream, then push the branch for review.

---
