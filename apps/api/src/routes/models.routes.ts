import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  const models = await (prisma as any).talentModel.findMany({
    orderBy: { score: "desc" }
  });
  res.json(models.map((m: any) => ({
    ...m,
    tags: JSON.parse(m.tags)
  })));
});

export default router;
