import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { initializeDatabase } from "../src/db/index.js";

test.beforeEach(() => {
  initializeDatabase();
});

test("POST /api/alerts creates a draft alert and returns shared alert shape", async (t) => {
  const app = createApp();
  const server = app.listen(0);
  t.after(() => server.close());

  const address = server.address();
  const res = await fetch(`http://localhost:${address.port}/api/alerts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "flood",
      severity: "high",
      affectedArea: "Riverside District",
      officialMessage: "Flooding expected near the river banks.",
    }),
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.ok(data.id);
  assert.equal(data.type, "flood");
  assert.equal(data.severity, "high");
  assert.equal(data.affectedArea, "Riverside District");
  assert.equal(data.officialMessage, "Flooding expected near the river banks.");
  assert.equal(data.status, "draft");
});

test("POST /api/alerts rejects malformed input with shared error format", async (t) => {
  const app = createApp();
  const server = app.listen(0);
  t.after(() => server.close());

  const address = server.address();
  const res = await fetch(`http://localhost:${address.port}/api/alerts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "flood",
      // missing officialMessage, severity, affectedArea
    }),
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.deepEqual(data, {
    error: {
      code: "INVALID_ALERT_DATA",
      message: "Alert 'severity' is required and must be a string",
    },
  });
});

test("GET /api/alerts lists all alerts including seeded cyclone demo", async (t) => {
  const app = createApp();
  const server = app.listen(0);
  t.after(() => server.close());

  const address = server.address();
  const res = await fetch(`http://localhost:${address.port}/api/alerts`);

  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(Array.isArray(body.data));
  assert.ok(body.data.length >= 1);
  assert.equal(body.data[0].id, "ALR-001");
});

test("GET /api/alerts/:id returns single alert detail or 404 error", async (t) => {
  const app = createApp();
  const server = app.listen(0);
  t.after(() => server.close());

  const address = server.address();
  
  // Existing alert
  const res1 = await fetch(`http://localhost:${address.port}/api/alerts/ALR-001`);
  assert.equal(res1.status, 200);
  const alert = await res1.json();
  assert.equal(alert.id, "ALR-001");

  // Non-existent alert
  const res2 = await fetch(`http://localhost:${address.port}/api/alerts/NON_EXISTENT`);
  assert.equal(res2.status, 404);
  const errBody = await res2.json();
  assert.deepEqual(errBody, {
    error: {
      code: "ALERT_NOT_FOUND",
      message: "Alert was not found",
    },
  });
});

test("POST /api/alerts/:id/process generates accessible representations preserving officialMessage", async (t) => {
  const app = createApp();
  const server = app.listen(0);
  t.after(() => server.close());

  const address = server.address();
  const res = await fetch(`http://localhost:${address.port}/api/alerts/ALR-001/process`, {
    method: "POST",
  });

  assert.equal(res.status, 200);
  const alert = await res.json();
  assert.ok(alert.simplified.title);
  assert.ok(alert.translations.en);
  assert.ok(alert.translations.hi);
  assert.ok(alert.translations.or);
  assert.ok(alert.officialMessage.includes("cyclonic storm"));
});

test("POST /api/alerts/:id/send updates alert status to active", async (t) => {
  const app = createApp();
  const server = app.listen(0);
  t.after(() => server.close());

  const address = server.address();
  const res = await fetch(`http://localhost:${address.port}/api/alerts/ALR-001/send`, {
    method: "POST",
  });

  assert.equal(res.status, 200);
  const alert = await res.json();
  assert.equal(alert.status, "active");
});

test("POST /api/alerts/:id/view and POST /api/alerts/:id/acknowledge record citizen lifecycle state", async (t) => {
  const app = createApp();
  const server = app.listen(0);
  t.after(() => server.close());

  const address = server.address();
  
  // View
  const viewRes = await fetch(`http://localhost:${address.port}/api/alerts/ALR-001/view`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: "USR-999" }),
  });
  assert.equal(viewRes.status, 200);
  const viewRecord = await viewRes.json();
  assert.equal(viewRecord.status, "VIEWED");

  // Acknowledge
  const ackRes = await fetch(`http://localhost:${address.port}/api/alerts/ALR-001/acknowledge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: "USR-999" }),
  });
  assert.equal(ackRes.status, 200);
  const ackRecord = await ackRes.json();
  assert.equal(ackRecord.status, "ACKNOWLEDGED");

  // Repeated acknowledgement is idempotent
  const repeatAckRes = await fetch(`http://localhost:${address.port}/api/alerts/ALR-001/acknowledge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: "USR-999" }),
  });
  assert.equal(repeatAckRes.status, 200);
  const repeatRecord = await repeatAckRes.json();
  assert.equal(repeatRecord.acknowledgedAt, ackRecord.acknowledgedAt);
});

test("GET /api/alerts/:id/statistics returns delivery and acknowledgement counts", async (t) => {
  const app = createApp();
  const server = app.listen(0);
  t.after(() => server.close());

  const address = server.address();
  const res = await fetch(`http://localhost:${address.port}/api/alerts/ALR-001/statistics`);

  assert.equal(res.status, 200);
  const stats = await res.json();
  assert.equal(stats.alertId, "ALR-001");
  assert.ok(typeof stats.totalRecipients === "number");
  assert.ok(typeof stats.delivered === "number");
  assert.ok(typeof stats.viewed === "number");
  assert.ok(typeof stats.acknowledged === "number");
});
