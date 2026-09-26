import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAlertSocket } from "./useAlertSocket";
import { createAlertSocket } from "../services/socket";

vi.mock("../services/socket", () => ({
  createAlertSocket: vi.fn(),
}));

describe("useAlertSocket", () => {
  let socket;
  let listeners;

  beforeEach(() => {
    listeners = new Map();
    socket = {
      on: vi.fn((event, handler) => listeners.set(event, handler)),
      off: vi.fn(),
      removeAllListeners: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
    createAlertSocket.mockReturnValue(socket);
  });

  it("connects, reports connection changes, and forwards alert events", () => {
    const onAcknowledged = vi.fn();
    const { result, unmount } = renderHook(() =>
      useAlertSocket({ "alert:acknowledged": onAcknowledged }),
    );

    expect(result.current).toBe("connecting");
    expect(socket.connect).toHaveBeenCalledTimes(1);

    act(() => listeners.get("connect")());
    expect(result.current).toBe("connected");

    const payload = { alertId: "ALR-001", statistics: { acknowledged: 7 } };
    act(() => listeners.get("alert:acknowledged")(payload));
    expect(onAcknowledged).toHaveBeenCalledWith(payload);

    act(() => listeners.get("disconnect")());
    expect(result.current).toBe("disconnected");

    unmount();
    expect(socket.disconnect).toHaveBeenCalledTimes(1);
  });
});
