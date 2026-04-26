import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { formatINRFromPaise } from "../utils/money.js";
import { normalizeProduct } from "../utils/normalize-product.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const listSchema = z.object({
  division: z.enum(["STUDIO", "LUXE", "CORPORATE"]).optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z
    .enum(["newest", "best", "low-high", "high-low", "rating", "eco"])
    .default("newest")
});

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  category: z.string().min(1),
  division: z.enum(["STUDIO", "LUXE", "CORPORATE"]).default("LUXE"),
  stock: z.number().int().nonnegative().default(1),
  fabric: z.string().default("General"),
  colors: z.string().default("Standard"),
  sizes: z.string().default("One Size"),
  tags: z.string().default("user-sold")
});

router.get("/", async (req, res) => {
  const parsed = listSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid query" });
  }

  const { division, search, category, minPrice, maxPrice, sort } = parsed.data;

  const where = {
    ...(division ? { division } : {}),
    ...(category ? { category } : {}),
    ...(search
      ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
          { fabric: { contains: search, mode: 'insensitive' as const } }
        ]
      }
      : {}),
    ...(minPrice ? { pricePaise: { gte: minPrice * 100 } } : {}),
    ...(maxPrice ? { pricePaise: { lte: maxPrice * 100 } } : {})
  };

  const orderByMap = {
    newest: { createdAt: "desc" as const },
    best: { reviewCount: "desc" as const },
    "low-high": { pricePaise: "asc" as const },
    "high-low": { pricePaise: "desc" as const },
    rating: { rating: "desc" as const },
    eco: { ecoScore: "desc" as const }
  };

  const products = await prisma.product.findMany({
    where,
    orderBy: orderByMap[sort],
    include: {
      seller: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });

  return res.json(
    products.map((product) => ({
      ...normalizeProduct(product),
      price: formatINRFromPaise(product.pricePaise),
      originalPrice: product.originalPaise ? formatINRFromPaise(product.originalPaise) : null,
      seller: product.seller
    }))
  );
});

router.get("/me", requireAuth, async (req, res) => {
  const userId = req.user!.sub;

  const products = await prisma.product.findMany({
    where: { sellerId: userId },
    orderBy: { createdAt: "desc" }
  });

  return res.json(
    products.map((product) => ({
      ...normalizeProduct(product),
      price: formatINRFromPaise(product.pricePaise),
      originalPrice: product.originalPaise ? formatINRFromPaise(product.originalPaise) : null
    }))
  );
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid data", errors: parsed.error.format() });
  }

  const userId = req.user!.sub;
  const { name, description, price, category, division, stock, fabric, colors, sizes, tags } = parsed.data;

  const product = await prisma.product.create({
    data: {
      sku: `US-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      description,
      pricePaise: Math.round(price * 100),
      category,
      division,
      stock,
      fabric,
      colors,
      sizes,
      tags,
      sellerId: userId,
      imageEmoji: "📦"
    }
  });

  return res.status(201).json({
    ...normalizeProduct(product),
    price: formatINRFromPaise(product.pricePaise)
  });
});

router.get("/:id", async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      seller: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json({
    ...normalizeProduct(product),
    price: formatINRFromPaise(product.pricePaise),
    originalPrice: product.originalPaise ? formatINRFromPaise(product.originalPaise) : null,
    seller: product.seller
  });
});

export default router;