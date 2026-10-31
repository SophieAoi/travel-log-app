import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Check, Pencil } from "lucide-react";
import { api } from "../api/client";

export interface LightboxMedia {
  id: string;
  url: string;
  type: "PHOTO" | "VIDEO";
  caption?: string | null;
}

interface PhotoLightboxProps {
  items: LightboxMedia[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  onCaptionSaved?: (mediaId: string, caption: string) => void;
  readOnly?: boolean;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";
const CAPTION_MAX = 280;

export function PhotoLightbox({
  items,
  index,
  onClose,
  onIndexChange,
  onCaptionSaved,
  readOnly = false,
}: PhotoLightboxProps) {
  const current = items[index];
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(current?.caption ?? "");
  const [saving, setSaving] = useState(false);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null);
  const [frameWidth, setFrameWidth] = useState<number | null>(null);

  useEffect(() => {
    setEditing(false);
    setDraft(current?.caption ?? "");
  }, [current?.id]);

  useLayoutEffect(() => {
    const el = mediaRef.current;
    if (!el) return;
    const measure = () => setFrameWidth(el.getBoundingClientRect().width);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [current?.id]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onIndexChange(Math.max(0, index - 1));
      if (e.key === "ArrowRight") onIndexChange(Math.min(items.length - 1, index + 1));
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [index, items.length, onClose, onIndexChange]);

  if (!current) return null;

  async function saveCaption() {
    setSaving(true);
    try {
      await api.updateMedia(current.id, { caption: draft.trim() });
      onCaptionSaved?.(current.id, draft.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Close" type="button">
        <X size={20} />
      </button>

      {index > 0 && (
        <button
          className="lightbox-nav lightbox-nav-prev"
          onClick={(e) => {
            e.stopPropagation();
            onIndexChange(index - 1);
          }}
          aria-label="Previous photo"
          type="button"
        >
          <ChevronLeft size={22} />
        </button>
      )}
      {index < items.length - 1 && (
        <button
          className="lightbox-nav lightbox-nav-next"
          onClick={(e) => {
            e.stopPropagation();
            onIndexChange(index + 1);
          }}
          aria-label="Next photo"
          type="button"
        >
          <ChevronRight size={22} />
        </button>
      )}

      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-frame" style={frameWidth ? { width: frameWidth } : undefined}>
          <div className="lightbox-media">
            {current.type === "PHOTO" ? (
              <img ref={mediaRef as React.RefObject<HTMLImageElement>} src={`${API_BASE}${current.url}`} alt="" />
            ) : (
              <video
                ref={mediaRef as React.RefObject<HTMLVideoElement>}
                src={`${API_BASE}${current.url}`}
                controls
                autoPlay
              />
            )}
          </div>

          {!readOnly && (
            <div className="lightbox-caption-bar">
              {editing ? (
                <div className="lightbox-caption-edit">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value.slice(0, CAPTION_MAX))}
                    placeholder="Add a caption..."
                    rows={2}
                    autoFocus
                  />
                  <div className="lightbox-caption-actions">
                    <span className="bio-char-count">
                      {draft.length}/{CAPTION_MAX}
                    </span>
                    <button className="icon-only-button secondary" onClick={() => setEditing(false)} type="button">
                      <X size={14} />
                    </button>
                    <button className="icon-only-button" onClick={saveCaption} disabled={saving} type="button">
                      <Check size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <button className="lightbox-caption-button" onClick={() => setEditing(true)} type="button">
                  <span>{current.caption || "Add a caption..."}</span>
                  <Pencil size={12} />
                </button>
              )}
            </div>
          )}

          {readOnly && current.caption && <p className="lightbox-caption-readonly">{current.caption}</p>}
        </div>
      </div>
    </div>
  );
}
