import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  const frames = await (prisma as any).smartFrame.findMany({
    where: { userId: req.user!.sub },
    orderBy: { name: "asc" }
  });
  res.json(frames);
});

export default router;
