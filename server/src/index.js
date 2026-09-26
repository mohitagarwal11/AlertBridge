import { createServer } from "node:http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { config } from "./config.js";
import { initializeDatabase } from "./db/index.js";
import { socketService } from "./services/socketService.js";

// Initialize DB and seed initial data
initializeDatabase();

const app = createApp();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: { origin: config.clientOrigin },
});

// Initialize socket service event listeners
socketService.init(io);

if (process.env.NODE_ENV !== "test") {
  httpServer.listen(config.port, () => {
    console.log(`AlertBridge server listening on http://localhost:${config.port}`);
  });
}

export { app, httpServer };
