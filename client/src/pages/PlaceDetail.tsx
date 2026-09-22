import { useEffect, useState, type ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";

interface Media {
  id: string;
  url: string;
  type: "PHOTO" | "VIDEO";
}

interface Place {
  id: string;
  name: string;
  countryCode: string;
  description: string | null;
  media: Media[];
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";

export function PlaceDetail() {
  const { id } = useParams<{ id: string }>();
  const [place, setPlace] = useState<Place | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);

  useEffect(() => {
    if (id) api.getPlace(id).then(setPlace);
  }, [id]);

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    if (!id || !e.target.files?.[0]) return;
    const media = await api.uploadMedia(id, e.target.files[0]);
    setPlace((prev) => (prev ? { ...prev, media: [...prev.media, media] } : prev));
    e.target.value = "";
  }

  async function handleShare() {
    if (!id) return;
    const share = await api.sharePlace({ placeId: id });
    setShareLink(`${window.location.origin}/shared/${share.id}`);
  }

  if (!place) return <p className="page">Loading...</p>;

  return (
    <div className="page">
      <h1>{place.name}</h1>
      <p className="muted">{place.countryCode}</p>
      {place.description && <p>{place.description}</p>}

      <label className="upload-button">
        Add photo or video
        <input type="file" accept="image/*,video/*" onChange={handleUpload} hidden />
      </label>

      <div className="media-grid">
        {place.media.map((m) =>
          m.type === "PHOTO" ? (
            <img key={m.id} src={`${API_BASE}${m.url}`} alt="" />
          ) : (
            <video key={m.id} src={`${API_BASE}${m.url}`} controls />
          )
        )}
      </div>

      <button onClick={handleShare}>Share this place</button>
      {shareLink && (
        <p>
          Share link: <a href={shareLink}>{shareLink}</a>
        </p>
      )}
    </div>
  );
}
