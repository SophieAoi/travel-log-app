import { Link, useLocation, useNavigate } from "react-router-dom";
import { Globe2, MapPinned, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Logo } from "./Logo";

export function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const initial = user.displayName.trim().charAt(0).toUpperCase();

  return (
    <nav className="nav">
      <Link to="/" className="logo">
        <Logo />
      </Link>

      <div className="nav-links">
        <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>
          <Globe2 size={16} /> Countries
        </Link>
        <Link to="/places" className={`nav-link ${location.pathname.startsWith("/places") ? "active" : ""}`}>
          <MapPinned size={16} /> Places
        </Link>
      </div>

      <span className="spacer" />

      <div className="nav-user">
        <span className="avatar">
          <span>{initial}</span>
        </span>
        <span className="muted">{user.displayName}</span>
        <button
          className="icon-button"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          <LogOut size={16} /> Log out
        </button>
      </div>
    </nav>
  );
}
