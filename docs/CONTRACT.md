# AlertBridge Shared Contract

This is the single source of truth for the client/server boundary. Update this file first when shared behavior changes, then update the implementation that owns the change.

## Alert Object

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
  expiresAt: "2026-12-31T12:00:00.000Z"
}
```

`officialMessage` is authoritative and immutable. Generated content must be stored separately.

## Recipient Status

```javascript
{
  alertId: "ALR-001",
  userId: "USR-001",
  status: "ACKNOWLEDGED",
  deliveredAt: "2026-01-01T12:01:00.000Z",
  viewedAt: "2026-01-01T12:02:00.000Z",
  acknowledgedAt: "2026-01-01T12:03:00.000Z"
}
```

Valid progression:

```text
PENDING -> DELIVERED -> VIEWED -> ACKNOWLEDGED
```

Repeated acknowledgement is idempotent. Backward transitions are rejected.

## HTTP API

Base URL: `http://localhost:3000`

| Method | Endpoint                      | Purpose                                 |
| ------ | ----------------------------- | --------------------------------------- |
| `GET`  | `/health`                     | Service health                          |
| `POST` | `/api/alerts`                 | Create a draft alert                    |
| `GET`  | `/api/alerts`                 | List alerts; optional `?status=` filter |
| `GET`  | `/api/alerts/:id`             | Get one alert                           |
| `POST` | `/api/alerts/:id/process`     | Generate accessible representations     |
| `POST` | `/api/alerts/:id/send`        | Activate and broadcast an alert         |
| `POST` | `/api/alerts/:id/view`        | Record a recipient view                 |
| `POST` | `/api/alerts/:id/acknowledge` | Record a recipient acknowledgement      |
| `GET`  | `/api/alerts/:id/statistics`  | Get recipient statistics                |

The statistics response currently uses this shape:

```javascript
{
  alertId: "ALR-001",
  totalRecipients: 10,
  delivered: 10,
  viewed: 8,
  acknowledged: 6,
  acknowledgementRate: 60
}
```

API errors use:

```javascript
{
  "error": {
    "code": "ALERT_NOT_FOUND",
    "message": "Alert was not found"
  }
}
```

## Socket.IO Events

The server emits these events after persistence succeeds:

| Event                | Payload purpose                                        |
| -------------------- | ------------------------------------------------------ |
| `alert:connected`    | Realtime connection confirmation                       |
| `alert:sent`         | Sent alert payload with `alertId` and `alert`          |
| `alert:received`     | Delivery simulation payload with `alertId` and `alert` |
| `alert:viewed`       | `alertId`, recipient record, and `statistics`          |
| `alert:acknowledged` | `alertId`, recipient record, and `statistics`          |
| `alert:error`        | Socket acknowledgement error                           |

The client may emit:

```javascript
socket.emit("alert:acknowledge", { alertId, userId });
```

## Current Contract Limitations

- Authentication and authorization are not implemented.
- Persistence is in-memory and resets when the server restarts.
- Recipient totals come from registered in-memory recipient records.
- The processing service is deterministic demo logic, not an external AI provider.
