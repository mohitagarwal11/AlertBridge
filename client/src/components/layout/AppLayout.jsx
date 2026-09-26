import { NavLink, Outlet } from "react-router-dom";

const navigation = [
  { label: "Citizen", to: "/citizen" },
  { label: "Authority", to: "/authority" },
];

export default function AppLayout() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <NavLink className="brand" to="/">
          <span className="brand-mark" aria-hidden="true">
            AB
          </span>
          <span>
            <strong>AlertBridge</strong>
            <small>Clear warnings. Safer action.</small>
          </span>
        </NavLink>
        <nav aria-label="Primary navigation" className="primary-nav">
          {navigation.map((item) => (
            <NavLink
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <Outlet />
      <footer className="site-footer">
        <span>Prototype / Ideathon MVP</span>
        <span>Official messages remain unchanged.</span>
      </footer>
    </div>
  );
}
