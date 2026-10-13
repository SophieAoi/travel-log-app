import { Router } from "express";
import { prisma } from "../prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const placesRouter = Router();

placesRouter.use(requireAuth);

placesRouter.get("/", async (req: AuthedRequest, res) => {
  const places = await prisma.place.findMany({
    where: { userId: req.userId },
    include: { media: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(places);
});

placesRouter.post("/", async (req: AuthedRequest, res) => {
  const { name, countryCode, latitude, longitude, description, visitedAt } = req.body ?? {};

  if (!name || !countryCode) {
    return res.status(400).json({ error: "name and countryCode are required" });
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
    },
  });

  res.status(201).json(place);
});

placesRouter.patch("/:id", async (req: AuthedRequest, res) => {
  const place = await prisma.place.findUnique({ where: { id: req.params.id } });

  if (!place || place.userId !== req.userId) {
    return res.status(404).json({ error: "Not found" });
  }

  const { name, countryCode, latitude, longitude, description, visitedAt } = req.body ?? {};

  const updated = await prisma.place.update({
    where: { id: req.params.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(countryCode !== undefined ? { countryCode } : {}),
      ...(latitude !== undefined ? { latitude } : {}),
      ...(longitude !== undefined ? { longitude } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(visitedAt !== undefined ? { visitedAt: visitedAt ? new Date(visitedAt) : null } : {}),
    },
  });

  res.json(updated);
});

placesRouter.get("/:id", async (req: AuthedRequest, res) => {
  const place = await prisma.place.findUnique({
    where: { id: req.params.id },
    include: { media: true },
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
