import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "node:path";
import { prisma } from "../prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const authRouter = Router();

const avatarStorage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Avatar must be an image"));
      return;
    }
    cb(null, true);
  },
});

function toUserJson(user: {
  id: string;
  email: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
}) {
  return { id: user.id, email: user.email, displayName: user.displayName, bio: user.bio, avatarUrl: user.avatarUrl };
}

authRouter.post("/signup", async (req, res) => {
  const { email, password, displayName } = req.body ?? {};

  if (!email || !password || !displayName) {
    return res.status(400).json({ error: "email, password, and displayName are required" });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, displayName },
  });

  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
  res.status(201).json({ token, user: toUserJson(user) });
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
  res.json({ token, user: toUserJson(user) });
});

authRouter.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });

  if (!user) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  res.json(toUserJson(user));
});

authRouter.patch("/me", requireAuth, async (req: AuthedRequest, res) => {
  const { bio, displayName } = req.body ?? {};

  if (bio !== undefined && typeof bio !== "string") {
    return res.status(400).json({ error: "bio must be a string" });
  }
  if (bio !== undefined && bio.length > 160) {
    return res.status(400).json({ error: "bio must be 160 characters or fewer" });
  }

  const user = await prisma.user.update({
    where: { id: req.userId },
    data: {
      ...(bio !== undefined ? { bio } : {}),
      ...(displayName !== undefined ? { displayName } : {}),
    },
  });

  res.json(toUserJson(user));
});

authRouter.post("/me/avatar", requireAuth, uploadAvatar.single("file"), async (req: AuthedRequest, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "file is required" });
  }

  const user = await prisma.user.update({
    where: { id: req.userId },
    data: { avatarUrl: `/uploads/${req.file.filename}` },
  });

  res.json(toUserJson(user));
});
