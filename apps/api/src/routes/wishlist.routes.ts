import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { normalizeProduct } from "../utils/normalize-product.js";

const router = Router();

const toggleSchema = z.object({
  productId: z.string(),
  listName: z.string().default("My Wishlist")
});

router.get("/", async (req, res) => {
  const items = await prisma.wishlistItem.findMany({
    where: { userId: req.user!.sub },
    include: { product: true },
    orderBy: { createdAt: "desc" }
  });
  return res.json(
    items.map((item: any) => ({
      ...item,
      product: normalizeProduct(item.product)
    }))
  );
});

router.post("/toggle", async (req, res) => {
  const parsed = toggleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
  }

  const userId = req.user!.sub;
  const existing = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId: parsed.data.productId
      }
    }
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    return res.json({ added: false });
  }

  await prisma.wishlistItem.create({
    data: {
      userId,
      productId: parsed.data.productId,
      listName: parsed.data.listName
    }
  });
  return res.json({ added: true });
});

export default router;