import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPinned, Plus, Image as ImageIcon, MapPin, Images, Pencil } from "lucide-react";
import { api } from "../api/client";
import { CountrySelect } from "../components/CountrySelect";
import { LocationSearch, type LocationValue } from "../components/LocationSearch";
import { ConfirmDeleteButton } from "../components/ConfirmDeleteButton";
import { tagMeta, type TagCategory } from "../data/tags";

interface PlaceTag {
  id: string;
  category: TagCategory;
}

interface Place {
  id: string;
  name: string;
  countryCode: string;
  description: string | null;
  media: { id: string; url: string; type: string }[];
  tags: PlaceTag[];
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";

export function Places() {
  const navigate = useNavigate();
  const [places, setPlaces] = useState<Place[]>([]);
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    api
      .getPlaces()
      .then((data) => setPlaces(data))
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Failed to load your places"))
      .finally(() => setLoading(false));
  }, []);

  async function addPlace(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !countryCode) return;
    setAddError(null);
    try {
      const created = await api.addPlace({
        name: name.trim(),
        countryCode,
        latitude: location?.lat,
        longitude: location?.lon,
      });
      setPlaces((prev) => [{ ...created, media: [] }, ...prev]);
      setName("");
      setCountryCode("");
      setLocation(null);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to add place");
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await api.deletePlace(id);
      setPlaces((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  function handleEdit(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/places/${id}`);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>
          <MapPinned size={26} color="var(--color-accent)" /> Places
        </h1>
      </div>
      <p className="page-subtitle">Every spot worth remembering, with the photos to prove it.</p>

      <form onSubmit={addPlace} className="inline-form inline-form-wrap">
        <input placeholder="Place name" value={name} onChange={(e) => setName(e.target.value)} />
        <CountrySelect value={countryCode} onChange={setCountryCode} placeholder="Country" />
        <LocationSearch value={location} onChange={setLocation} placeholder="Pin a location (optional)" />
        <button type="submit" disabled={!name.trim() || !countryCode}>
          <Plus size={16} /> Add place
        </button>
      </form>

      {addError && <p className="error">{addError}</p>}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : loadError ? (
        <div className="empty-state">
          <p className="empty-state-title">Couldn't load your places</p>
          <p className="muted">{loadError}</p>
        </div>
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
                    <div className="place-thumb-hover-actions">
                      <button
                        className="place-thumb-action"
                        onClick={(e) => handleEdit(e, p.id)}
                        aria-label="Edit place"
                        type="button"
                      >
                        <Pencil size={13} />
                      </button>
                      <ConfirmDeleteButton
                        onConfirm={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                        label="Delete place"
                        className="place-thumb-action place-thumb-action-danger"
                        armedTimeoutMs={3000}
                      />
                    </div>
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
                      {p.tags.length > 0 && (
                        <div className="place-thumb-tags">
                          {p.tags.map((t) => (
                            <span key={t.id} className="place-thumb-tag">
                              {tagMeta(t.category)?.label ?? t.category}
                            </span>
                          ))}
                        </div>
                      )}
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
