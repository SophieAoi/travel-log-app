# Build log

Keeping notes here as the project comes together, mostly so I don't forget why a decision got made.

## 2026-09-25 — Getting the web app off the ground

Decided to build the web version first and hold off on mobile. The idea is to get the
data model and API right once, then point a React Native app at the same backend
later instead of building two APIs.

Stack:
- Client: React + Vite + TypeScript, React Router for pages, plain fetch wrapper for the API (no heavier data-fetching library yet — not enough screens to justify one).
- Server: Node + Express + TypeScript, Prisma against Postgres.
- Auth: email/password with bcrypt hashing and JWTs. Nothing fancy, no OAuth yet.
- File storage: uploads go to a local `uploads/` folder on the server for now, served statically. Fine for development; will need to move to S3 (or similar) before this goes anywhere near production, since local disk storage won't survive a redeploy.

Data model (see `server/prisma/schema.prisma`):
- `User` — account info.
- `VisitedCountry` — a lightweight "I've been to this country" record, separate from `Place` because not every visited country needs a detailed writeup.
- `Place` — a specific spot with a description, coordinates, and photos/videos attached.
- `Media` — photo or video file tied to a place.
- `Share` — generates a shareable link to a single place so someone without an account can view it.

What's working right now:
- Sign up / log in, both hitting `/auth`.
- Add and remove visited countries.
- Add places, upload photos/videos to a place, view them back.
- Generate a public share link for a place (no login needed to view it).

What's deliberately not done yet:
- No password reset flow.
- No map view — countries/places are just lists for now.
- No pagination anywhere; fine while there's little data, will need it later.
- Uploads aren't validated beyond a 100MB size cap and mime type check — no image resizing/compression yet, so large photos will upload as-is.
- No tests written yet.

Next up: get a Postgres instance running locally, run the first migration, and actually click through the app end to end before touching the mobile side.
