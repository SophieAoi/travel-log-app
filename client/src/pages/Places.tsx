import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { MapPinned, Plus, Image as ImageIcon, MapPin, Images } from "lucide-react";
import { api } from "../api/client";

interface Place {
  id: string;
  name: string;
  countryCode: string;
  description: string | null;
  media: { id: string; url: string; type: string }[];
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";

export function Places() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPlaces().then((data) => {
      setPlaces(data);
      setLoading(false);
    });
  }, []);

  async function addPlace(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !countryCode.trim()) return;
    const created = await api.addPlace({ name: name.trim(), countryCode: countryCode.trim().toUpperCase() });
    setPlaces((prev) => [{ ...created, media: [] }, ...prev]);
    setName("");
    setCountryCode("");
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>
          <MapPinned size={26} color="var(--color-accent)" /> Places
        </h1>
      </div>
      <p className="page-subtitle">Every spot worth remembering, with the photos to prove it.</p>

      <form onSubmit={addPlace} className="inline-form">
        <input placeholder="Place name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Country code" value={countryCode} onChange={(e) => setCountryCode(e.target.value)} maxLength={2} />
        <button type="submit">
          <Plus size={16} /> Add place
        </button>
      </form>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : places.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-emoji">📍</span>
          <p className="empty-state-title">No places yet</p>
          <p className="muted">Save a spot above and start building your travel album.</p>
        </div>
      ) : (
        <ul className="place-cards">
          {places.map((p, i) => {
            const cover = p.media.find((m) => m.type === "PHOTO");
            const mediaCount = p.media.length;
            return (
              <li key={p.id} className="place-card" style={{ animationDelay: `${i * 0.04}s` }}>
                <Link to={`/places/${p.id}`}>
                  <div className="place-thumb">
                    {cover ? <img src={`${API_BASE}${cover.url}`} alt="" /> : <ImageIcon size={30} />}
                    <div className="place-thumb-overlay" />
                    {mediaCount > 0 && (
                      <span className="place-thumb-count">
                        <Images size={12} /> {mediaCount}
                      </span>
                    )}
                    <div className="place-thumb-caption">
                      <h3>{p.name}</h3>
                      <span className="place-thumb-loc">
                        <MapPin size={12} /> {p.countryCode}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
