import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const port = Number(process.env.PORT || 3000);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: clientOrigin } });

app.use(cors({ origin: clientOrigin }));
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "alertbridge-server" });
});

app.get("/api/alerts", (_request, response) => {
  response.json({ data: [] });
});

io.on("connection", (socket) => {
  socket.emit("alert:connected", {
    message: "AlertBridge realtime channel ready",
  });
});

httpServer.listen(port, () => {
  console.log(`AlertBridge server listening on http://localhost:${port}`);
});
