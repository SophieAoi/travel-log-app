import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

  if (notFound) return <p className="page">This link doesn't lead anywhere anymore.</p>;
  if (!data) return <p className="page">Loading...</p>;

  return (
    <div className="page">
      <p className="muted">Shared by {data.sharedBy}</p>
      <h1>{data.place.name}</h1>
      <p className="muted">{data.place.countryCode}</p>
      {data.place.description && <p>{data.place.description}</p>}

      <div className="media-grid">
        {data.place.media.map((m) =>
          m.type === "PHOTO" ? (
            <img key={m.id} src={`${API_BASE}${m.url}`} alt="" />
          ) : (
            <video key={m.id} src={`${API_BASE}${m.url}`} controls />
          )
        )}
      </div>
    </div>
  );
}
