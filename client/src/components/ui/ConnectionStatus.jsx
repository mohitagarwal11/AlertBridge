export default function ConnectionStatus({ state }) {
  const labels = {
    connected: "Live updates connected",
    disconnected: "Live updates unavailable; retrying",
    connecting: "Connecting to live updates",
  };

  return (
    <div
      className={`connection-status ${state}`}
      role="status"
      aria-live="polite"
    >
      <span aria-hidden="true" className="connection-dot" />
      {labels[state]}
    </div>
  );
}
