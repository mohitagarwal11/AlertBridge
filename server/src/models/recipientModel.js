import { ApiError } from "../middleware/errorHandler.js";

const VALID_STATUSES = ["PENDING", "DELIVERED", "VIEWED", "ACKNOWLEDGED"];

const STATUS_RANK = {
  PENDING: 1,
  DELIVERED: 2,
  VIEWED: 3,
  ACKNOWLEDGED: 4,
};

export class RecipientModel {
  constructor() {
    this.recipients = new Map(); // key: `${alertId}:${userId}`
    this.byAlertIdIndex = new Map(); // alertId -> Set of keys
    this.byUserIdIndex = new Map(); // userId -> Set of keys
    this.byStatusIndex = new Map(); // status -> Set of keys
  }

  clear() {
    this.recipients.clear();
    this.byAlertIdIndex.clear();
    this.byUserIdIndex.clear();
    this.byStatusIndex.clear();
  }

  getKey(alertId, userId) {
    return `${alertId}:${userId}`;
  }

  getRecord(alertId, userId) {
    const key = this.getKey(alertId, userId);
    const record = this.recipients.get(key);
    return record ? JSON.parse(JSON.stringify(record)) : null;
  }

  createOrGetRecord(alertId, userId) {
    const key = this.getKey(alertId, userId);
    if (!this.recipients.has(key)) {
      const record = {
        alertId,
        userId,
        status: "PENDING",
        deliveredAt: null,
        viewedAt: null,
        acknowledgedAt: null,
      };
      this.recipients.set(key, record);
      this.addToIndexes(record);
    }
    return this.recipients.get(key);
  }

  updateStatus(alertId, userId, targetStatus) {
    if (!VALID_STATUSES.includes(targetStatus)) {
      throw new ApiError("INVALID_STATUS", `Invalid recipient status: ${targetStatus}`, 400);
    }

    const record = this.createOrGetRecord(alertId, userId);
    const currentRank = STATUS_RANK[record.status];
    const targetRank = STATUS_RANK[targetStatus];

    // Idempotency check: if already at or beyond target status
    if (record.status === targetStatus) {
      return JSON.parse(JSON.stringify(record));
    }

    // Idempotent behavior for ACKNOWLEDGED: repeated acknowledgement returns current state
    if (record.status === "ACKNOWLEDGED" && targetStatus === "ACKNOWLEDGED") {
      return JSON.parse(JSON.stringify(record));
    }

    // Reject backward transitions
    if (targetRank < currentRank) {
      throw new ApiError(
        "INVALID_STATUS_TRANSITION",
        `Cannot transition recipient status backward from ${record.status} to ${targetStatus}`,
        400
      );
    }

    // Enforce PENDING -> DELIVERED -> VIEWED -> ACKNOWLEDGED transition order
    const now = new Date().toISOString();

    this.removeFromIndexes(record);

    if (targetRank >= STATUS_RANK.DELIVERED && !record.deliveredAt) {
      record.deliveredAt = now;
    }
    if (targetRank >= STATUS_RANK.VIEWED && !record.viewedAt) {
      record.viewedAt = now;
    }
    if (targetRank >= STATUS_RANK.ACKNOWLEDGED && !record.acknowledgedAt) {
      record.acknowledgedAt = now;
    }

    record.status = targetStatus;
    this.addToIndexes(record);

    return JSON.parse(JSON.stringify(record));
  }

  recordDelivery(alertId, userId) {
    return this.updateStatus(alertId, userId, "DELIVERED");
  }

  recordView(alertId, userId) {
    return this.updateStatus(alertId, userId, "VIEWED");
  }

  recordAcknowledgement(alertId, userId) {
    return this.updateStatus(alertId, userId, "ACKNOWLEDGED");
  }

  getStatistics(alertId) {
    const keys = this.byAlertIdIndex.get(alertId) || new Set();
    let total = keys.size;

    let deliveredCount = 0;
    let viewedCount = 0;
    let acknowledgedCount = 0;

    for (const key of keys) {
      const record = this.recipients.get(key);
      if (!record) continue;

      if (record.deliveredAt) deliveredCount++;
      if (record.viewedAt) viewedCount++;
      if (record.acknowledgedAt) acknowledgedCount++;
    }

    // If no specific recipients were registered yet for demo, default total base count can be derived
    return {
      alertId,
      totalRecipients: total,
      delivered: deliveredCount,
      viewed: viewedCount,
      acknowledged: acknowledgedCount,
      acknowledgementRate: total > 0 ? (acknowledgedCount / total) * 100 : 0,
    };
  }

  addToIndexes(record) {
    const key = this.getKey(record.alertId, record.userId);

    if (!this.byAlertIdIndex.has(record.alertId)) {
      this.byAlertIdIndex.set(record.alertId, new Set());
    }
    this.byAlertIdIndex.get(record.alertId).add(key);

    if (!this.byUserIdIndex.has(record.userId)) {
      this.byUserIdIndex.set(record.userId, new Set());
    }
    this.byUserIdIndex.get(record.userId).add(key);

    if (!this.byStatusIndex.has(record.status)) {
      this.byStatusIndex.set(record.status, new Set());
    }
    this.byStatusIndex.get(record.status).add(key);
  }

  removeFromIndexes(record) {
    const key = this.getKey(record.alertId, record.userId);
    if (this.byStatusIndex.has(record.status)) {
      this.byStatusIndex.get(record.status).delete(key);
    }
  }
}

export const recipientModel = new RecipientModel();
