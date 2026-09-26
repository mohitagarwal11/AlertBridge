import test from "node:test";
import assert from "node:assert/strict";
import { AlertModel } from "../src/models/alertModel.js";
import { RecipientModel } from "../src/models/recipientModel.js";

test("AlertModel ensures officialMessage is immutable and cannot be overwritten", () => {
  const model = new AlertModel();
  const alert = model.create({
    type: "flood",
    severity: "warning",
    affectedArea: "River Bank",
    officialMessage: "Official message text that must stay unchanged",
  });

  assert.equal(alert.officialMessage, "Official message text that must stay unchanged");

  // Attempt to overwrite officialMessage via updateGeneratedContent
  assert.throws(
    () => {
      model.updateGeneratedContent(alert.id, {
        simplified: { title: "NEW TITLE", summary: "NEW SUMMARY", actions: [] },
        officialMessage: "Altered message attempt",
      });
    },
    (err) => err.code === "OFFICIAL_MESSAGE_IMMUTABLE"
  );

  // Check officialMessage remains unchanged
  const fetched = model.getById(alert.id);
  assert.equal(fetched.officialMessage, "Official message text that must stay unchanged");
});

test("AlertModel indexes alerts by status and creation time", () => {
  const model = new AlertModel();
  model.clear();

  const a1 = model.create({
    id: "ALR-TEST-1",
    type: "fire",
    severity: "high",
    affectedArea: "Forest",
    officialMessage: "Forest fire alert",
    status: "active",
    createdAt: "2026-01-01T10:00:00.000Z",
  });

  const a2 = model.create({
    id: "ALR-TEST-2",
    type: "flood",
    severity: "critical",
    affectedArea: "Valley",
    officialMessage: "Valley flood alert",
    status: "draft",
    createdAt: "2026-01-01T12:00:00.000Z",
  });

  const activeAlerts = model.getAll({ status: "active" });
  assert.equal(activeAlerts.length, 1);
  assert.equal(activeAlerts[0].id, "ALR-TEST-1");

  const allAlertsSorted = model.getAll();
  assert.equal(allAlertsSorted[0].id, "ALR-TEST-2"); // latest created first
  assert.equal(allAlertsSorted[1].id, "ALR-TEST-1");
});

test("RecipientModel enforces PENDING -> DELIVERED -> VIEWED -> ACKNOWLEDGED transition order", () => {
  const model = new RecipientModel();
  const alertId = "ALR-TEST-100";
  const userId = "USR-001";

  // Initial state is PENDING
  const rec1 = model.createOrGetRecord(alertId, userId);
  assert.equal(rec1.status, "PENDING");
  assert.equal(rec1.deliveredAt, null);
  assert.equal(rec1.viewedAt, null);
  assert.equal(rec1.acknowledgedAt, null);

  // Transition to DELIVERED
  const rec2 = model.recordDelivery(alertId, userId);
  assert.equal(rec2.status, "DELIVERED");
  assert.ok(rec2.deliveredAt);

  // Transition to VIEWED
  const rec3 = model.recordView(alertId, userId);
  assert.equal(rec3.status, "VIEWED");
  assert.ok(rec3.viewedAt);

  // Transition to ACKNOWLEDGED
  const rec4 = model.recordAcknowledgement(alertId, userId);
  assert.equal(rec4.status, "ACKNOWLEDGED");
  assert.ok(rec4.acknowledgedAt);

  // Attempting backward transition fails
  assert.throws(
    () => {
      model.updateStatus(alertId, userId, "DELIVERED");
    },
    (err) => err.code === "INVALID_STATUS_TRANSITION"
  );
});

test("RecipientModel acknowledgement is idempotent and does not corrupt state or stats", () => {
  const model = new RecipientModel();
  const alertId = "ALR-TEST-200";
  const userId = "USR-002";

  const firstAck = model.recordAcknowledgement(alertId, userId);
  const ackTimestamp = firstAck.acknowledgedAt;
  assert.ok(ackTimestamp);

  // Repeat acknowledgement call
  const secondAck = model.recordAcknowledgement(alertId, userId);
  assert.equal(secondAck.status, "ACKNOWLEDGED");
  assert.equal(secondAck.acknowledgedAt, ackTimestamp);

  // Verify statistics reporting
  const stats = model.getStatistics(alertId);
  assert.equal(stats.totalRecipients, 1);
  assert.equal(stats.delivered, 1);
  assert.equal(stats.viewed, 1);
  assert.equal(stats.acknowledged, 1);
  assert.equal(stats.acknowledgementRate, 100);
});
