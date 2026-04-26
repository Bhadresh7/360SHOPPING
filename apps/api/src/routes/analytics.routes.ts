import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/summary", async (_req, res) => {
  const [divisionRevenue, topProducts, orderCount, users] = await Promise.all([
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        unitPaise: true,
        quantity: true
      }
    }),
    prisma.product.findMany({
      orderBy: [
        {
          reviewCount: "desc"
        }
      ],
      take: 6
    }),
    prisma.order.count(),
    prisma.user.count()
  ]);

  const productsById = await prisma.product.findMany({
    where: {
      id: { in: divisionRevenue.map((item: any) => item.productId) }
    }
  });

  const revenueByDivision = {
    STUDIO: 0,
    LUXE: 0,
    CORPORATE: 0
  };

  const productMap = new Map(productsById.map((product: any) => [product.id, product]));

  for (const row of divisionRevenue) {
    const product: any = productMap.get(row.productId);
    if (!product || !row._sum.quantity || !row._sum.unitPaise) {
      continue;
    }
    if (product.division in revenueByDivision) {
      revenueByDivision[product.division as keyof typeof revenueByDivision] += row._sum.quantity * row._sum.unitPaise;
    }
  }

  return res.json({
    kpis: {
      revenueByDivision,
      orderCount,
      users,
      aiConversionRate: 0.29,
      csat: 4.6
    },
    topProducts
  });
});

export default router;