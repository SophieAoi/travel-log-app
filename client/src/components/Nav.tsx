import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Globe2, MapPinned, LayoutGrid, Settings, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Logo } from "./Logo";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";

export function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const initial = user.displayName.trim().charAt(0).toUpperCase();

  return (
    <nav className="sidebar">
      <Link to="/" className="sidebar-logo" title="Globi">
        <Logo withWordmark={false} />
      </Link>

      <div className="sidebar-links">
        <Link
          to="/"
          className={`sidebar-link ${location.pathname === "/" ? "active" : ""}`}
          title="Profile"
        >
          <Home size={22} />
        </Link>
        <Link
          to="/countries"
          className={`sidebar-link ${location.pathname.startsWith("/countries") ? "active" : ""}`}
          title="Countries"
        >
          <Globe2 size={22} />
        </Link>
        <Link
          to="/places"
          className={`sidebar-link ${location.pathname.startsWith("/places") ? "active" : ""}`}
          title="Places"
        >
          <MapPinned size={22} />
        </Link>
        <Link
          to="/boards"
          className={`sidebar-link ${location.pathname.startsWith("/boards") ? "active" : ""}`}
          title="Boards"
        >
          <LayoutGrid size={22} />
        </Link>
      </div>

      <div className="sidebar-bottom">
        <Link
          to="/settings"
          className={`sidebar-link ${location.pathname === "/settings" ? "active" : ""}`}
          title="Settings"
        >
          <Settings size={20} />
        </Link>
        <button className="sidebar-link" onClick={() => navigate("/")} title={user.displayName}>
          <span className="avatar">
            {user.avatarUrl ? <img src={`${API_BASE}${user.avatarUrl}`} alt="" /> : <span>{initial}</span>}
          </span>
        </button>
        <button
          className="sidebar-link"
          title="Log out"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
}
