import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, X, Globe2, Map as MapIcon } from "lucide-react";
import { api } from "../api/client";
import { CountrySelect } from "../components/CountrySelect";
import { FlagImage } from "../components/FlagImage";
import { WorldMap } from "../components/WorldMap";

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

export function Countries() {
  const [countries, setCountries] = useState<VisitedCountry[]>([]);
  const [places, setPlaces] = useState<PlaceSummary[]>([]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getCountries(), api.getPlaces()])
      .then(([countriesData, placesData]) => {
        setCountries(countriesData);
        setPlaces(placesData);
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : "Failed to load your data");
      })
      .finally(() => setLoading(false));
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

  const mappedPlaces = places.filter(
    (p): p is PlaceSummary & { latitude: number; longitude: number } => p.latitude != null && p.longitude != null
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1>
          <Globe2 size={26} color="var(--color-accent)" /> Countries
        </h1>
      </div>
      <p className="page-subtitle">Every country you've set foot in, and where your photos were taken.</p>

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
      ) : loadError ? (
        <div className="empty-state">
          <p className="empty-state-title">Couldn't load your countries</p>
          <p className="muted">{loadError}</p>
        </div>
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
    </div>
  );
}
