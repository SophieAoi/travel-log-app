import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { MapPinned, Plus, Image as ImageIcon } from "lucide-react";
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
          <MapPinned size={36} />
          <p>No places saved yet.</p>
        </div>
      ) : (
        <ul className="place-cards">
          {places.map((p, i) => {
            const cover = p.media.find((m) => m.type === "PHOTO");
            return (
              <li key={p.id} className="place-card" style={{ animationDelay: `${i * 0.04}s` }}>
                <Link to={`/places/${p.id}`}>
                  <div className="place-thumb">
                    {cover ? <img src={`${API_BASE}${cover.url}`} alt="" /> : <ImageIcon size={28} />}
                  </div>
                  <div className="place-card-body">
                    <h3>{p.name}</h3>
                    <p className="muted">{p.countryCode}</p>
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
