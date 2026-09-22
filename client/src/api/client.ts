const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed with status ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  signup: (data: { email: string; password: string; displayName: string }) =>
    request("/auth/signup", { method: "POST", body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  getCountries: () => request("/countries"),
  addCountry: (data: { countryCode: string; visitedAt?: string; notes?: string }) =>
    request("/countries", { method: "POST", body: JSON.stringify(data) }),
  deleteCountry: (id: string) => request(`/countries/${id}`, { method: "DELETE" }),

  getPlaces: () => request("/places"),
  getPlace: (id: string) => request(`/places/${id}`),
  addPlace: (data: {
    name: string;
    countryCode: string;
    latitude?: number;
    longitude?: number;
    description?: string;
    visitedAt?: string;
  }) => request("/places", { method: "POST", body: JSON.stringify(data) }),
  deletePlace: (id: string) => request(`/places/${id}`, { method: "DELETE" }),

  uploadMedia: (placeId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request(`/media/${placeId}`, { method: "POST", body: form });
  },
  deleteMedia: (id: string) => request(`/media/${id}`, { method: "DELETE" }),

  sharePlace: (data: { placeId: string; recipientEmail?: string }) =>
    request("/shares", { method: "POST", body: JSON.stringify(data) }),
  getShare: (id: string) => request(`/shares/${id}`),
};

export { getToken };
