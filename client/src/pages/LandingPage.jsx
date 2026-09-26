import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <main className="landing-page">
      <section className="landing-copy">
        <span className="section-kicker">
          Emergency communication, made clear
        </span>
        <h1>Understand the warning. Know the next move.</h1>
        <p>
          AlertBridge keeps official emergency messages intact while making them
          easier to access, understand, and acknowledge.
        </p>
        <div className="landing-actions">
          <Link className="primary-action" to="/citizen">
            Open citizen view
          </Link>
          <Link className="secondary-action" to="/authority">
            Open authority view
          </Link>
        </div>
      </section>
      <aside className="landing-note" aria-label="Prototype status">
        <span>Now in build</span>
        <strong>Foundation milestone</strong>
        <p>
          Shared shell, navigation, mock data, and API boundary are ready for
          feature work.
        </p>
      </aside>
    </main>
  );
}
