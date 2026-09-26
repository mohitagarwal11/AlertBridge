import { useEffect, useMemo, useState } from "react";
import { demoAlert } from "../data/demoAlerts";

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
  const [language, setLanguage] = useState("en");
  const [isLargeText, setIsLargeText] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isLowConnectivity, setIsLowConnectivity] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [acknowledgement, setAcknowledgement] = useState("available");
  const [history, setHistory] = useState([]);
  const copy = demoAlert.translations[language] || demoAlert.translations.en;
  const selectedLanguage = languageOptions.find(
    (item) => item.code === language,
  );

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

  function acknowledgeAlert() {
    if (!["available", "failed"].includes(acknowledgement)) return;
    setAcknowledgement("submitting");
    window.setTimeout(() => {
      const acknowledgedAt = new Date().toISOString();
      const nextHistory = [
        { alertId: demoAlert.id, title: copy.title, acknowledgedAt },
        ...history.filter((item) => item.alertId !== demoAlert.id),
      ];
      try {
        localStorage.setItem(historyKey, JSON.stringify(nextHistory));
        setHistory(nextHistory);
        setAcknowledgement("acknowledged");
      } catch {
        setAcknowledgement("failed");
      }
    }, 350);
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
        <span className="section-kicker">Citizen view</span>
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
          <span className="severity">{demoAlert.severity} warning</span>
          <span>{demoAlert.id}</span>
        </div>
        <h2 id="alert-title">{copy.title}</h2>
        <p className="location">{demoAlert.affectedArea}</p>
        <p className="summary">{copy.summary}</p>
        <ul className="actions">
          {copy.actions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>

        <div className="visual-instructions" aria-label="Visual instructions">
          <span className="section-kicker">Remember</span>
          {demoAlert.visualInstructions.map((instruction) => (
            <div className="visual-instruction" key={instruction.icon}>
              <span aria-hidden="true" className="visual-icon">
                {instruction.icon === "evacuate" ? "!" : "+"}
              </span>
              <span>
                {language === "en"
                  ? instruction.text
                  : copy.actions[
                      demoAlert.visualInstructions.indexOf(instruction)
                    ]}
              </span>
            </div>
          ))}
        </div>

        <p className="expiry">
          Alert valid until {formatExpiry(demoAlert.expiresAt)}
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
          <p>{demoAlert.officialMessage}</p>
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
