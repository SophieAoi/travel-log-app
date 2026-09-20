import { Router } from "express";
import { prisma } from "../prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const sharesRouter = Router();

sharesRouter.post("/", requireAuth, async (req: AuthedRequest, res) => {
  const { placeId, recipientEmail } = req.body ?? {};

  if (!placeId) {
    return res.status(400).json({ error: "placeId is required" });
  }

  const place = await prisma.place.findUnique({ where: { id: placeId } });
  if (!place || place.userId !== req.userId) {
    return res.status(404).json({ error: "Not found" });
  }

  const share = await prisma.share.create({
    data: {
      placeId,
      sharedById: req.userId as string,
      recipientEmail,
    },
  });

  res.status(201).json(share);
});

// Public read-only view of a shared place — no auth required.
sharesRouter.get("/:id", async (req, res) => {
  const share = await prisma.share.findUnique({
    where: { id: req.params.id },
    include: { place: { include: { media: true } }, sharedBy: true },
  });

  if (!share) {
    return res.status(404).json({ error: "Not found" });
  }

  res.json({
    place: share.place,
    sharedBy: share.sharedBy.displayName,
  });
});
