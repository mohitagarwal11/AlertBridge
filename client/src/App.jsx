const demoAlert = {
  id: "ALR-001",
  type: "cyclone",
  severity: "critical",
  affectedArea: "Coastal Odisha",
  officialMessage:
    "Due to the severe cyclonic storm expected to make landfall, residents in low-lying coastal areas are advised to evacuate to designated shelters.",
  simplified: {
    title: "CYCLONE APPROACHING",
    summary: "Move to a safe location immediately.",
    actions: [
      "Leave low-lying areas",
      "Go to a safe shelter",
      "Stay away from the sea",
    ],
  },
};

export default function App() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <p className="eyebrow">AlertBridge prototype</p>
        <span className="status">Demo alert</span>
      </header>

      <section className="alert-panel" aria-labelledby="alert-title">
        <div className="alert-heading">
          <div>
            <p className="severity">Critical warning</p>
            <h1 id="alert-title">{demoAlert.simplified.title}</h1>
            <p className="location">{demoAlert.affectedArea}</p>
          </div>
          <span className="alert-id">{demoAlert.id}</span>
        </div>

        <p className="summary">{demoAlert.simplified.summary}</p>
        <ul className="actions">
          {demoAlert.simplified.actions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>

        <button type="button" className="acknowledge-button">
          I understand this alert
        </button>
      </section>

      <details className="official-message">
        <summary>View official message</summary>
        <p>{demoAlert.officialMessage}</p>
      </details>
    </main>
  );
}
