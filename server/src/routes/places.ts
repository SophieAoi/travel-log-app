import { Router } from "express";
import { TagCategory } from "@prisma/client";
import { prisma } from "../prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const placesRouter = Router();

placesRouter.use(requireAuth);

const VALID_TAGS = new Set<string>(Object.values(TagCategory));

function parseTags(tags: unknown): TagCategory[] | undefined {
  if (tags === undefined) return undefined;
  if (!Array.isArray(tags) || !tags.every((t) => typeof t === "string" && VALID_TAGS.has(t))) {
    throw new Error("tags must be an array of valid tag categories");
  }
  return [...new Set(tags)] as TagCategory[];
}

placesRouter.get("/", async (req: AuthedRequest, res) => {
  const places = await prisma.place.findMany({
    where: { userId: req.userId },
    include: { media: true, tags: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(places);
});

placesRouter.post("/", async (req: AuthedRequest, res) => {
  const { name, countryCode, latitude, longitude, description, visitedAt, tags } = req.body ?? {};

  if (!name || !countryCode) {
    return res.status(400).json({ error: "name and countryCode are required" });
  }

  let tagList: TagCategory[] | undefined;
  try {
    tagList = parseTags(tags);
  } catch (err) {
    return res.status(400).json({ error: (err as Error).message });
  }

  const place = await prisma.place.create({
    data: {
      name,
      countryCode,
      latitude,
      longitude,
      description,
      visitedAt: visitedAt ? new Date(visitedAt) : undefined,
      userId: req.userId as string,
      tags: tagList ? { create: tagList.map((category) => ({ category })) } : undefined,
    },
    include: { tags: true },
  });

  res.status(201).json(place);
});

placesRouter.patch("/:id", async (req: AuthedRequest, res) => {
  const place = await prisma.place.findUnique({ where: { id: req.params.id } });

  if (!place || place.userId !== req.userId) {
    return res.status(404).json({ error: "Not found" });
  }

  const { name, countryCode, latitude, longitude, description, visitedAt, tags } = req.body ?? {};

  let tagList: TagCategory[] | undefined;
  try {
    tagList = parseTags(tags);
  } catch (err) {
    return res.status(400).json({ error: (err as Error).message });
  }

  if (tagList) {
    await prisma.placeTag.deleteMany({ where: { placeId: place.id } });
  }

  const updated = await prisma.place.update({
    where: { id: req.params.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(countryCode !== undefined ? { countryCode } : {}),
      ...(latitude !== undefined ? { latitude } : {}),
      ...(longitude !== undefined ? { longitude } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(visitedAt !== undefined ? { visitedAt: visitedAt ? new Date(visitedAt) : null } : {}),
      ...(tagList ? { tags: { create: tagList.map((category) => ({ category })) } } : {}),
    },
    include: { tags: true },
  });

  res.json(updated);
});

placesRouter.get("/:id", async (req: AuthedRequest, res) => {
  const place = await prisma.place.findUnique({
    where: { id: req.params.id },
    include: { media: true, tags: true },
  });

  if (!place || place.userId !== req.userId) {
    return res.status(404).json({ error: "Not found" });
  }

  res.json(place);
});

placesRouter.delete("/:id", async (req: AuthedRequest, res) => {
  const place = await prisma.place.findUnique({ where: { id: req.params.id } });

  if (!place || place.userId !== req.userId) {
    return res.status(404).json({ error: "Not found" });
  }

  await prisma.place.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
