import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { normalizeProduct } from "../utils/normalize-product.js";

const router = Router();

const addSchema = z.object({
  productId: z.string().min(1),
  size: z.string().min(1),
  color: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(10)
});

const updateSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(10)
});

async function getCart(userId: string) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: "desc" }
  });

  const subtotalPaise = items.reduce((sum, item) => sum + item.product.pricePaise * item.quantity, 0);
  const shippingPaise = subtotalPaise > 300000 ? 0 : 39900;
  const taxPaise = Math.round(subtotalPaise * 0.12);

  return {
    items: items.map((item) => ({
      ...item,
      product: normalizeProduct(item.product)
    })),
    summary: {
      subtotalPaise,
      shippingPaise,
      taxPaise,
      totalPaise: subtotalPaise + shippingPaise + taxPaise,
      count: items.reduce((sum, item) => sum + item.quantity, 0)
    }
  };
}

router.get("/", async (req, res) => {
  const userId = req.user!.sub;
  return res.json(await getCart(userId));
});

router.post("/add", async (req, res) => {
  const parsed = addSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
  }

  const userId = req.user!.sub;
  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const existing = await prisma.cartItem.findFirst({
    where: {
      userId,
      productId: parsed.data.productId,
      size: parsed.data.size,
      color: parsed.data.color
    }
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: Math.min(10, existing.quantity + parsed.data.quantity) }
    });
  } else {
    await prisma.cartItem.create({
      data: {
        userId,
        productId: parsed.data.productId,
        size: parsed.data.size,
        color: parsed.data.color,
        quantity: parsed.data.quantity
      }
    });
  }

  return res.status(201).json(await getCart(userId));
});

router.patch("/:id", async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
  }

  const userId = req.user!.sub;
  const item = await prisma.cartItem.findUnique({ where: { id: req.params.id } });
  if (!item || item.userId !== userId) {
    return res.status(404).json({ message: "Cart item not found" });
  }

  await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity: parsed.data.quantity }
  });

  return res.json(await getCart(userId));
});

router.delete("/:id", async (req, res) => {
  const userId = req.user!.sub;
  const item = await prisma.cartItem.findUnique({ where: { id: req.params.id } });
  if (!item || item.userId !== userId) {
    return res.status(404).json({ message: "Cart item not found" });
  }

  await prisma.cartItem.delete({ where: { id: item.id } });
  return res.json(await getCart(userId));
});

export default router;