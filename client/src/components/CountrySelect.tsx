import { useEffect, useMemo, useRef, useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { COUNTRIES, countryFlag } from "../data/countries";

interface CountrySelectProps {
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
}

export function CountrySelect({ value, onChange, placeholder = "Select a country" }: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = COUNTRIES.find((c) => c.code === value);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();

    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  function pick(code: string) {
    onChange(code);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="country-select" ref={rootRef}>
      <button
        type="button"
        className="country-select-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected ? (
          <>
            <span className="country-select-flag">{countryFlag(selected.code)}</span>
            <span>{selected.name}</span>
          </>
        ) : (
          <span className="muted">{placeholder}</span>
        )}
        <ChevronDown size={16} className="country-select-chevron" />
      </button>

      {open && (
        <div className="country-select-panel">
          <div className="country-select-search">
            <Search size={14} />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search countries..."
            />
          </div>
          <ul className="country-select-list" role="listbox">
            {results.length === 0 ? (
              <li className="country-select-empty">No matches</li>
            ) : (
              results.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    className={`country-select-option ${c.code === value ? "selected" : ""}`}
                    onClick={() => pick(c.code)}
                    role="option"
                    aria-selected={c.code === value}
                  >
                    <span className="country-select-flag">{countryFlag(c.code)}</span>
                    <span>{c.name}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
