import { Router } from "express";
import {
  createAlert,
  getAlerts,
  getAlertById,
  processAlert,
  sendAlert,
  viewAlert,
  acknowledgeAlert,
  getAlertStatistics,
} from "../controllers/alertController.js";
import { validateAlertCreation } from "../middleware/validate.js";

const router = Router();

router.post("/", validateAlertCreation, createAlert);
router.get("/", getAlerts);
router.get("/:id", getAlertById);
router.post("/:id/process", processAlert);
router.post("/:id/send", sendAlert);
router.post("/:id/view", viewAlert);
router.post("/:id/acknowledge", acknowledgeAlert);
router.get("/:id/statistics", getAlertStatistics);

export default router;
