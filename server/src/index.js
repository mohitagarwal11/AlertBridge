import { createServer } from "node:http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { config } from "./config.js";
import { initializeDatabase } from "./db/index.js";

// Initialize DB and seed initial data
initializeDatabase();

const app = createApp();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: { origin: config.clientOrigin },
});

io.on("connection", (socket) => {
  socket.emit("alert:connected", {
    message: "AlertBridge realtime channel ready",
  });
});

if (process.env.NODE_ENV !== "test") {
  httpServer.listen(config.port, () => {
    console.log(`AlertBridge server listening on http://localhost:${config.port}`);
  });
}

export { app, httpServer };
