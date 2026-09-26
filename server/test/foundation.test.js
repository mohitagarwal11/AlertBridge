import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { validateAlertCreation } from "../src/middleware/validate.js";
import { initializeDatabase } from "../src/db/index.js";
import { alertModel } from "../src/models/alertModel.js";

test("centralized error middleware formats errors with standard error shape", async (t) => {
  const app = createApp((expressApp) => {
    expressApp.get("/test-error", (_req, _res, next) => {
      const error = new Error("Something went wrong");
      error.statusCode = 422;
      error.code = "CUSTOM_ERROR";
      next(error);
    });
  });

  const server = app.listen(0);
  t.after(() => server.close());

  const address = server.address();
  const res = await fetch(`http://localhost:${address.port}/test-error`);

  assert.equal(res.status, 422);
  const body = await res.json();
  assert.deepEqual(body, {
    error: {
      code: "CUSTOM_ERROR",
      message: "Something went wrong",
    },
  });
});

test("request validation rejects malformed alert creation payloads", () => {
  const reqMissingType = { body: { severity: "critical", affectedArea: "Area", officialMessage: "Msg" } };
  let errorCaught = null;
  validateAlertCreation(reqMissingType, {}, (err) => {
    errorCaught = err;
  });

  assert.ok(errorCaught);
  assert.equal(errorCaught.code, "INVALID_ALERT_DATA");
  assert.equal(errorCaught.statusCode, 400);
});

test("database initialization seeds cyclone demo alert data", () => {
  initializeDatabase();
  const demoAlert = alertModel.getById("ALR-001");
  assert.ok(demoAlert);
  assert.equal(demoAlert.type, "cyclone");
  assert.equal(demoAlert.severity, "critical");
  assert.equal(demoAlert.affectedArea, "Coastal Odisha");
  assert.ok(demoAlert.officialMessage.includes("cyclonic storm"));
  assert.ok(demoAlert.simplified.title);
  assert.ok(demoAlert.translations.en);
  assert.ok(demoAlert.translations.hi);
  assert.ok(demoAlert.translations.or);
  assert.ok(demoAlert.visualInstructions.length > 0);
});
