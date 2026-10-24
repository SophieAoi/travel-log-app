import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import { api } from "../api/client";
import { TAGS, type TagCategory } from "../data/tags";

interface Media {
  id: string;
  url: string;
  type: "PHOTO" | "VIDEO";
}

interface PlaceTag {
  id: string;
  category: TagCategory;
}

interface Place {
  id: string;
  name: string;
  media: Media[];
  tags: PlaceTag[];
}

interface Board {
  tag: TagCategory;
  label: string;
  icon: (typeof TAGS)[number]["icon"];
  cover: Media | null;
  placeCount: number;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";

export function Boards() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getPlaces()
      .then((data) => setPlaces(data))
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Failed to load your places"))
      .finally(() => setLoading(false));
  }, []);

  const boards: Board[] = useMemo(() => {
    return TAGS.map((t) => {
      const matching = places.filter((p) => p.tags.some((tag) => tag.category === t.value));
      const cover = matching.flatMap((p) => p.media).find((m) => m.type === "PHOTO") ?? null;
      return { tag: t.value, label: t.label, icon: t.icon, cover, placeCount: matching.length };
    }).filter((b) => b.placeCount > 0);
  }, [places]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>
          <LayoutGrid size={26} color="var(--color-accent)" /> Boards
        </h1>
      </div>
      <p className="page-subtitle">Your places, organized by category.</p>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : loadError ? (
        <div className="empty-state">
          <p className="empty-state-title">Couldn't load your boards</p>
          <p className="muted">{loadError}</p>
        </div>
      ) : boards.length === 0 ? (
        <div className="empty-state">
          <LayoutGrid size={32} />
          <p className="empty-state-title">No boards yet</p>
          <p className="muted">
            Tag a <Link to="/places">place</Link> with a category to start organizing your boards.
          </p>
        </div>
      ) : (
        <ul className="board-grid">
          {boards.map((b, i) => {
            const Icon = b.icon;
            return (
              <li key={b.tag} className="board-card" style={{ animationDelay: `${i * 0.04}s` }}>
                <Link to={`/boards/${b.tag}`}>
                  <div className="board-cover">
                    {b.cover ? <img src={`${API_BASE}${b.cover.url}`} alt="" /> : <Icon size={32} />}
                  </div>
                  <div className="board-card-body">
                    <h3>
                      <Icon size={15} /> {b.label}
                    </h3>
                    <span className="muted">
                      {b.placeCount} {b.placeCount === 1 ? "place" : "places"}
                    </span>
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
