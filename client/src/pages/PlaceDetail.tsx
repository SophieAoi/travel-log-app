import { useEffect, useState, type ChangeEvent } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ImagePlus, MapPin, MapPinOff, Share2, Pencil, Check, X } from "lucide-react";
import { api } from "../api/client";
import { LocationSearch, type LocationValue } from "../components/LocationSearch";
import { CountrySelect } from "../components/CountrySelect";
import { PhotoLightbox } from "../components/PhotoLightbox";
import { ConfirmDeleteButton } from "../components/ConfirmDeleteButton";
import { TagPicker } from "../components/TagPicker";
import { tagMeta, type TagCategory } from "../data/tags";

interface Media {
  id: string;
  url: string;
  type: "PHOTO" | "VIDEO";
  caption?: string | null;
}

interface PlaceTag {
  id: string;
  category: TagCategory;
}

interface Place {
  id: string;
  name: string;
  countryCode: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  media: Media[];
  tags: PlaceTag[];
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";

export function PlaceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [place, setPlace] = useState<Place | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [editingTags, setEditingTags] = useState(false);
  const [tagDraft, setTagDraft] = useState<TagCategory[]>([]);
  const [savingTags, setSavingTags] = useState(false);

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

  function startEditingDetails() {
    if (!place) return;
    setEditName(place.name);
    setEditCountry(place.countryCode);
    setEditingDetails(true);
  }

  async function saveDetails() {
    if (!id || !editName.trim() || !editCountry) return;
    setSavingDetails(true);
    try {
      const updated = await api.updatePlace(id, { name: editName.trim(), countryCode: editCountry });
      setPlace((prev) => (prev ? { ...prev, name: updated.name, countryCode: updated.countryCode } : prev));
      setEditingDetails(false);
    } finally {
      setSavingDetails(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    setDeleting(true);
    try {
      await api.deletePlace(id);
      navigate("/places");
    } finally {
      setDeleting(false);
    }
  }

  function startEditingTags() {
    if (!place) return;
    setTagDraft(place.tags.map((t) => t.category));
    setEditingTags(true);
  }

  async function saveTags() {
    if (!id) return;
    setSavingTags(true);
    try {
      const updated = await api.updatePlace(id, { tags: tagDraft });
      setPlace((prev) => (prev ? { ...prev, tags: updated.tags } : prev));
      setEditingTags(false);
    } finally {
      setSavingTags(false);
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

        {editingDetails ? (
          <div className="detail-edit-row">
            <input
              className="detail-edit-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Place name"
            />
            <CountrySelect value={editCountry} onChange={setEditCountry} placeholder="Country" />
            <button
              className="icon-only-button"
              onClick={saveDetails}
              disabled={savingDetails || !editName.trim() || !editCountry}
              aria-label="Save"
              type="button"
            >
              <Check size={16} />
            </button>
            <button
              className="icon-only-button secondary"
              onClick={() => setEditingDetails(false)}
              aria-label="Cancel"
              type="button"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="place-title-row">
            <h1 style={{ margin: 0 }}>{place.name}</h1>
            <span className="badge">
              <MapPin size={13} /> {place.countryCode}
            </span>
            <button className="icon-only-button ghost" onClick={startEditingDetails} aria-label="Edit details" type="button">
              <Pencil size={14} />
            </button>
            <ConfirmDeleteButton onConfirm={handleDelete} disabled={deleting} label="Delete place" />
          </div>
        )}

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

        {editingTags ? (
          <div className="tags-edit-block">
            <TagPicker value={tagDraft} onChange={setTagDraft} />
            <div className="tags-edit-actions">
              <button className="icon-only-button" onClick={saveTags} disabled={savingTags} aria-label="Save tags" type="button">
                <Check size={16} />
              </button>
              <button
                className="icon-only-button secondary"
                onClick={() => setEditingTags(false)}
                aria-label="Cancel"
                type="button"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <button className="tags-summary" onClick={startEditingTags} type="button">
            {place.tags.length > 0 ? (
              place.tags.map((t) => {
                const meta = tagMeta(t.category);
                const Icon = meta?.icon;
                return (
                  <span key={t.id} className="tag-chip tag-chip-active">
                    {Icon && <Icon size={13} />}
                    {meta?.label ?? t.category}
                  </span>
                );
              })
            ) : (
              <span className="tag-chip">
                <Pencil size={12} /> Add tags
              </span>
            )}
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
          <div className="collage">
            {place.media.map((m, i) => (
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
                {m.caption && <span className="collage-tag">{m.caption}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <PhotoLightbox
          items={place.media}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
          onCaptionSaved={(mediaId, caption) => {
            setPlace((prev) =>
              prev
                ? { ...prev, media: prev.media.map((m) => (m.id === mediaId ? { ...m, caption } : m)) }
                : prev
            );
          }}
        />
      )}
    </>
  );
}
