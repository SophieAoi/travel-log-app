# Travel Log App

This app lets users track the countries they've visited, capture memorable places with photos and videos, and share their favorite destinations with others.

Web app for now — mobile comes later, built against the same API. See [PROGRESS.md](PROGRESS.md) for build notes.

## Layout

- `client/` — React + Vite + TypeScript frontend
- `server/` — Express + TypeScript API, Prisma/Postgres

## Running it locally

You'll need Postgres running locally (or point `DATABASE_URL` at one).

```bash
# server
cd server
cp .env.example .env   # edit DATABASE_URL / JWT_SECRET as needed
npm install
npx prisma migrate dev
npm run dev             # http://localhost:4000

# client, in a second terminal
cd client
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

Uploaded photos/videos are saved to `server/uploads/` and served statically — fine for local dev, not meant for production as-is.
