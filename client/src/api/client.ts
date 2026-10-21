import type { TagCategory } from "../data/tags";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";

function getToken() {
  return localStorage.getItem("token");
}

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

// Called once by AuthProvider so the API layer can trigger a logout/redirect
// whenever any request comes back 401, instead of every call site having to
// check for it individually.
function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler;
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

  if (res.status === 401) {
    onUnauthorized?.();
  }

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
  getMe: () => request("/auth/me"),
  updateProfile: (data: { bio?: string; displayName?: string; email?: string }) =>
    request("/auth/me", { method: "PATCH", body: JSON.stringify(data) }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request("/auth/me/password", { method: "PATCH", body: JSON.stringify(data) }),
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request("/auth/me/avatar", { method: "POST", body: form });
  },

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
    tags?: TagCategory[];
  }) => request("/places", { method: "POST", body: JSON.stringify(data) }),
  updatePlace: (
    id: string,
    data: {
      name?: string;
      countryCode?: string;
      latitude?: number;
      longitude?: number;
      description?: string;
      tags?: TagCategory[];
    }
  ) => request(`/places/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deletePlace: (id: string) => request(`/places/${id}`, { method: "DELETE" }),

  uploadMedia: (placeId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request(`/media/${placeId}`, { method: "POST", body: form });
  },
  updateMedia: (id: string, data: { caption?: string }) =>
    request(`/media/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteMedia: (id: string) => request(`/media/${id}`, { method: "DELETE" }),

  sharePlace: (data: { placeId: string; recipientEmail?: string }) =>
    request("/shares", { method: "POST", body: JSON.stringify(data) }),
  getShare: (id: string) => request(`/shares/${id}`),
};

export { getToken, setUnauthorizedHandler };
