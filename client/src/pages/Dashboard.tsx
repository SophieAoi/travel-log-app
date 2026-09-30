import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, X, MapPinned, Camera } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

interface VisitedCountry {
  id: string;
  countryCode: string;
  visitedAt: string | null;
  notes: string | null;
}

interface PlaceSummary {
  id: string;
  media: { id: string }[];
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
  const { user } = useAuth();
  const [countries, setCountries] = useState<VisitedCountry[]>([]);
  const [places, setPlaces] = useState<PlaceSummary[]>([]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getCountries(), api.getPlaces()]).then(([countriesData, placesData]) => {
      setCountries(countriesData);
      setPlaces(placesData);
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

  const photoCount = places.reduce((sum, p) => sum + p.media.length, 0);
  const initial = user?.displayName.trim().charAt(0).toUpperCase() ?? "?";

  return (
    <div className="page profile-page">
      <div className="profile-header">
        <span className="avatar avatar-lg">
          <span>{initial}</span>
        </span>

        <div className="profile-info">
          <h1>{user?.displayName}</h1>
          <p className="profile-bio">Collecting stamps, one trip at a time ✈️</p>

          <div className="stats-row">
            <div className="stat">
              <strong>{countries.length}</strong>
              <span>{countries.length === 1 ? "country" : "countries"}</span>
            </div>
            <Link to="/places" className="stat">
              <strong>{places.length}</strong>
              <span>{places.length === 1 ? "place" : "places"}</span>
            </Link>
            <div className="stat">
              <strong>{photoCount}</strong>
              <span>{photoCount === 1 ? "photo" : "photos"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="section-divider">
        <span>Countries visited</span>
      </div>

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
          <span className="empty-state-emoji">🌍</span>
          <p className="empty-state-title">Your map is empty</p>
          <p className="muted">Add the first country you've explored to start your collection.</p>
        </div>
      ) : (
        <ul className="country-stories">
          {countries.map((c, i) => (
            <li key={c.id} className="story-bubble" style={{ animationDelay: `${i * 0.03}s` }}>
              <span className="story-ring">
                <span className="story-flag">{codeToFlag(c.countryCode)}</span>
              </span>
              <span className="story-label">{c.countryCode}</span>
              <button className="story-remove" onClick={() => removeCountry(c.id)} aria-label="Remove">
                <X size={11} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!loading && places.length === 0 && (
        <Link to="/places" className="promo-card">
          <Camera size={20} />
          <div>
            <strong>Start your first photo album</strong>
            <span>Save a place and drop in your favorite shots.</span>
          </div>
          <span className="promo-arrow">
            <MapPinned size={16} />
          </span>
        </Link>
      )}
    </div>
  );
}
