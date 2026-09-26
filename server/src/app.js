import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { errorHandler } from "./middleware/errorHandler.js";
import alertRoutes from "./routes/alertRoutes.js";

export function createApp(configureRoutes) {
  const app = express();

  app.use(cors({ origin: config.clientOrigin }));
  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.json({
      status: "ok",
      service: "alertbridge-server",
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api/alerts", alertRoutes);

  if (typeof configureRoutes === "function") {
    configureRoutes(app);
  }

  // Centralized error middleware attached AFTER all routes
  app.use(errorHandler);

  return app;
}
