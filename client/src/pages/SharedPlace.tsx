import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapPin, Camera, UserRound } from "lucide-react";
import { api } from "../api/client";

interface Media {
  id: string;
  url: string;
  type: "PHOTO" | "VIDEO";
}

interface SharedData {
  place: { name: string; countryCode: string; description: string | null; media: Media[] };
  sharedBy: string;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";

export function SharedPlace() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<SharedData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) api.getShare(id).then(setData).catch(() => setNotFound(true));
  }, [id]);

  if (notFound) return <p className="page muted">This link doesn't lead anywhere anymore.</p>;
  if (!data) return <p className="page muted">Loading…</p>;

  const coverPhoto = data.place.media.find((m) => m.type === "PHOTO");

  return (
    <div className="page">
      <p className="shared-banner">
        <UserRound size={15} /> Shared by {data.sharedBy}
      </p>

      <div className="place-hero">
        {coverPhoto ? (
          <img src={`${API_BASE}${coverPhoto.url}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Camera size={40} />
        )}
      </div>

      <div className="place-title-row">
        <h1 style={{ margin: 0 }}>{data.place.name}</h1>
        <span className="badge">
          <MapPin size={13} /> {data.place.countryCode}
        </span>
      </div>
      {data.place.description && <p>{data.place.description}</p>}

      {data.place.media.length > 0 && (
        <div className="media-grid">
          {data.place.media.map((m) => (
            <figure key={m.id}>
              {m.type === "PHOTO" ? (
                <img src={`${API_BASE}${m.url}`} alt="" />
              ) : (
                <video src={`${API_BASE}${m.url}`} controls />
              )}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
