import { useEffect, useState, type ChangeEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ImagePlus, MapPin, MapPinOff, Share2, Pencil } from "lucide-react";
import { api } from "../api/client";
import { LocationSearch, type LocationValue } from "../components/LocationSearch";

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
  latitude: number | null;
  longitude: number | null;
  media: Media[];
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";

export function PlaceDetail() {
  const { id } = useParams<{ id: string }>();
  const [place, setPlace] = useState<Place | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);

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

  async function handlePickLocation(location: LocationValue | null) {
    if (!id || !location) return;
    setSavingLocation(true);
    try {
      const updated = await api.updatePlace(id, { latitude: location.lat, longitude: location.lon });
      setPlace((prev) => (prev ? { ...prev, latitude: updated.latitude, longitude: updated.longitude } : prev));
      setEditingLocation(false);
    } finally {
      setSavingLocation(false);
    }
  }

  if (!place) return <p className="page muted">Loading…</p>;

  const hasPin = place.latitude != null && place.longitude != null;

  return (
    <>
      <div className="page">
        <Link to="/places" className="nav-link detail-back-plain">
          <ArrowLeft size={16} /> Places
        </Link>

        <div className="place-title-row">
          <h1 style={{ margin: 0 }}>{place.name}</h1>
          <span className="badge">
            <MapPin size={13} /> {place.countryCode}
          </span>
        </div>

        {place.description && <p className="place-description">{place.description}</p>}

        {editingLocation ? (
          <div className="location-edit-row">
            <LocationSearch
              value={null}
              onChange={handlePickLocation}
              placeholder={savingLocation ? "Saving…" : "Search for a location..."}
            />
            <button className="secondary" onClick={() => setEditingLocation(false)} type="button">
              Cancel
            </button>
          </div>
        ) : hasPin ? (
          <button className="pin-status pin-status-set" onClick={() => setEditingLocation(true)} type="button">
            <MapPin size={14} /> Pinned on the map <Pencil size={12} />
          </button>
        ) : (
          <button className="pin-status pin-status-unset" onClick={() => setEditingLocation(true)} type="button">
            <MapPinOff size={14} /> Not pinned yet — add a location
          </button>
        )}

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
