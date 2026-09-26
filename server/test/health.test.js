import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";

test("health endpoint returns status ok and service identifier", async (t) => {
  const app = createApp();
  const server = app.listen(0);
  t.after(() => server.close());

  const address = server.address();
  const res = await fetch(`http://localhost:${address.port}/health`);

  assert.equal(res.status, 200);
  const body = await res.json();

  assert.equal(body.status, "ok");
  assert.equal(body.service, "alertbridge-server");
  assert.ok(body.timestamp);
});
