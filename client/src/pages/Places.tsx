import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

interface Place {
  id: string;
  name: string;
  countryCode: string;
  description: string | null;
  media: { id: string; url: string; type: string }[];
}

export function Places() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPlaces().then((data) => {
      setPlaces(data);
      setLoading(false);
    });
  }, []);

  async function addPlace(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !countryCode.trim()) return;
    const created = await api.addPlace({ name: name.trim(), countryCode: countryCode.trim().toUpperCase() });
    setPlaces((prev) => [{ ...created, media: [] }, ...prev]);
    setName("");
    setCountryCode("");
  }

  return (
    <div className="page">
      <h1>Places</h1>

      <form onSubmit={addPlace} className="inline-form">
        <input placeholder="Place name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Country code" value={countryCode} onChange={(e) => setCountryCode(e.target.value)} maxLength={2} />
        <button type="submit">Add place</button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : places.length === 0 ? (
        <p>No places saved yet.</p>
      ) : (
        <ul className="place-list">
          {places.map((p) => (
            <li key={p.id}>
              <Link to={`/places/${p.id}`}>
                {p.name} <span className="muted">({p.countryCode})</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
