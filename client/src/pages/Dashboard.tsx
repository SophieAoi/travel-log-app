import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Globe2, Plus, X, MapPinned } from "lucide-react";
import { api } from "../api/client";

interface VisitedCountry {
  id: string;
  countryCode: string;
  visitedAt: string | null;
  notes: string | null;
}

function codeToFlag(code: string) {
  if (code.length !== 2) return "🌍";
  const codePoints = code
    .toUpperCase()
    .split("")
    .map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function Dashboard() {
  const [countries, setCountries] = useState<VisitedCountry[]>([]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCountries().then((data) => {
      setCountries(data);
      setLoading(false);
    });
  }, []);

  async function addCountry(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    const created = await api.addCountry({ countryCode: code.trim().toUpperCase() });
    setCountries((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
    setCode("");
  }

  async function removeCountry(id: string) {
    await api.deleteCountry(id);
    setCountries((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>
          <Globe2 size={26} color="var(--color-accent)" /> Countries visited
        </h1>
      </div>
      <p className="page-subtitle">
        {countries.length > 0
          ? `${countries.length} ${countries.length === 1 ? "country" : "countries"} logged so far.`
          : "Log every country you've set foot in."}
      </p>

      <form onSubmit={addCountry} className="inline-form">
        <input
          placeholder="Country code (e.g. FR, JP)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={2}
        />
        <button type="submit">
          <Plus size={16} /> Add
        </button>
      </form>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : countries.length === 0 ? (
        <div className="empty-state">
          <Globe2 size={36} />
          <p>Nothing logged yet. Add the first country above.</p>
        </div>
      ) : (
        <ul className="country-grid">
          {countries.map((c, i) => (
            <li key={c.id} className="country-chip" style={{ animationDelay: `${i * 0.03}s` }}>
              <span className="flag">{codeToFlag(c.countryCode)}</span>
              <span className="code">{c.countryCode}</span>
              <button className="ghost-danger" onClick={() => removeCountry(c.id)} aria-label="Remove">
                <X size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <p style={{ marginTop: "2rem" }}>
        <Link to="/places" className="nav-link" style={{ display: "inline-flex" }}>
          <MapPinned size={16} /> View saved places →
        </Link>
      </p>
    </div>
  );
}
