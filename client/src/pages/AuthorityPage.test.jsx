import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuthorityPage from "./AuthorityPage";
import { api } from "../services/api";

vi.mock("../hooks/useAlertSocket", () => ({
  useAlertSocket: () => "connected",
}));

vi.mock("../services/api", () => ({
  api: {
    listAlerts: vi.fn().mockResolvedValue([]),
    getStatistics: vi.fn().mockResolvedValue({
      totalRecipients: 10,
      delivered: 10,
      viewed: 8,
      acknowledged: 6,
      acknowledgementRate: 60,
    }),
    createAlert: vi.fn().mockResolvedValue({ id: "ALR-002" }),
    processAlert: vi.fn().mockResolvedValue({
      id: "ALR-002",
      type: "cyclone",
      severity: "critical",
      affectedArea: "Coastal Odisha",
      officialMessage: "Original official warning",
      simplified: {
        title: "CYCLONE WARNING",
        summary: "Move to safety.",
        actions: ["Go to a shelter"],
      },
      status: "draft",
    }),
    sendAlert: vi.fn().mockResolvedValue({
      id: "ALR-002",
      type: "cyclone",
      severity: "critical",
      affectedArea: "Coastal Odisha",
      officialMessage: "Original official warning",
      simplified: {
        title: "CYCLONE WARNING",
        summary: "Move to safety.",
        actions: ["Go to a shelter"],
      },
      status: "active",
    }),
  },
}));

describe("AuthorityPage", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("renders the dashboard and seeded statistics", () => {
    render(<AuthorityPage />);

    expect(
      screen.getByRole("heading", { name: "Alert operations" }),
    ).toBeInTheDocument();
    expect(screen.getByText("10,000")).toBeInTheDocument();
    expect(screen.getByText("78.4%")).toBeInTheDocument();
    expect(screen.getByText("Live updates connected")).toBeInTheDocument();
  });

  it("shows validation errors for an incomplete official message", () => {
    render(<AuthorityPage />);

    fireEvent.change(screen.getByLabelText("Official message"), {
      target: { value: "Too short" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Process alert for preview" }),
    );

    expect(
      screen.getByText("Enter the complete official message."),
    ).toBeInTheDocument();
    expect(screen.getByText("Waiting for input")).toBeInTheDocument();
  });

  it("previews generated content separately from the official message", async () => {
    render(<AuthorityPage />);

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Process alert for preview" }),
      );
    });

    expect(
      screen.getByText("Official message / unchanged"),
    ).toBeInTheDocument();
    expect(screen.getByText("Generated representation")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "CYCLONE WARNING" }),
    ).toBeInTheDocument();
    expect(api.createAlert).toHaveBeenCalledTimes(1);
    expect(api.processAlert).toHaveBeenCalledWith("ALR-002");
  });

  it("requires confirmation before sending and shows success after sending", async () => {
    render(<AuthorityPage />);

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Process alert for preview" }),
      );
    });
    fireEvent.click(screen.getByRole("button", { name: "Send alert" }));

    expect(
      screen.getByText("Send this warning to recipients?"),
    ).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Confirm send" }));
    });

    expect(
      screen.getByText("Alert sent. Delivery monitoring is active."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Alert sent" })).toBeDisabled();
    expect(api.sendAlert).toHaveBeenCalledWith("ALR-002");
  });
});
