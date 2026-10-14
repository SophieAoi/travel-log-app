import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, X, MapPinned, Camera, Map as MapIcon, Pencil, Check } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { CountrySelect } from "../components/CountrySelect";
import { FlagImage } from "../components/FlagImage";
import { WorldMap } from "../components/WorldMap";

const BIO_MAX = 160;

interface VisitedCountry {
  id: string;
  countryCode: string;
  visitedAt: string | null;
  notes: string | null;
}

interface PlaceSummary {
  id: string;
  name: string;
  countryCode: string;
  latitude: number | null;
  longitude: number | null;
  media: { id: string }[];
}

export function Dashboard() {
  const { user, updateProfile } = useAuth();
  const [countries, setCountries] = useState<VisitedCountry[]>([]);
  const [places, setPlaces] = useState<PlaceSummary[]>([]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [savingBio, setSavingBio] = useState(false);

  useEffect(() => {
    Promise.all([api.getCountries(), api.getPlaces()]).then(([countriesData, placesData]) => {
      setCountries(countriesData);
      setPlaces(placesData);
      setLoading(false);
    });
  }, []);

  async function addCountry(e: React.FormEvent) {
    e.preventDefault();
    if (!code) return;
    const created = await api.addCountry({ countryCode: code });
    setCountries((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
    setCode("");
  }

  async function removeCountry(id: string) {
    await api.deleteCountry(id);
    setCountries((prev) => prev.filter((c) => c.id !== id));
  }

  function startEditingBio() {
    setBioDraft(user?.bio ?? "");
    setEditingBio(true);
  }

  async function saveBio() {
    setSavingBio(true);
    try {
      await updateProfile({ bio: bioDraft.trim() });
      setEditingBio(false);
    } finally {
      setSavingBio(false);
    }
  }

  const photoCount = places.reduce((sum, p) => sum + p.media.length, 0);
  const initial = user?.displayName.trim().charAt(0).toUpperCase() ?? "?";
  const mappedPlaces = places.filter(
    (p): p is PlaceSummary & { latitude: number; longitude: number } => p.latitude != null && p.longitude != null
  );

  return (
    <div className="page profile-page">
      <div className="profile-header">
        <span className="avatar avatar-lg">
          <span>{initial}</span>
        </span>

        <div className="profile-info">
          <h1>{user?.displayName}</h1>

          {editingBio ? (
            <div className="bio-edit-row">
              <textarea
                className="bio-edit-input"
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value.slice(0, BIO_MAX))}
                placeholder="Tell people a bit about your travels..."
                rows={2}
                autoFocus
              />
              <div className="bio-edit-actions">
                <span className="bio-char-count">
                  {bioDraft.length}/{BIO_MAX}
                </span>
                <button
                  className="icon-only-button secondary"
                  onClick={() => setEditingBio(false)}
                  type="button"
                  aria-label="Cancel"
                >
                  <X size={14} />
                </button>
                <button
                  className="icon-only-button"
                  onClick={saveBio}
                  disabled={savingBio}
                  type="button"
                  aria-label="Save bio"
                >
                  <Check size={14} />
                </button>
              </div>
            </div>
          ) : (
            <button className="profile-bio-button" onClick={startEditingBio} type="button">
              <span className="profile-bio">{user?.bio || "Add a short bio..."}</span>
              <Pencil size={12} className="profile-bio-edit-icon" />
            </button>
          )}

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

      {mappedPlaces.length > 0 && (
        <>
          <div className="section-divider">
            <span>
              <MapIcon size={13} style={{ verticalAlign: "-2px", marginRight: "0.3rem" }} />
              Your map
            </span>
          </div>
          <WorldMap places={mappedPlaces} />
        </>
      )}

      <div className="section-divider">
        <span>Countries visited</span>
      </div>

      <form onSubmit={addCountry} className="inline-form">
        <CountrySelect value={code} onChange={setCode} placeholder="Add a country you've visited" />
        <button type="submit" disabled={!code}>
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
              <Link to={`/countries/${c.countryCode}`} className="story-link">
                <span className="story-ring">
                  <span className="story-flag">
                    <FlagImage code={c.countryCode} />
                  </span>
                </span>
                <span className="story-label">{c.countryCode}</span>
              </Link>
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
