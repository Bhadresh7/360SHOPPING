import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const router = Router();

const updateProfileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  bio: z.string().max(300).optional()
});

router.get("/profile", async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    loyaltyPoints: user.loyaltyPoints,
    referralCode: user.referralCode,
    appearance: {
      theme: "dark",
      accent: "gold"
    }
  });
});

router.patch("/profile", async (req, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
  }

  const user = await prisma.user.update({
    where: { id: req.user!.sub },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone
    }
  });

  return res.json(user);
});

export default router;