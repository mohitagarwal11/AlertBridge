import { useEffect, useMemo, useRef, useState } from "react";
import ConnectionStatus from "../components/ui/ConnectionStatus";
import { demoAlert } from "../data/demoAlerts";
import { useAlertSocket } from "../hooks/useAlertSocket";
import { api } from "../services/api";

const languageOptions = [
  { code: "en", label: "English", speech: "en-IN" },
  { code: "hi", label: "हिन्दी", speech: "hi-IN" },
  { code: "or", label: "ଓଡ଼ିଆ", speech: "or-IN" },
];

const historyKey = "alertbridge.citizen.history";

function formatExpiry(date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function CitizenPage() {
  const [activeAlert, setActiveAlert] = useState(demoAlert);
  const [language, setLanguage] = useState("en");
  const [isLargeText, setIsLargeText] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isLowConnectivity, setIsLowConnectivity] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [acknowledgement, setAcknowledgement] = useState("available");
  const [history, setHistory] = useState([]);
  const viewedAlertIds = useRef(new Set());
  const copy =
    activeAlert.translations[language] || activeAlert.translations.en;
  const selectedLanguage = languageOptions.find(
    (item) => item.code === language,
  );
  const connectionState = useAlertSocket({
    "alert:received": (payload) => {
      const incomingAlert = payload?.alert || payload;
      if (incomingAlert?.id) {
        setActiveAlert(incomingAlert);
        setAcknowledgement("available");
      }
    },
    "alert:sent": (payload) => {
      const incomingAlert = payload?.alert || payload;
      if (incomingAlert?.id) {
        setActiveAlert(incomingAlert);
        setAcknowledgement("available");
      }
    },
  });

  useEffect(() => {
    try {
      setHistory(JSON.parse(localStorage.getItem(historyKey) || "[]"));
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    return () => {
      document.documentElement.lang = "en";
      window.speechSynthesis?.cancel();
    };
  }, [language]);

  useEffect(() => {
    if (isLowConnectivity) return;

    let cancelled = false;
    api
      .listAlerts()
      .then((alerts) => {
        if (cancelled || alerts.length === 0) return;
        const activeAlert =
          alerts.find((alert) => alert.status === "active") || alerts[0];
        setActiveAlert(activeAlert);
        setAcknowledgement("available");
      })
      .catch(() => {
        // Keep the seeded demo alert when the API is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, [isLowConnectivity]);

  useEffect(() => {
    if (isLowConnectivity || viewedAlertIds.current.has(activeAlert.id)) return;

    viewedAlertIds.current.add(activeAlert.id);
    api.viewAlert(activeAlert.id, "USR-CITIZEN").catch(() => {
      viewedAlertIds.current.delete(activeAlert.id);
    });
  }, [activeAlert.id, isLowConnectivity]);

  const speechText = useMemo(
    () => [copy.title, copy.summary, ...copy.actions].join(". "),
    [copy],
  );

  function toggleSpeech() {
    if (!window.speechSynthesis) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = selectedLanguage.speech;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }

  async function acknowledgeAlert() {
    if (!["available", "failed"].includes(acknowledgement)) return;
    setAcknowledgement("submitting");
    try {
      if (!isLowConnectivity) {
        await api.acknowledgeAlert(activeAlert.id, "USR-CITIZEN");
      }

      const acknowledgedAt = new Date().toISOString();
      const nextHistory = [
        { alertId: activeAlert.id, title: copy.title, acknowledgedAt },
        ...history.filter((item) => item.alertId !== activeAlert.id),
      ];
      try {
        localStorage.setItem(historyKey, JSON.stringify(nextHistory));
        setHistory(nextHistory);
        setAcknowledgement("acknowledged");
      } catch {
        setAcknowledgement("failed");
      }
    } catch {
      setAcknowledgement("failed");
    }
  }

  const pageClasses = [
    "citizen-page",
    isLargeText && "large-text",
    isHighContrast && "high-contrast",
    isReducedMotion && "reduced-motion",
    isLowConnectivity && "low-connectivity",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main className={pageClasses}>
      <div className="page-intro">
        <div className="page-heading-row">
          <span className="section-kicker">Citizen view</span>
          <ConnectionStatus state={connectionState} />
        </div>
        <h1>Active alerts</h1>
        <p>
          One clear place to see what is happening and what action is expected.
        </p>
      </div>

      <section
        className="accessibility-toolbar"
        aria-label="Accessibility settings"
      >
        <label>
          Language
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            {languageOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="toggle-label">
          <input
            checked={isLargeText}
            onChange={() => setIsLargeText(!isLargeText)}
            type="checkbox"
          />
          Large text
        </label>
        <label className="toggle-label">
          <input
            checked={isHighContrast}
            onChange={() => setIsHighContrast(!isHighContrast)}
            type="checkbox"
          />
          High contrast
        </label>
        <label className="toggle-label">
          <input
            checked={isReducedMotion}
            onChange={() => setIsReducedMotion(!isReducedMotion)}
            type="checkbox"
          />
          Reduced motion
        </label>
        <label className="toggle-label">
          <input
            checked={isLowConnectivity}
            onChange={() => setIsLowConnectivity(!isLowConnectivity)}
            type="checkbox"
          />
          Low connectivity
        </label>
      </section>

      <article
        className="alert-preview citizen-alert"
        aria-labelledby="alert-title"
      >
        <div className="alert-preview-meta">
          <span className="severity">{activeAlert.severity} warning</span>
          <span>{activeAlert.id}</span>
        </div>
        <h2 id="alert-title">{copy.title}</h2>
        <p className="location">{activeAlert.affectedArea}</p>
        <p className="summary">{copy.summary}</p>
        <ul className="actions">
          {copy.actions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>

        <div className="visual-instructions" aria-label="Visual instructions">
          <span className="section-kicker">Remember</span>
          {activeAlert.visualInstructions.map((instruction) => (
            <div className="visual-instruction" key={instruction.icon}>
              <span aria-hidden="true" className="visual-icon">
                {instruction.icon === "evacuate" ? "!" : "+"}
              </span>
              <span>
                {language === "en"
                  ? instruction.text
                  : copy.actions[
                      activeAlert.visualInstructions.indexOf(instruction)
                    ]}
              </span>
            </div>
          ))}
        </div>

        <p className="expiry">
          Alert valid until {formatExpiry(activeAlert.expiresAt)}
        </p>

        <div className="alert-controls">
          <button
            className="secondary-control"
            onClick={toggleSpeech}
            type="button"
          >
            {isSpeaking ? "Stop listening" : copy.listenLabel}
          </button>
          <button
            className="acknowledge-button"
            disabled={["submitting", "acknowledged"].includes(acknowledgement)}
            onClick={acknowledgeAlert}
            type="button"
          >
            {acknowledgement === "available" && "I understand this alert"}
            {acknowledgement === "submitting" && "Saving acknowledgement..."}
            {acknowledgement === "acknowledged" && "Alert acknowledged"}
            {acknowledgement === "failed" && "Try acknowledgement again"}
          </button>
        </div>
        {acknowledgement === "failed" && (
          <p className="acknowledgement-error" role="alert">
            We could not save your acknowledgement on this device.
          </p>
        )}

        <details className="official-message">
          <summary>{copy.officialLabel}</summary>
          <p>{activeAlert.officialMessage}</p>
        </details>
      </article>

      <section className="history-panel" aria-labelledby="history-title">
        <div>
          <span className="section-kicker">Your record</span>
          <h2 id="history-title">Alert history</h2>
        </div>
        {history.length === 0 ? (
          <p>No acknowledged alerts yet.</p>
        ) : (
          <ul className="history-list">
            {history.map((item) => (
              <li key={item.alertId}>
                <strong>{item.title}</strong>
                <span>Acknowledged {formatExpiry(item.acknowledgedAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
