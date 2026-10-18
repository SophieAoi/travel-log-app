import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Images } from "lucide-react";
import { api } from "../api/client";
import { countryFlag, countryName } from "../data/countries";

interface Media {
  id: string;
  url: string;
  type: "PHOTO" | "VIDEO";
}

interface Place {
  id: string;
  name: string;
  countryCode: string;
  media: Media[];
}

interface CollageItem {
  media: Media;
  placeId: string;
  placeName: string;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";

export function CountryAlbum() {
  const { code } = useParams<{ code: string }>();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPlaces().then((data: Place[]) => {
      setPlaces(data.filter((p) => p.countryCode === code));
      setLoading(false);
    });
  }, [code]);

  if (!code) return null;

  const items: CollageItem[] = places.flatMap((p) =>
    p.media.map((m) => ({ media: m, placeId: p.id, placeName: p.name }))
  );

  return (
    <div className="page">
      <Link to="/countries" className="nav-link detail-back-plain">
        <ArrowLeft size={16} /> Countries
      </Link>

      <div className="place-title-row">
        <h1 style={{ margin: 0 }}>
          {countryFlag(code)} {countryName(code)}
        </h1>
        <span className="badge">
          <MapPin size={13} /> {places.length} {places.length === 1 ? "place" : "places"}
        </span>
      </div>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : places.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-emoji">{countryFlag(code)}</span>
          <p className="empty-state-title">No places saved here yet</p>
          <p className="muted">Save a spot in {countryName(code)} to start this album.</p>
          <Link to="/places" className="text-link" style={{ marginTop: "0.75rem", justifyContent: "center" }}>
            Add a place →
          </Link>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <Images size={32} />
          <p className="empty-state-title">No photos yet</p>
          <p className="muted">Add photos to your places in {countryName(code)} to fill this album.</p>
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
