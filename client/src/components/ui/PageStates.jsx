export function LoadingState({ label = "Loading AlertBridge" }) {
  return (
    <main className="page-state" aria-live="polite">
      <span className="state-kicker">Please wait</span>
      <h1>{label}</h1>
    </main>
  );
}

export function ErrorState({ message = "Something went wrong." }) {
  return (
    <main className="page-state page-state-error" role="alert">
      <span className="state-kicker">Unable to continue</span>
      <h1>{message}</h1>
      <p>Try again shortly or return to the AlertBridge home screen.</p>
    </main>
  );
}
