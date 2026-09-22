import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <nav className="nav">
      <Link to="/">Countries</Link>
      <Link to="/places">Places</Link>
      <span className="spacer" />
      <span className="muted">{user.displayName}</span>
      <button
        onClick={() => {
          logout();
          navigate("/login");
        }}
      >
        Log out
      </button>
    </nav>
  );
}
