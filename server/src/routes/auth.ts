import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";

export const authRouter = Router();

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
  res.status(201).json({ token, user: { id: user.id, email: user.email, displayName: user.displayName } });
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
  res.json({ token, user: { id: user.id, email: user.email, displayName: user.displayName } });
});
