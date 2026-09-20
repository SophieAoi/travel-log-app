import { Router } from "express";
import { prisma } from "../prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const countriesRouter = Router();

countriesRouter.use(requireAuth);

countriesRouter.get("/", async (req: AuthedRequest, res) => {
  const countries = await prisma.visitedCountry.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
  });
  res.json(countries);
});

countriesRouter.post("/", async (req: AuthedRequest, res) => {
  const { countryCode, visitedAt, notes } = req.body ?? {};

  if (!countryCode) {
    return res.status(400).json({ error: "countryCode is required" });
  }

  const country = await prisma.visitedCountry.upsert({
    where: { userId_countryCode: { userId: req.userId as string, countryCode } },
    update: { visitedAt: visitedAt ? new Date(visitedAt) : undefined, notes },
    create: {
      countryCode,
      visitedAt: visitedAt ? new Date(visitedAt) : undefined,
      notes,
      userId: req.userId as string,
    },
  });

  res.status(201).json(country);
});

countriesRouter.delete("/:id", async (req: AuthedRequest, res) => {
  const country = await prisma.visitedCountry.findUnique({ where: { id: req.params.id } });

  if (!country || country.userId !== req.userId) {
    return res.status(404).json({ error: "Not found" });
  }

  await prisma.visitedCountry.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
