import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <Logo />
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="subtitle">Log in to pick up your travel log where you left off.</p>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <div className="input-wrap">
              <Mail size={16} />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="input-wrap">
              <Lock size={16} />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="full-width" disabled={submitting}>
            <LogIn size={16} /> {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>
        <p className="switch-link">
          No account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
