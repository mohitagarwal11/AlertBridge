import { ApiError } from "../middleware/errorHandler.js";
import { seedAlerts } from "../db/seedData.js";

export class AlertModel {
  constructor() {
    this.alerts = new Map();
    this.statusIndex = new Map();
    this.createdAtIndex = [];
    this.seed();
  }

  seed() {
    this.clear();
    for (const alertData of seedAlerts) {
      this.create(alertData);
    }
  }

  clear() {
    this.alerts.clear();
    this.statusIndex.clear();
    this.createdAtIndex = [];
  }

  create(data) {
    const id = data.id || `ALR-${String(this.alerts.size + 1).padStart(3, "0")}`;

    const alert = {
      id,
      type: data.type,
      severity: data.severity,
      affectedArea: data.affectedArea,
      officialMessage: String(data.officialMessage),
      simplified: data.simplified || { title: "", summary: "", actions: [] },
      translations: data.translations || { en: {}, hi: {}, or: {} },
      visualInstructions: data.visualInstructions || [],
      status: data.status || "pending",
      createdAt: data.createdAt || new Date().toISOString(),
      expiresAt: data.expiresAt || new Date(Date.now() + 86400000).toISOString(),
    };

    // Guard: Object property descriptor ensuring officialMessage is read-only on instance
    Object.defineProperty(alert, "officialMessage", {
      value: String(data.officialMessage),
      writable: false,
      configurable: false,
      enumerable: true,
    });

    this.alerts.set(id, alert);
    this.addToIndexes(alert);
    return this.getById(id);
  }

  getById(id) {
    const alert = this.alerts.get(id);
    if (!alert) return null;
    // Return a clone to prevent direct external mutation
    return JSON.parse(JSON.stringify(alert));
  }

  getAll(filter = {}) {
    let result = Array.from(this.alerts.values());

    if (filter.status) {
      const ids = this.statusIndex.get(filter.status) || new Set();
      result = Array.from(ids).map((id) => this.alerts.get(id)).filter(Boolean);
    }

    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return result.map((alert) => JSON.parse(JSON.stringify(alert)));
  }

  updateGeneratedContent(id, { simplified, translations, visualInstructions, officialMessage }) {
    const existing = this.alerts.get(id);
    if (!existing) {
      throw new ApiError("ALERT_NOT_FOUND", "Alert was not found", 404);
    }

    // Verify officialMessage cannot be modified or replaced
    if (officialMessage !== undefined && officialMessage !== existing.officialMessage) {
      throw new ApiError(
        "OFFICIAL_MESSAGE_IMMUTABLE",
        "Official message is immutable and cannot be modified by generated content",
        400
      );
    }

    const updated = {
      ...existing,
      simplified: simplified !== undefined ? simplified : existing.simplified,
      translations: translations !== undefined ? translations : existing.translations,
      visualInstructions: visualInstructions !== undefined ? visualInstructions : existing.visualInstructions,
    };

    Object.defineProperty(updated, "officialMessage", {
      value: existing.officialMessage,
      writable: false,
      configurable: false,
      enumerable: true,
    });

    this.alerts.set(id, updated);
    return this.getById(id);
  }

  updateStatus(id, newStatus) {
    const existing = this.alerts.get(id);
    if (!existing) {
      throw new ApiError("ALERT_NOT_FOUND", "Alert was not found", 404);
    }

    this.removeFromIndexes(existing);
    existing.status = newStatus;
    this.addToIndexes(existing);
    return this.getById(id);
  }

  addToIndexes(alert) {
    if (!this.statusIndex.has(alert.status)) {
      this.statusIndex.set(alert.status, new Set());
    }
    this.statusIndex.get(alert.status).add(alert.id);

    if (!this.createdAtIndex.includes(alert.id)) {
      this.createdAtIndex.push(alert.id);
    }
  }

  removeFromIndexes(alert) {
    if (this.statusIndex.has(alert.status)) {
      this.statusIndex.get(alert.status).delete(alert.id);
    }
  }
}

export const alertModel = new AlertModel();
