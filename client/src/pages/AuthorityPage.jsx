import { useEffect, useMemo, useState } from "react";
import ConnectionStatus from "../components/ui/ConnectionStatus";
import { demoAlert, demoAlerts } from "../data/demoAlerts";
import { useAlertSocket } from "../hooks/useAlertSocket";
import { api } from "../services/api";

const initialForm = {
  officialMessage: demoAlert.officialMessage,
  type: demoAlert.type,
  severity: demoAlert.severity,
  affectedArea: demoAlert.affectedArea,
  languages: ["en", "or"],
};

const languageOptions = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "or", label: "Odia" },
];

const initialStatistics = {
  recipients: 10000,
  delivered: 9640,
  viewed: 8920,
  acknowledged: 7840,
};

function createGeneratedContent(form) {
  const firstSentence = form.officialMessage.split(/[.!?]/)[0].trim();
  return {
    title: `${form.type.toUpperCase()} WARNING`,
    summary: firstSentence || "Follow the emergency instructions below.",
    actions: [
      `Move away from ${form.affectedArea}`,
      "Follow instructions from local authorities",
      "Keep your phone charged",
    ],
  };
}

function validateForm(form) {
  const errors = {};
  if (form.officialMessage.trim().length < 20) {
    errors.officialMessage = "Enter the complete official message.";
  }
  if (!form.affectedArea.trim())
    errors.affectedArea = "Enter an affected area.";
  if (form.languages.length === 0)
    errors.languages = "Select at least one language.";
  return errors;
}

export default function AuthorityPage() {
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [processedAlert, setProcessedAlert] = useState(null);
  const [alertStatus, setAlertStatus] = useState("draft");
  const [sendState, setSendState] = useState("idle");
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveError, setLiveError] = useState("");
  const [statistics, setStatistics] = useState(initialStatistics);
  const [history, setHistory] = useState(demoAlerts);

  useEffect(() => {
    api
      .listAlerts()
      .then((alerts) => {
        if (alerts.length > 0) setHistory(alerts);
      })
      .catch(() => {
        // Keep seeded demo history when the API is unavailable.
      });
  }, []);

  useEffect(() => {
    const alertId = history[0]?.id;
    if (!alertId) return;

    api
      .getStatistics(alertId)
      .then((nextStatistics) => {
        setStatistics((current) => ({ ...current, ...nextStatistics }));
      })
      .catch(() => {
        // Keep local demo statistics until the backend is available.
      });
  }, [history]);

  const connectionState = useAlertSocket({
    "alert:sent": (payload) => {
      if (processedAlert && payload?.alertId !== processedAlert.id) return;
      setAlertStatus("sent");
    },
    "alert:viewed": (payload) => {
      if (processedAlert && payload?.alertId !== processedAlert.id) return;
      const incomingStatistics = payload?.statistics || payload;
      setStatistics((current) =>
        typeof incomingStatistics?.viewed === "number"
          ? { ...current, ...incomingStatistics }
          : { ...current, viewed: current.viewed + 1 },
      );
    },
    "alert:acknowledged": (payload) => {
      if (processedAlert && payload?.alertId !== processedAlert.id) return;
      const incomingStatistics = payload?.statistics || payload;
      setStatistics((current) =>
        typeof incomingStatistics?.acknowledged === "number"
          ? { ...current, ...incomingStatistics }
          : { ...current, acknowledged: current.acknowledged + 1 },
      );
    },
  });

  const acknowledgementRate = useMemo(
    () =>
      Math.round((statistics.acknowledged / statistics.recipients) * 1000) / 10,
    [statistics],
  );

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({ ...current, [field]: undefined }));
  }

  function toggleLanguage(code) {
    const languages = form.languages.includes(code)
      ? form.languages.filter((item) => item !== code)
      : [...form.languages, code];
    updateForm("languages", languages);
  }

  async function processAlert(event) {
    event.preventDefault();
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsProcessing(true);
    setLiveError("");

    try {
      const created = await api.createAlert({
        type: form.type,
        severity: form.severity,
        affectedArea: form.affectedArea.trim(),
        officialMessage: form.officialMessage.trim(),
        languages: form.languages,
      });
      const processed = await api.processAlert(created.id);
      setProcessedAlert(processed);
      setAlertStatus("processed");
      setSendState("idle");
    } catch {
      const generated = createGeneratedContent(form);
      setProcessedAlert({
        ...demoAlert,
        id: `ALR-${String(history.length + 1).padStart(3, "0")}`,
        type: form.type,
        severity: form.severity,
        affectedArea: form.affectedArea.trim(),
        officialMessage: form.officialMessage.trim(),
        simplified: generated,
        status: "processed",
      });
      setAlertStatus("processed");
      setSendState("idle");
      setLiveError("Backend unavailable. Showing a local preview.");
    } finally {
      setIsProcessing(false);
    }
  }

  function sendAlert() {
    if (!processedAlert || alertStatus === "sent") return;
    setSendState("confirming");
  }

  async function confirmSend() {
    setSendState("sending");
    try {
      if (!processedAlert) throw new Error("No processed alert is available.");
      const sentAlert = await api.sendAlert(processedAlert.id);
      setProcessedAlert(sentAlert);
      setAlertStatus("sent");
      setSendState("sent");
      setHistory((current) => [
        sentAlert,
        ...current.filter((alert) => alert.id !== sentAlert.id),
      ]);
      const nextStatistics = await api.getStatistics(sentAlert.id);
      setStatistics((current) => ({ ...current, ...nextStatistics }));
    } catch {
      setSendState("error");
      setLiveError("The alert could not be sent by the backend.");
    }
  }

  return (
    <main className="authority-page page-container">
      <div className="page-intro authority-intro">
        <div className="page-heading-row">
          <span className="section-kicker">Authority view</span>
          <ConnectionStatus state={connectionState} />
        </div>
        <h1>Alert operations</h1>
        <p>
          Create, review, send, and monitor emergency warnings from one
          workspace.
        </p>
      </div>

      <section className="authority-dashboard" aria-label="Alert dashboard">
        <div>
          <span className="state-kicker">Live overview</span>
          <h2>Current delivery</h2>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <span>Recipients</span>
            <strong>{statistics.recipients.toLocaleString()}</strong>
          </div>
          <div className="stat-card">
            <span>Delivered</span>
            <strong>{statistics.delivered.toLocaleString()}</strong>
          </div>
          <div className="stat-card">
            <span>Viewed</span>
            <strong>{statistics.viewed.toLocaleString()}</strong>
          </div>
          <div className="stat-card">
            <span>Acknowledged</span>
            <strong>{statistics.acknowledged.toLocaleString()}</strong>
          </div>
        </div>
        <div className="rate-row">
          <span>Acknowledgement rate</span>
          <strong>{acknowledgementRate}%</strong>
        </div>
        <div
          className="rate-bar"
          aria-label={`${acknowledgementRate}% acknowledged`}
        >
          <span style={{ width: `${acknowledgementRate}%` }} />
        </div>
      </section>

      <div className="authority-workspace">
        <section
          className="authority-form-panel"
          aria-labelledby="create-alert-title"
        >
          <div className="panel-heading">
            <span className="section-kicker">Create alert</span>
            <h2 id="create-alert-title">Start with the official warning</h2>
          </div>
          <form onSubmit={processAlert} noValidate>
            <label className="form-field form-field-wide">
              Official message
              <textarea
                aria-describedby={
                  formErrors.officialMessage
                    ? "official-message-error"
                    : undefined
                }
                aria-invalid={Boolean(formErrors.officialMessage)}
                onChange={(event) =>
                  updateForm("officialMessage", event.target.value)
                }
                rows="5"
                value={form.officialMessage}
              />
              {formErrors.officialMessage && (
                <span className="field-error" id="official-message-error">
                  {formErrors.officialMessage}
                </span>
              )}
            </label>
            <div className="form-grid">
              <label className="form-field">
                Emergency type
                <select
                  value={form.type}
                  onChange={(event) => updateForm("type", event.target.value)}
                >
                  <option value="cyclone">Cyclone</option>
                  <option value="flood">Flood</option>
                  <option value="fire">Fire</option>
                  <option value="earthquake">Earthquake</option>
                </select>
              </label>
              <label className="form-field">
                Severity
                <select
                  value={form.severity}
                  onChange={(event) =>
                    updateForm("severity", event.target.value)
                  }
                >
                  <option value="advisory">Advisory</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
              </label>
            </div>
            <label className="form-field form-field-wide">
              Affected area
              <input
                aria-describedby={
                  formErrors.affectedArea ? "area-error" : undefined
                }
                aria-invalid={Boolean(formErrors.affectedArea)}
                onChange={(event) =>
                  updateForm("affectedArea", event.target.value)
                }
                value={form.affectedArea}
              />
              {formErrors.affectedArea && (
                <span className="field-error" id="area-error">
                  {formErrors.affectedArea}
                </span>
              )}
            </label>
            <fieldset className="language-fieldset">
              <legend>Delivery languages</legend>
              <div className="language-options">
                {languageOptions.map((option) => (
                  <label className="check-option" key={option.code}>
                    <input
                      checked={form.languages.includes(option.code)}
                      onChange={() => toggleLanguage(option.code)}
                      type="checkbox"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              {formErrors.languages && (
                <span className="field-error">{formErrors.languages}</span>
              )}
            </fieldset>
            <button className="primary-action form-submit" type="submit">
              {isProcessing
                ? "Processing alert..."
                : "Process alert for preview"}
            </button>
            {liveError && (
              <p className="send-error" role="alert">
                {liveError}
              </p>
            )}
          </form>
        </section>

        <section className="preview-panel" aria-labelledby="preview-title">
          <div className="panel-heading">
            <span className="section-kicker">Review before sending</span>
            <h2 id="preview-title">Accessible representation</h2>
          </div>
          {!processedAlert ? (
            <div className="preview-empty">
              <span className="state-kicker">Waiting for input</span>
              <p>Complete the form to generate a reviewable representation.</p>
            </div>
          ) : (
            <>
              <div className="preview-status">
                {alertStatus === "sent"
                  ? "Sent to recipients"
                  : "Ready for review"}
              </div>
              <div className="official-preview">
                <span className="preview-label">
                  Official message / unchanged
                </span>
                <p>{processedAlert.officialMessage}</p>
              </div>
              <div className="generated-preview">
                <span className="preview-label">Generated representation</span>
                <h3>{processedAlert.simplified.title}</h3>
                <p>{processedAlert.simplified.summary}</p>
                <ul className="preview-actions">
                  {processedAlert.simplified.actions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
              </div>
              {sendState === "confirming" && (
                <div className="send-confirmation" role="alert">
                  <strong>Send this warning to recipients?</strong>
                  <p>This starts delivery tracking for the selected alert.</p>
                  <div className="confirmation-actions">
                    <button
                      className="primary-action"
                      onClick={confirmSend}
                      type="button"
                    >
                      Confirm send
                    </button>
                    <button
                      className="secondary-control"
                      onClick={() => setSendState("idle")}
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {sendState === "sent" && (
                <p className="success-message" role="status">
                  Alert sent. Delivery monitoring is active.
                </p>
              )}
              {sendState === "error" && (
                <p className="send-error" role="alert">
                  The alert could not be sent. Review the alert and try again.
                </p>
              )}
              <button
                className="send-button"
                disabled={alertStatus === "sent" || sendState === "sending"}
                onClick={sendAlert}
                type="button"
              >
                {sendState === "sending"
                  ? "Sending alert..."
                  : alertStatus === "sent"
                    ? "Alert sent"
                    : sendState === "error"
                      ? "Retry send"
                      : "Send alert"}
              </button>
            </>
          )}
        </section>
      </div>

      <section
        className="authority-history"
        aria-labelledby="authority-history-title"
      >
        <div className="panel-heading">
          <span className="section-kicker">Recent activity</span>
          <h2 id="authority-history-title">Alert history</h2>
        </div>
        <div className="authority-history-list">
          {history.map((alert) => (
            <div className="authority-history-item" key={alert.id}>
              <span className={`history-status ${alert.status}`}>
                {alert.status}
              </span>
              <strong>{alert.simplified.title}</strong>
              <span>{alert.affectedArea}</span>
              <span>{alert.id}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
