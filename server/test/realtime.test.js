import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { io as ioc } from "socket.io-client";
import { createApp } from "../src/app.js";
import { socketService } from "../src/services/socketService.js";
import { initializeDatabase } from "../src/db/index.js";
import { alertModel } from "../src/models/alertModel.js";

function setupRealtimeServer() {
  initializeDatabase();
  const app = createApp();
  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer);
  socketService.init(io);
  return { httpServer, io };
}

test("Socket.IO emits alert:sent and alert:received on send endpoint call", async (t) => {
  const { httpServer } = setupRealtimeServer();
  await new Promise((resolve) => httpServer.listen(0, resolve));
  t.after(() => httpServer.close());

  const port = httpServer.address().port;
  const clientSocket = ioc(`http://localhost:${port}`);
  t.after(() => clientSocket.close());

  await new Promise((resolve) => clientSocket.on("alert:connected", resolve));

  const sentPromise = new Promise((resolve) => clientSocket.on("alert:sent", resolve));
  const receivedPromise = new Promise((resolve) => clientSocket.on("alert:received", resolve));

  // Trigger send alert
  const res = await fetch(`http://localhost:${port}/api/alerts/ALR-001/send`, { method: "POST" });
  assert.equal(res.status, 200);

  const sentPayload = await sentPromise;
  const receivedPayload = await receivedPromise;

  assert.equal(sentPayload.alertId, "ALR-001");
  assert.equal(sentPayload.alert.status, "active");
  assert.equal(receivedPayload.alertId, "ALR-001");
});

test("Socket.IO emits alert:viewed on view endpoint call", async (t) => {
  const { httpServer } = setupRealtimeServer();
  await new Promise((resolve) => httpServer.listen(0, resolve));
  t.after(() => httpServer.close());

  const port = httpServer.address().port;
  const clientSocket = ioc(`http://localhost:${port}`);
  t.after(() => clientSocket.close());

  await new Promise((resolve) => clientSocket.on("alert:connected", resolve));

  const viewedPromise = new Promise((resolve) => clientSocket.on("alert:viewed", resolve));

  // Trigger view alert
  const res = await fetch(`http://localhost:${port}/api/alerts/ALR-001/view`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: "USR-REALTIME-VIEW" }),
  });
  assert.equal(res.status, 200);

  const viewedPayload = await viewedPromise;
  assert.equal(viewedPayload.alertId, "ALR-001");
  assert.equal(viewedPayload.userId, "USR-REALTIME-VIEW");
  assert.equal(viewedPayload.record.status, "VIEWED");
  assert.ok(viewedPayload.statistics);
});

test("Socket.IO emits alert:acknowledged when receiving alert:acknowledge socket event", async (t) => {
  const { httpServer } = setupRealtimeServer();
  await new Promise((resolve) => httpServer.listen(0, resolve));
  t.after(() => httpServer.close());

  const port = httpServer.address().port;
  const clientSocket = ioc(`http://localhost:${port}`);
  t.after(() => clientSocket.close());

  await new Promise((resolve) => clientSocket.on("alert:connected", resolve));

  const ackPromise = new Promise((resolve) => clientSocket.on("alert:acknowledged", resolve));

  clientSocket.emit("alert:acknowledge", {
    alertId: "ALR-001",
    userId: "USR-SOCKET-ACK",
  });

  const ackPayload = await ackPromise;
  assert.equal(ackPayload.alertId, "ALR-001");
  assert.equal(ackPayload.userId, "USR-SOCKET-ACK");
  assert.equal(ackPayload.record.status, "ACKNOWLEDGED");
  assert.ok(ackPayload.statistics);
});

test("Socket.IO handles disconnected clients gracefully without corrupting state", async (t) => {
  const { httpServer } = setupRealtimeServer();
  await new Promise((resolve) => httpServer.listen(0, resolve));
  t.after(() => httpServer.close());

  const port = httpServer.address().port;
  const clientSocket = ioc(`http://localhost:${port}`);

  await new Promise((resolve) => clientSocket.on("alert:connected", resolve));
  
  // Disconnect client
  clientSocket.close();

  // Verify alert model persistence state remains intact
  const demoAlert = alertModel.getById("ALR-001");
  assert.ok(demoAlert);
  assert.equal(demoAlert.id, "ALR-001");
});
