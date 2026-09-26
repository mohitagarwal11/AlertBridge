import { recipientModel } from "../models/recipientModel.js";
import { alertModel } from "../models/alertModel.js";

export class SocketService {
  constructor() {
    this.io = null;
  }

  init(ioInstance) {
    this.io = ioInstance;

    this.io.on("connection", (socket) => {
      socket.emit("alert:connected", {
        message: "AlertBridge realtime channel ready",
        socketId: socket.id,
      });

      // Handle socket-initiated acknowledgement
      socket.on("alert:acknowledge", (data) => {
        try {
          const { alertId, userId = `USR-SOCKET-${socket.id}` } = data || {};
          if (!alertId) return;

          const alert = alertModel.getById(alertId);
          if (!alert) return;

          const record = recipientModel.recordAcknowledgement(alertId, userId);
          const statistics = recipientModel.getStatistics(alertId);

          this.emitAlertAcknowledged(alertId, userId, record, statistics);
        } catch (err) {
          socket.emit("alert:error", {
            code: err.code || "SOCKET_ERROR",
            message: err.message || "Failed to acknowledge alert over socket",
          });
        }
      });

      socket.on("disconnect", () => {
        // Disconnected client handled gracefully without corrupting state
      });
    });
  }

  emitAlertSent(alert) {
    if (!this.io) return;
    const payload = {
      alertId: alert.id,
      alert,
      timestamp: new Date().toISOString(),
    };

    // Emit alert:sent and alert:received for delivery simulation
    this.io.emit("alert:sent", payload);
    this.io.emit("alert:received", payload);
  }

  emitAlertViewed(alertId, userId, record, statistics) {
    if (!this.io) return;
    this.io.emit("alert:viewed", {
      alertId,
      userId,
      record,
      statistics,
      timestamp: new Date().toISOString(),
    });
  }

  emitAlertAcknowledged(alertId, userId, record, statistics) {
    if (!this.io) return;
    this.io.emit("alert:acknowledged", {
      alertId,
      userId,
      record,
      statistics,
      timestamp: new Date().toISOString(),
    });
  }
}

export const socketService = new SocketService();
