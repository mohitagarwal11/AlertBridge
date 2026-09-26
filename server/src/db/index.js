import { alertModel } from "../models/alertModel.js";
import { recipientModel } from "../models/recipientModel.js";

export function initializeDatabase() {
  alertModel.seed();
  recipientModel.clear();
  
  // Seed sample recipient status for demo alert ALR-001
  const demoAlertId = "ALR-001";
  for (let i = 1; i <= 10; i++) {
    const userId = `USR-${String(i).padStart(3, "0")}`;
    recipientModel.recordDelivery(demoAlertId, userId);
    if (i <= 8) {
      recipientModel.recordView(demoAlertId, userId);
    }
    if (i <= 6) {
      recipientModel.recordAcknowledgement(demoAlertId, userId);
    }
  }

  return {
    status: "initialized",
    timestamp: new Date().toISOString(),
  };
}
