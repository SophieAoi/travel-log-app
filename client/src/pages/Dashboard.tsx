import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

interface VisitedCountry {
  id: string;
  countryCode: string;
  visitedAt: string | null;
  notes: string | null;
}

export function Dashboard() {
  const [countries, setCountries] = useState<VisitedCountry[]>([]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCountries().then((data) => {
      setCountries(data);
      setLoading(false);
    });
  }, []);

  async function addCountry(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    const created = await api.addCountry({ countryCode: code.trim().toUpperCase() });
    setCountries((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
    setCode("");
  }

  async function removeCountry(id: string) {
    await api.deleteCountry(id);
    setCountries((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="page">
      <h1>Countries visited</h1>

      <form onSubmit={addCountry} className="inline-form">
        <input
          placeholder="Country code (e.g. FR, JP)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={2}
        />
        <button type="submit">Add</button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : countries.length === 0 ? (
        <p>Nothing logged yet. Add the first country above.</p>
      ) : (
        <ul className="country-list">
          {countries.map((c) => (
            <li key={c.id}>
              <span>{c.countryCode}</span>
              <button onClick={() => removeCountry(c.id)}>Remove</button>
            </li>
          ))}
        </ul>
      )}

      <p>
        <Link to="/places">View saved places →</Link>
      </p>
    </div>
  );
}
