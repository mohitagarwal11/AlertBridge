import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CitizenPage from "./CitizenPage";
import { api } from "../services/api";

vi.mock("../hooks/useAlertSocket", () => ({
  useAlertSocket: () => "connected",
}));

vi.mock("../services/api", () => ({
  api: {
    listAlerts: vi.fn().mockResolvedValue([]),
    viewAlert: vi.fn().mockResolvedValue({ status: "VIEWED" }),
    acknowledgeAlert: vi.fn().mockResolvedValue({ status: "ACKNOWLEDGED" }),
  },
}));

describe("CitizenPage", () => {
  let speechSynthesis;

  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
    speechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
      getVoices: vi.fn().mockReturnValue([{ lang: "hi-IN" }]),
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
    expect(api.listAlerts).toHaveBeenCalledWith("active");
    expect(api.viewAlert).toHaveBeenCalledWith("ALR-001", "USR-CITIZEN");
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
    expect(
      screen.getByRole("button", { name: "अलर्ट सुनें" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "मैंने अलर्ट समझ लिया" }),
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

  it("uses an available fallback voice when an Odia voice is unavailable", () => {
    render(<CitizenPage />);

    fireEvent.change(screen.getByLabelText("Language"), {
      target: { value: "or" },
    });
    fireEvent.click(screen.getByRole("button", { name: "ଆଲର୍ଟ ଶୁଣନ୍ତୁ" }));

    const utterance = speechSynthesis.speak.mock.calls[0][0];
    expect(utterance.lang).toBe("hi-IN");
    expect(utterance.text).toContain("Baatyaa aasuchhi");
    expect(
      screen.getByText(
        "No Odia voice is installed; using an audio-compatible fallback.",
      ),
    ).toBeInTheDocument();
  });

  it("persists an acknowledgement and disables duplicate acknowledgement", async () => {
    render(<CitizenPage />);

    const acknowledgeButton = screen.getByRole("button", {
      name: "I understand this alert",
    });
    await act(async () => fireEvent.click(acknowledgeButton));

    expect(
      screen.getByRole("button", { name: "Alert acknowledged" }),
    ).toBeDisabled();
    expect(
      JSON.parse(localStorage.getItem("alertbridge.citizen.history")),
    ).toHaveLength(1);
    expect(screen.getByText(/Acknowledged/)).toBeInTheDocument();
    expect(api.acknowledgeAlert).toHaveBeenCalledWith("ALR-001", "USR-CITIZEN");
  });

  it("shows a retryable acknowledgement state when the API fails", async () => {
    api.acknowledgeAlert.mockRejectedValueOnce(new Error("offline"));
    render(<CitizenPage />);

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "I understand this alert" }),
      );
    });

    expect(
      screen.getByRole("button", { name: "Try acknowledgement again" }),
    ).toBeEnabled();
    expect(
      screen.getByText(
        "We could not save your acknowledgement on this device.",
      ),
    ).toBeInTheDocument();
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
