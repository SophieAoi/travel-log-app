import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapPin, Camera, UserRound } from "lucide-react";
import { api } from "../api/client";
import { Logo } from "../components/Logo";
import { PhotoLightbox } from "../components/PhotoLightbox";

interface Media {
  id: string;
  url: string;
  type: "PHOTO" | "VIDEO";
  caption?: string | null;
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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (id) api.getShare(id).then(setData).catch(() => setNotFound(true));
  }, [id]);

  if (notFound) return <p className="page muted">This link doesn't lead anywhere anymore.</p>;
  if (!data) return <p className="page muted">Loading…</p>;

  const coverPhoto = data.place.media.find((m) => m.type === "PHOTO");

  return (
    <>
      <div className="shared-topbar">
        <Logo />
      </div>

      <div className="detail-hero">
        {coverPhoto ? (
          <img src={`${API_BASE}${coverPhoto.url}`} alt="" />
        ) : (
          <div className="detail-hero-placeholder">
            <Camera size={44} />
          </div>
        )}
        <div className="detail-hero-scrim" />
        <div className="detail-hero-caption">
          <span className="badge badge-on-photo">
            <MapPin size={13} /> {data.place.countryCode}
          </span>
          <h1>{data.place.name}</h1>
        </div>
      </div>

      <div className="page">
        <p className="shared-banner">
          <UserRound size={15} /> Shared by {data.sharedBy}
        </p>
        {data.place.description && <p className="place-description">{data.place.description}</p>}

        {data.place.media.length > 0 && (
          <div className="collage">
            {data.place.media.map((m, i) => (
              <button
                key={m.id}
                className="collage-card collage-card-button"
                onClick={() => setLightboxIndex(i)}
                type="button"
              >
                {m.type === "PHOTO" ? (
                  <img src={`${API_BASE}${m.url}`} alt="" loading="lazy" />
                ) : (
                  <video src={`${API_BASE}${m.url}`} muted />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <PhotoLightbox
          items={data.place.media}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
          readOnly
        />
      )}
    </>
  );
}
