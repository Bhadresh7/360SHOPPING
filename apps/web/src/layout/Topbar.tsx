import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

interface TopbarProps {
  onOpenSearch: () => void;
}

export function Topbar({ onOpenSearch }: TopbarProps) {
  const navigate = useNavigate();
  const { theme, setTheme, user, cart, notificationsUnread, setCartDrawerOpen, logout } = useApp();

  return (
    <header className="topbar">
      <div>
        <h1>360Shopie</h1>
        <small>AI Commerce Operating System</small>
      </div>
      <div className="topbar-actions">
        <button type="button" className="icon-btn" onClick={onOpenSearch} title="Search (Ctrl/Cmd+K)">
          ⌘K
        </button>
        <button type="button" className="icon-btn" onClick={() => navigate("/view-notifications")}>
          🔔
          {notificationsUnread > 0 ? <span className="dot-badge">{notificationsUnread}</span> : null}
        </button>
        <button type="button" className="icon-btn" onClick={() => setCartDrawerOpen(true)}>
          🛒
          {cart?.summary.count ? <span className="dot-badge">{cart.summary.count}</span> : null}
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "☀" : "🌙"}
        </button>
        <button type="button" className="user-pill" onClick={() => navigate("/view-settings")}> 
          <span>👤</span>
          <strong>{user?.name.split(" ")[0] ?? "Guest"}</strong>
        </button>
        <button type="button" className="icon-btn" onClick={logout}>
          ⎋
        </button>
      </div>
    </header>
  );
}