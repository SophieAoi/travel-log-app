import { useEffect, useRef, useState } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";

export interface LocationValue {
  label: string;
  lat: number;
  lon: number;
}

interface LocationSearchProps {
  value: LocationValue | null;
  onChange: (value: LocationValue | null) => void;
  placeholder?: string;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

export function LocationSearch({ value, onChange, placeholder = "Search for a location..." }: LocationSearchProps) {
  const [query, setQuery] = useState(value?.label ?? "");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleQueryChange(next: string) {
    setQuery(next);
    onChange(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (next.trim().length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(next)}&format=json&limit=6`
        );
        const data: NominatimResult[] = await res.json();
        setResults(data);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  }

  function pick(result: NominatimResult) {
    const location: LocationValue = {
      label: result.display_name,
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
    };
    onChange(location);
    setQuery(result.display_name);
    setOpen(false);
  }

  return (
    <div className="location-search" ref={rootRef}>
      <div className="location-search-input-wrap">
        {loading ? <Loader2 size={15} className="spin" /> : <Search size={15} />}
        <input
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
        />
      </div>

      {open && results.length > 0 && (
        <ul className="location-search-panel" role="listbox">
          {results.map((r, i) => (
            <li key={i}>
              <button type="button" className="location-search-option" onClick={() => pick(r)}>
                <MapPin size={14} />
                <span>{r.display_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
