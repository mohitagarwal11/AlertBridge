import { alertModel } from "../models/alertModel.js";
import { recipientModel } from "../models/recipientModel.js";
import { processingService } from "../services/processingService.js";
import { socketService } from "../services/socketService.js";
import { ApiError } from "../middleware/errorHandler.js";

export async function createAlert(req, res, next) {
  try {
    const { type, severity, affectedArea, officialMessage, simplified, translations, visualInstructions, expiresAt } = req.body;

    const alert = alertModel.create({
      type,
      severity,
      affectedArea,
      officialMessage,
      simplified,
      translations,
      visualInstructions,
      status: "draft",
      expiresAt,
    });

    res.status(201).json(alert);
  } catch (err) {
    next(err);
  }
}

export async function getAlerts(req, res, next) {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const alerts = alertModel.getAll(filter);
    res.json({ data: alerts });
  } catch (err) {
    next(err);
  }
}

export async function getAlertById(req, res, next) {
  try {
    const { id } = req.params;
    const alert = alertModel.getById(id);
    if (!alert) {
      throw new ApiError("ALERT_NOT_FOUND", "Alert was not found", 404);
    }
    res.json(alert);
  } catch (err) {
    next(err);
  }
}

export async function processAlert(req, res, next) {
  try {
    const { id } = req.params;
    const existing = alertModel.getById(id);
    if (!existing) {
      throw new ApiError("ALERT_NOT_FOUND", "Alert was not found", 404);
    }

    const processed = await processingService.processAlert(
      existing.officialMessage,
      existing.type,
      existing.severity,
      existing.affectedArea
    );

    const updated = alertModel.updateGeneratedContent(id, {
      simplified: processed.simplified,
      translations: processed.translations,
      visualInstructions: processed.visualInstructions,
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function sendAlert(req, res, next) {
  try {
    const { id } = req.params;
    const existing = alertModel.getById(id);
    if (!existing) {
      throw new ApiError("ALERT_NOT_FOUND", "Alert was not found", 404);
    }

    const updated = alertModel.updateStatus(id, "active");
    
    // Emit realtime alert:sent and alert:received events after state is persisted
    socketService.emitAlertSent(updated);

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function viewAlert(req, res, next) {
  try {
    const { id } = req.params;
    const existing = alertModel.getById(id);
    if (!existing) {
      throw new ApiError("ALERT_NOT_FOUND", "Alert was not found", 404);
    }

    const userId = req.body?.userId || "USR-CITIZEN";
    const record = recipientModel.recordView(id, userId);
    const statistics = recipientModel.getStatistics(id);

    // Emit realtime alert:viewed event after state is persisted
    socketService.emitAlertViewed(id, userId, record, statistics);

    res.json(record);
  } catch (err) {
    next(err);
  }
}

export async function acknowledgeAlert(req, res, next) {
  try {
    const { id } = req.params;
    const existing = alertModel.getById(id);
    if (!existing) {
      throw new ApiError("ALERT_NOT_FOUND", "Alert was not found", 404);
    }

    const userId = req.body?.userId || "USR-CITIZEN";
    const record = recipientModel.recordAcknowledgement(id, userId);
    const statistics = recipientModel.getStatistics(id);

    // Emit realtime alert:acknowledged event after state is persisted
    socketService.emitAlertAcknowledged(id, userId, record, statistics);

    res.json(record);
  } catch (err) {
    next(err);
  }
}

export async function getAlertStatistics(req, res, next) {
  try {
    const { id } = req.params;
    const existing = alertModel.getById(id);
    if (!existing) {
      throw new ApiError("ALERT_NOT_FOUND", "Alert was not found", 404);
    }

    const stats = recipientModel.getStatistics(id);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}
