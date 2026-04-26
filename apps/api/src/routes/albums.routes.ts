import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  const albums = await (prisma as any).album.findMany({
    where: { userId: req.user!.sub },
    orderBy: { date: "desc" }
  });
  res.json(albums);
});

export default router;
