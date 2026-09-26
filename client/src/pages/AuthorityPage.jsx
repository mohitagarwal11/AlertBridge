export default function AuthorityPage() {
  return (
    <main className="page-container">
      <div className="page-intro">
        <span className="section-kicker">Authority view</span>
        <h1>Alert operations</h1>
        <p>
          Create, process, send, and monitor emergency warnings from one
          workspace.
        </p>
      </div>
      <section className="empty-panel" aria-labelledby="authority-next-step">
        <span className="state-kicker">Foundation ready</span>
        <h2 id="authority-next-step">
          The authority workspace is ready for alert creation.
        </h2>
        <p>
          The create-alert workflow will be added in the next frontend
          milestone.
        </p>
      </section>
    </main>
  );
}
