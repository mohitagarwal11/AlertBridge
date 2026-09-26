import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CitizenPage from "./CitizenPage";

vi.mock("../hooks/useAlertSocket", () => ({
  useAlertSocket: () => "connected",
}));

describe("CitizenPage", () => {
  let speechSynthesis;

  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
    speechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
    };
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: speechSynthesis,
    });
  });

  it("renders the accessible alert while preserving the official message", () => {
    render(<CitizenPage />);

    expect(
      screen.getByRole("heading", { name: "CYCLONE APPROACHING" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Due to the severe cyclonic storm/),
    ).toBeInTheDocument();
    expect(screen.getByText("Live updates connected")).toBeInTheDocument();
  });

  it("changes the alert representation when a language is selected", () => {
    render(<CitizenPage />);

    fireEvent.change(screen.getByLabelText("Language"), {
      target: { value: "hi" },
    });

    expect(
      screen.getByRole("heading", { name: "चक्रवात आ रहा है" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("तुरंत सुरक्षित स्थान पर जाएं।"),
    ).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("hi");
  });

  it("starts and stops browser speech playback", () => {
    render(<CitizenPage />);

    fireEvent.click(screen.getByRole("button", { name: "Listen to alert" }));
    expect(speechSynthesis.speak).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("button", { name: "Stop listening" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Stop listening" }));
    expect(speechSynthesis.cancel).toHaveBeenCalledTimes(1);
  });

  it("persists an acknowledgement and disables duplicate acknowledgement", async () => {
    vi.useFakeTimers();
    render(<CitizenPage />);

    const acknowledgeButton = screen.getByRole("button", {
      name: "I understand this alert",
    });
    fireEvent.click(acknowledgeButton);

    expect(
      screen.getByRole("button", { name: "Saving acknowledgement..." }),
    ).toBeDisabled();
    act(() => vi.advanceTimersByTime(350));

    expect(
      screen.getByRole("button", { name: "Alert acknowledged" }),
    ).toBeDisabled();
    expect(
      JSON.parse(localStorage.getItem("alertbridge.citizen.history")),
    ).toHaveLength(1);
    expect(screen.getByText(/Acknowledged/)).toBeInTheDocument();
  });

  it("applies accessibility settings to the page", () => {
    render(<CitizenPage />);

    fireEvent.click(screen.getByLabelText("Large text"));
    fireEvent.click(screen.getByLabelText("High contrast"));
    fireEvent.click(screen.getByLabelText("Reduced motion"));
    fireEvent.click(screen.getByLabelText("Low connectivity"));

    expect(document.querySelector(".citizen-page")).toHaveClass(
      "large-text",
      "high-contrast",
      "reduced-motion",
      "low-connectivity",
    );
    expect(
      screen.getByRole("heading", { name: "Alert history" }),
    ).toBeInTheDocument();
  });
});
