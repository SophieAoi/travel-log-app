import { Router } from "express";
import multer from "multer";
import path from "node:path";
import { prisma } from "../prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const mediaRouter = Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});

mediaRouter.use(requireAuth);

mediaRouter.post("/:placeId", upload.single("file"), async (req: AuthedRequest, res) => {
  const place = await prisma.place.findUnique({ where: { id: req.params.placeId } });

  if (!place || place.userId !== req.userId) {
    return res.status(404).json({ error: "Not found" });
  }

  if (!req.file) {
    return res.status(400).json({ error: "file is required" });
  }

  const isVideo = req.file.mimetype.startsWith("video/");

  const media = await prisma.media.create({
    data: {
      url: `/uploads/${req.file.filename}`,
      type: isVideo ? "VIDEO" : "PHOTO",
      placeId: place.id,
    },
  });

  res.status(201).json(media);
});

mediaRouter.patch("/:id", async (req: AuthedRequest, res) => {
  const media = await prisma.media.findUnique({
    where: { id: req.params.id },
    include: { place: true },
  });

  if (!media || media.place.userId !== req.userId) {
    return res.status(404).json({ error: "Not found" });
  }

  const { caption } = req.body ?? {};

  if (caption !== undefined && typeof caption !== "string") {
    return res.status(400).json({ error: "caption must be a string" });
  }
  if (caption !== undefined && caption.length > 280) {
    return res.status(400).json({ error: "caption must be 280 characters or fewer" });
  }

  const updated = await prisma.media.update({
    where: { id: req.params.id },
    data: { caption },
  });

  res.json(updated);
});

mediaRouter.delete("/:id", async (req: AuthedRequest, res) => {
  const media = await prisma.media.findUnique({
    where: { id: req.params.id },
    include: { place: true },
  });

  if (!media || media.place.userId !== req.userId) {
    return res.status(404).json({ error: "Not found" });
  }

  await prisma.media.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
