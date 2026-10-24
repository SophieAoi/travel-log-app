import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Images } from "lucide-react";
import { api } from "../api/client";
import { tagMeta, type TagCategory } from "../data/tags";

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

interface CollageItem {
  media: Media;
  placeId: string;
  placeName: string;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";

export function BoardAlbum() {
  const { tag } = useParams<{ tag: string }>();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPlaces().then((data: Place[]) => {
      setPlaces(data.filter((p) => p.tags.some((t) => t.category === tag)));
      setLoading(false);
    });
  }, [tag]);

  if (!tag) return null;

  const meta = tagMeta(tag);
  const Icon = meta?.icon;
  const label = meta?.label ?? tag;

  const items: CollageItem[] = places.flatMap((p) =>
    p.media.map((m) => ({ media: m, placeId: p.id, placeName: p.name }))
  );

  return (
    <div className="page">
      <Link to="/boards" className="nav-link detail-back-plain">
        <ArrowLeft size={16} /> Boards
      </Link>

      <div className="place-title-row">
        <h1 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {Icon && <Icon size={26} color="var(--color-accent)" />} {label}
        </h1>
        <span className="badge">
          <MapPin size={13} /> {places.length} {places.length === 1 ? "place" : "places"}
        </span>
      </div>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : places.length === 0 ? (
        <div className="empty-state">
          {Icon && <Icon size={32} />}
          <p className="empty-state-title">No places tagged {label} yet</p>
          <p className="muted">
            Add this tag to a <Link to="/places">place</Link> to start this board.
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <Images size={32} />
          <p className="empty-state-title">No photos yet</p>
          <p className="muted">Add photos to your {label.toLowerCase()} places to fill this board.</p>
        </div>
      ) : (
        <div className="collage">
          {items.map((item, i) => (
            <Link
              to={`/places/${item.placeId}`}
              key={item.media.id}
              className="collage-card"
              style={{ animationDelay: `${(i % 12) * 0.03}s` }}
            >
              {item.media.type === "PHOTO" ? (
                <img src={`${API_BASE}${item.media.url}`} alt="" loading="lazy" />
              ) : (
                <video src={`${API_BASE}${item.media.url}`} muted />
              )}
              <span className="collage-tag">{item.placeName}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
