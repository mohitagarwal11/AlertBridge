import { useEffect, useMemo, useRef, useState } from "react";
import ConnectionStatus from "../components/ui/ConnectionStatus";
import { demoAlert } from "../data/demoAlerts";
import { useAlertSocket } from "../hooks/useAlertSocket";
import { api } from "../services/api";

const languageOptions = [
  {
    code: "en",
    label: "English",
    speech: "en-IN",
    listenLabel: "Listen to alert",
    stopLabel: "Stop listening",
    acknowledgeLabel: "I understand this alert",
    acknowledgingLabel: "Saving acknowledgement...",
    acknowledgedLabel: "Alert acknowledged",
    retryLabel: "Try acknowledgement again",
  },
  {
    code: "hi",
    label: "हिन्दी",
    speech: "hi-IN",
    listenLabel: "अलर्ट सुनें",
    stopLabel: "सुनना बंद करें",
    acknowledgeLabel: "मैंने अलर्ट समझ लिया",
    acknowledgingLabel: "स्वीकृति सहेजी जा रही है...",
    acknowledgedLabel: "अलर्ट स्वीकार किया गया",
    retryLabel: "फिर से प्रयास करें",
  },
  {
    code: "or",
    label: "ଓଡ଼ିଆ",
    speech: "or-IN",
    listenLabel: "ଆଲର୍ଟ ଶୁଣନ୍ତୁ",
    stopLabel: "ଶୁଣିବା ବନ୍ଦ କରନ୍ତୁ",
    acknowledgeLabel: "ମୁଁ ଏହି ଆଲର୍ଟ ବୁଝିଲି",
    acknowledgingLabel: "ସ୍ୱୀକୃତି ସଞ୍ଚୟ ହେଉଛି...",
    acknowledgedLabel: "ଆଲର୍ଟ ସ୍ୱୀକୃତ",
    retryLabel: "ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ",
  },
];

const historyKey = "alertbridge.citizen.history";

const defaultCopy = {
  title: "EMERGENCY ALERT",
  summary: "Follow the instructions from local authorities.",
  actions: [],
  officialLabel: "Official message",
  listenLabel: "Listen to alert",
};

function withTimeout(promise, timeoutMs) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(
      () => reject(new Error("The request timed out.")),
      timeoutMs,
    );
  });

  return Promise.race([promise, timeout]).finally(() => {
    window.clearTimeout(timeoutId);
  });
}

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
  const [speechVoices, setSpeechVoices] = useState([]);
  const [speechError, setSpeechError] = useState("");
  const [speechNotice, setSpeechNotice] = useState("");
  const [acknowledgement, setAcknowledgement] = useState("available");
  const [history, setHistory] = useState([]);
  const [alertAnnouncement, setAlertAnnouncement] = useState("");
  const viewedAlertIds = useRef(new Set());
  const translation =
    activeAlert.translations?.[language] || activeAlert.translations?.en;
  const copy = {
    ...defaultCopy,
    ...(activeAlert.simplified || {}),
    ...(translation || {}),
    actions: translation?.actions || activeAlert.simplified?.actions || [],
  };
  const selectedLanguage = languageOptions.find(
    (item) => item.code === language,
  );
  const connectionState = useAlertSocket({
    "alert:received": (payload) => {
      const incomingAlert = payload?.alert || payload;
      if (incomingAlert?.id) {
        setActiveAlert(incomingAlert);
        setAcknowledgement("available");
        setAlertAnnouncement("A new emergency alert has arrived.");
      }
    },
    "alert:sent": (payload) => {
      const incomingAlert = payload?.alert || payload;
      if (incomingAlert?.id) {
        setActiveAlert(incomingAlert);
        setAcknowledgement("available");
        setAlertAnnouncement("A new emergency alert has arrived.");
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
    const speechSynthesis = window.speechSynthesis;
    if (!speechSynthesis) return undefined;

    const updateVoices = () =>
      setSpeechVoices(speechSynthesis.getVoices?.() || []);
    updateVoices();
    speechSynthesis.addEventListener?.("voiceschanged", updateVoices);

    return () => {
      speechSynthesis.removeEventListener?.("voiceschanged", updateVoices);
    };
  }, []);

  useEffect(() => {
    if (isLowConnectivity) return;

    let cancelled = false;
    api
      .listAlerts("active")
      .then((alerts) => {
        if (cancelled || alerts.length === 0) return;
        setActiveAlert(alerts[0]);
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
    if (!window.speechSynthesis) {
      setSpeechError("Audio playback is not available in this browser.");
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeechError("");
      setSpeechNotice("");
      return;
    }

    setSpeechError("");
    const languagePrefix = selectedLanguage.speech.slice(0, 2).toLowerCase();
    const voice =
      speechVoices.find((item) =>
        item.lang.toLowerCase().startsWith(languagePrefix),
      ) ||
      speechVoices.find((item) => item.lang.toLowerCase().startsWith("hi")) ||
      speechVoices.find((item) => item.lang.toLowerCase().startsWith("en"));
    const fallbackLanguage =
      selectedLanguage.code === "or" ? "hi-IN" : selectedLanguage.speech;
    const hasNativeVoice = voice?.lang
      ?.toLowerCase()
      .startsWith(languagePrefix);
    const spokenText =
      selectedLanguage.code === "or" && !hasNativeVoice
        ? copy.speechFallback || speechText
        : speechText;
    setSpeechNotice(
      selectedLanguage.code === "or" && !hasNativeVoice
        ? "No Odia voice is installed; using an audio-compatible fallback."
        : "",
    );
    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = voice?.lang || fallbackLanguage;
    if (voice) utterance.voice = voice;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeechError("Audio playback failed. Try again or use the text alert.");
    };
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }

  async function acknowledgeAlert() {
    if (!["available", "failed"].includes(acknowledgement)) return;
    setAcknowledgement("submitting");
    try {
      if (!isLowConnectivity) {
        await withTimeout(
          api.acknowledgeAlert(activeAlert.id, "USR-CITIZEN"),
          8000,
        );
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
    <main className={pageClasses} id="main-content">
      <div className="page-intro">
        <div className="page-heading-row">
          <span className="section-kicker">Citizen view</span>
          <ConnectionStatus state={connectionState} />
        </div>
        <h1>Active alerts</h1>
        <p>Read what happened, then follow the steps below.</p>
      </div>
      <p aria-live="assertive" className="sr-only">
        {alertAnnouncement}
      </p>

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
        aria-live="polite"
      >
        <div className="alert-preview-meta">
          <span className="severity">{activeAlert.severity} warning</span>
          <span>{activeAlert.id}</span>
        </div>
        <p className="section-label">What is happening</p>
        <h2 id="alert-title">{copy.title}</h2>
        <p className="location">{activeAlert.affectedArea}</p>
        <p className="summary">{copy.summary}</p>
        <section aria-labelledby="action-title" className="action-section">
          <p className="section-label" id="action-title">
            What to do now
          </p>
          <ul className="actions">
            {copy.actions.map((action, index) => (
              <li key={action}>
                <span aria-hidden="true" className="action-number">
                  {index + 1}
                </span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="visual-instructions" aria-labelledby="visual-title">
          <span className="section-label" id="visual-title">
            Quick visual actions
          </span>
          {(activeAlert.visualInstructions || []).map((instruction) => (
            <div className="visual-instruction" key={instruction.icon}>
              <span aria-hidden="true" className="visual-icon">
                {instruction.icon === "evacuate" ? "!" : "+"}
              </span>
              <span>
                {language === "en"
                  ? instruction.text
                  : copy.actions[
                      (activeAlert.visualInstructions || []).indexOf(
                        instruction,
                      )
                    ]}
              </span>
            </div>
          ))}
        </div>
        {speechError && (
          <p className="acknowledgement-error" role="alert">
            {speechError}
          </p>
        )}
        {speechNotice && <p className="speech-notice">{speechNotice}</p>}

        <p className="expiry">
          Alert valid until {formatExpiry(activeAlert.expiresAt)}
        </p>

        <div className="alert-controls">
          <button
            aria-pressed={isSpeaking}
            className="secondary-control"
            onClick={toggleSpeech}
            type="button"
          >
            <span aria-hidden="true" className="speaker-icon">
              🔊
            </span>
            {isSpeaking
              ? selectedLanguage.stopLabel
              : selectedLanguage.listenLabel}
          </button>
          <button
            aria-busy={acknowledgement === "submitting"}
            className="acknowledge-button"
            disabled={["submitting", "acknowledged"].includes(acknowledgement)}
            onClick={acknowledgeAlert}
            type="button"
          >
            {acknowledgement === "available" &&
              selectedLanguage.acknowledgeLabel}
            {acknowledgement === "submitting" &&
              selectedLanguage.acknowledgingLabel}
            {acknowledgement === "acknowledged" &&
              selectedLanguage.acknowledgedLabel}
            {acknowledgement === "failed" && selectedLanguage.retryLabel}
          </button>
        </div>
        {acknowledgement === "failed" && (
          <p className="acknowledgement-error" role="alert">
            We could not save your acknowledgement on this device.
          </p>
        )}
        <p aria-live="polite" className="sr-only">
          {acknowledgement === "submitting" && "Saving your acknowledgement."}
          {acknowledgement === "acknowledged" && "Alert acknowledged."}
        </p>

        <details className="official-message">
          <summary>Read {copy.officialLabel.toLowerCase()}</summary>
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
