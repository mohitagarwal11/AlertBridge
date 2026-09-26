import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { initializeDatabase } from "../src/db/index.js";

test.beforeEach(() => {
  initializeDatabase();
});

test("Hardening: Unknown route returns standard 404 error response", async (t) => {
  const app = createApp();
  const server = app.listen(0);
  t.after(() => server.close());

  const address = server.address();
  const res = await fetch(`http://localhost:${address.port}/api/unknown-endpoint`);

  assert.equal(res.status, 404);
  const body = await res.json();
  assert.equal(body.error.code, "NOT_FOUND");
});

test("Hardening: Express CORS headers reflect configured CLIENT_ORIGIN", async (t) => {
  const app = createApp();
  const server = app.listen(0);
  t.after(() => server.close());

  const address = server.address();
  const res = await fetch(`http://localhost:${address.port}/health`, {
    headers: { Origin: "http://localhost:5173" },
  });

  assert.equal(res.headers.get("access-control-allow-origin"), "http://localhost:5173");
});

test("Hardening: Malformed JSON body is handled by centralized error handler", async (t) => {
  const app = createApp();
  const server = app.listen(0);
  t.after(() => server.close());

  const address = server.address();
  const res = await fetch(`http://localhost:${address.port}/api/alerts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{ invalid_json: ",
  });

  assert.equal(res.status, 400);
  const body = await res.json();
  assert.ok(body.error);
  assert.ok(body.error.code);
});

test("Hardening: All API responses strictly adhere to error and alert contracts", async (t) => {
  const app = createApp();
  const server = app.listen(0);
  t.after(() => server.close());

  const address = server.address();

  // Test 404 shape for process endpoint with bad ID
  const processRes = await fetch(`http://localhost:${address.port}/api/alerts/ALR-MISSING/process`, {
    method: "POST",
  });
  assert.equal(processRes.status, 404);
  const processErr = await processRes.json();
  assert.equal(processErr.error.code, "ALERT_NOT_FOUND");
  assert.equal(processErr.error.message, "Alert was not found");

  // Test 404 shape for send endpoint with bad ID
  const sendRes = await fetch(`http://localhost:${address.port}/api/alerts/ALR-MISSING/send`, {
    method: "POST",
  });
  assert.equal(sendRes.status, 404);
  const sendErr = await sendRes.json();
  assert.equal(sendErr.error.code, "ALERT_NOT_FOUND");

  // Test 404 shape for statistics endpoint with bad ID
  const statsRes = await fetch(`http://localhost:${address.port}/api/alerts/ALR-MISSING/statistics`);
  assert.equal(statsRes.status, 404);
  const statsErr = await statsRes.json();
  assert.equal(statsErr.error.code, "ALERT_NOT_FOUND");
});
