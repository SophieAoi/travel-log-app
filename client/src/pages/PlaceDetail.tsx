import { useEffect, useState, type ChangeEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ImagePlus, MapPin, Share2, Camera } from "lucide-react";
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
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (id) api.getPlace(id).then(setPlace);
  }, [id]);

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    if (!id || !e.target.files?.[0]) return;
    setUploading(true);
    try {
      const media = await api.uploadMedia(id, e.target.files[0]);
      setPlace((prev) => (prev ? { ...prev, media: [...prev.media, media] } : prev));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleShare() {
    if (!id) return;
    const share = await api.sharePlace({ placeId: id });
    setShareLink(`${window.location.origin}/shared/${share.id}`);
  }

  if (!place) return <p className="page muted">Loading…</p>;

  const coverPhoto = place.media.find((m) => m.type === "PHOTO");

  return (
    <>
      <div className="detail-hero">
        {coverPhoto ? (
          <img src={`${API_BASE}${coverPhoto.url}`} alt="" />
        ) : (
          <div className="detail-hero-placeholder">
            <Camera size={44} />
          </div>
        )}
        <div className="detail-hero-scrim" />
        <Link to="/places" className="detail-back">
          <ArrowLeft size={16} /> Places
        </Link>
        <div className="detail-hero-caption">
          <span className="badge badge-on-photo">
            <MapPin size={13} /> {place.countryCode}
          </span>
          <h1>{place.name}</h1>
        </div>
      </div>

      <div className="page">
        {place.description && <p className="place-description">{place.description}</p>}

        <div className="actions-row">
          <label className="upload-button">
            <ImagePlus size={17} /> {uploading ? "Uploading…" : "Add photo or video"}
            <input type="file" accept="image/*,video/*" onChange={handleUpload} hidden disabled={uploading} />
          </label>
          <button onClick={handleShare} className="secondary">
            <Share2 size={16} /> Share this place
          </button>
        </div>

        {shareLink && (
          <div className="share-link-box">
            <Share2 size={15} />
            <a href={shareLink}>{shareLink}</a>
          </div>
        )}

        {place.media.length > 0 && (
          <div className="media-grid">
            {place.media.map((m) => (
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
    </>
  );
}
