import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { Pencil, Check, X, Images, Camera } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

const BIO_MAX = 160;
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";

interface Media {
  id: string;
  url: string;
  type: "PHOTO" | "VIDEO";
}

interface PlaceSummary {
  id: string;
  name: string;
  media: Media[];
}

interface GridPhoto {
  media: Media;
  placeId: string;
  placeName: string;
}

export function Dashboard() {
  const { user, updateProfile, uploadAvatar } = useAuth();
  const [places, setPlaces] = useState<PlaceSummary[]>([]);
  const [countryCount, setCountryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [savingBio, setSavingBio] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getCountries(), api.getPlaces()])
      .then(([countriesData, placesData]) => {
        setCountryCount(countriesData.length);
        setPlaces(placesData);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Failed to load your data"))
      .finally(() => setLoading(false));
  }, []);

  function startEditingBio() {
    setBioDraft(user?.bio ?? "");
    setEditingBio(true);
  }

  async function saveBio() {
    setSavingBio(true);
    try {
      await updateProfile({ bio: bioDraft.trim() });
      setEditingBio(false);
    } finally {
      setSavingBio(false);
    }
  }

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);
    setUploadingAvatar(true);
    try {
      await uploadAvatar(file);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Failed to update profile picture");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  }

  const photoCount = places.reduce((sum, p) => sum + p.media.length, 0);
  const initial = user?.displayName.trim().charAt(0).toUpperCase() ?? "?";

  const gridPhotos: GridPhoto[] = useMemo(
    () => places.flatMap((p) => p.media.map((m) => ({ media: m, placeId: p.id, placeName: p.name }))),
    [places]
  );

  return (
    <div className="page pinterest-profile">
      <div className="pinterest-profile-header">
        <label className="avatar-upload" title="Change profile picture">
          <span className="avatar avatar-xl">
            {user?.avatarUrl ? (
              <img src={`${API_BASE}${user.avatarUrl}`} alt="" />
            ) : (
              <span>{initial}</span>
            )}
          </span>
          <span className={`avatar-upload-overlay ${uploadingAvatar ? "avatar-upload-overlay-visible" : ""}`}>
            {uploadingAvatar ? <span className="avatar-upload-spinner" /> : <Camera size={20} />}
          </span>
          <input type="file" accept="image/*" onChange={handleAvatarChange} hidden disabled={uploadingAvatar} />
        </label>

        {avatarError && <p className="error">{avatarError}</p>}

        <h1>{user?.displayName}</h1>

        <p className="pinterest-stats-line">
          <strong>{countryCount}</strong> {countryCount === 1 ? "country" : "countries"}
          <span className="dot">·</span>
          <strong>{places.length}</strong> {places.length === 1 ? "place" : "places"}
          <span className="dot">·</span>
          <strong>{photoCount}</strong> {photoCount === 1 ? "photo" : "photos"}
        </p>

        {editingBio ? (
          <div className="bio-edit-row pinterest-bio-edit">
            <textarea
              className="bio-edit-input"
              value={bioDraft}
              onChange={(e) => setBioDraft(e.target.value.slice(0, BIO_MAX))}
              placeholder="Tell people a bit about your travels..."
              rows={2}
              autoFocus
            />
            <div className="bio-edit-actions">
              <span className="bio-char-count">
                {bioDraft.length}/{BIO_MAX}
              </span>
              <button className="icon-only-button secondary" onClick={() => setEditingBio(false)} type="button" aria-label="Cancel">
                <X size={14} />
              </button>
              <button className="icon-only-button" onClick={saveBio} disabled={savingBio} type="button" aria-label="Save bio">
                <Check size={14} />
              </button>
            </div>
          </div>
        ) : (
          <p className="pinterest-bio">{user?.bio || "Curating the places worth remembering."}</p>
        )}

        <button className="edit-profile-button" onClick={startEditingBio} type="button">
          <Pencil size={13} /> Edit profile
        </button>
      </div>

      <div className="pinterest-tabs">
        <span className="pinterest-tab active">Places</span>
      </div>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : loadError ? (
        <div className="empty-state">
          <p className="empty-state-title">Couldn't load your places</p>
          <p className="muted">{loadError}</p>
        </div>
      ) : gridPhotos.length === 0 ? (
        <div className="empty-state">
          <Images size={32} />
          <p className="empty-state-title">No photos yet</p>
          <p className="muted">
            Add a <Link to="/places">place</Link> and drop in some photos to fill your grid.
          </p>
        </div>
      ) : (
        <div className="collage">
          {gridPhotos.map((item, i) => (
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
