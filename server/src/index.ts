import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { countriesRouter } from "./routes/countries.js";
import { placesRouter } from "./routes/places.js";
import { mediaRouter } from "./routes/media.js";
import { sharesRouter } from "./routes/shares.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/countries", countriesRouter);
app.use("/places", placesRouter);
app.use("/media", mediaRouter);
app.use("/shares", sharesRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
