import { demoAlert } from "../data/demoAlerts";

export default function CitizenPage() {
  return (
    <main className="page-container">
      <div className="page-intro">
        <span className="section-kicker">Citizen view</span>
        <h1>Active alerts</h1>
        <p>
          One clear place to see what is happening and what action is expected.
        </p>
      </div>
      <article className="alert-preview" aria-labelledby="alert-title">
        <div className="alert-preview-meta">
          <span className="severity">{demoAlert.severity} warning</span>
          <span>{demoAlert.id}</span>
        </div>
        <h2 id="alert-title">{demoAlert.simplified.title}</h2>
        <p className="location">{demoAlert.affectedArea}</p>
        <p className="summary">{demoAlert.simplified.summary}</p>
        <ul className="actions">
          {demoAlert.simplified.actions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
        <details className="official-message">
          <summary>View official message</summary>
          <p>{demoAlert.officialMessage}</p>
        </details>
      </article>
    </main>
  );
}
