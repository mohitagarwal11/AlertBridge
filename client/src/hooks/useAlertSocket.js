import { useEffect, useRef, useState } from "react";
import { createAlertSocket } from "../services/socket";

const eventNames = [
  "alert:sent",
  "alert:received",
  "alert:viewed",
  "alert:acknowledged",
];

export function useAlertSocket(handlers = {}) {
  const handlersRef = useRef(handlers);
  const [connectionState, setConnectionState] = useState("connecting");

  handlersRef.current = handlers;

  useEffect(() => {
    const socket = createAlertSocket();
    const handleConnect = () => setConnectionState("connected");
    const handleDisconnect = () => setConnectionState("disconnected");
    const handleConnectError = () => setConnectionState("disconnected");

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    eventNames.forEach((eventName) => {
      socket.on(eventName, (payload) => {
        handlersRef.current[eventName]?.(payload);
      });
    });
    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      eventNames.forEach((eventName) => socket.removeAllListeners(eventName));
      socket.disconnect();
    };
  }, []);

  return connectionState;
}
