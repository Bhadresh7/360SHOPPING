import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { normalizeProduct } from "../utils/normalize-product.js";

const router = Router();

const createOrderSchema = z.object({
  paymentMethod: z.enum(["UPI", "Card", "NetBanking", "COD"]),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(10),
        size: z.string().min(1),
        color: z.string().min(1)
      })
    )
    .min(1)
});

router.get("/", async (req, res) => {
  const status = req.query.status as string | undefined;

  const orders = await prisma.order.findMany({
    where: {
      userId: req.user!.sub,
      ...(status ? { status } : {})
    },
    include: {
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return res.json(
    orders.map((order: any) => ({
      ...order,
      items: order.items.map((item: any) => ({
        ...item,
        product: normalizeProduct(item.product)
      }))
    }))
  );
});

router.post("/", async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
  }

  const productIds = parsed.data.items.map((item: any) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } }
  });

  if (products.length !== parsed.data.items.length) {
    return res.status(400).json({ message: "One or more products are invalid" });
  }

  const productMap = new Map(products.map((product: any) => [product.id, product]));
  const totalPaise = parsed.data.items.reduce((sum: number, item: any) => {
    const product: any = productMap.get(item.productId)!;
    return sum + product.pricePaise * item.quantity;
  }, 0);

  const orderNo = `SH${Math.floor(100000 + Math.random() * 900000)}`;

  const order = await prisma.order.create({
    data: {
      orderNo,
      userId: req.user!.sub,
      paymentMethod: parsed.data.paymentMethod,
      totalPaise,
      status: "PROCESSING",
      items: {
        create: parsed.data.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          unitPaise: (productMap.get(item.productId) as any)!.pricePaise
        }))
      }
    },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });

  await prisma.notification.create({
    data: {
      userId: req.user!.sub,
      type: "SYSTEM",
      title: "Order Created",
      description: `Your order ${order.orderNo} is now processing.`,
      actionRoute: "view-orders"
    }
  });

  await prisma.rewardTransaction.create({
    data: {
      userId: req.user!.sub,
      title: `Order ${order.orderNo}`,
      points: Math.floor(totalPaise / 1000),
      direction: "EARN"
    }
  });

  await prisma.user.update({
    where: { id: req.user!.sub },
    data: {
      loyaltyPoints: {
        increment: Math.floor(totalPaise / 1000)
      }
    }
  });

  return res.status(201).json({
    ...order,
    items: order.items.map((item: any) => ({
      ...item,
      product: normalizeProduct(item.product)
    }))
  });
});

export default router;