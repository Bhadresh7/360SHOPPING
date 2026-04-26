import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

const pages = [
  { route: "view-dashboard", label: "Dashboard" },
  { route: "view-studio", label: "Studio Bookings" },
  { route: "view-shop", label: "Udhikxa Luxe Shop" },
  { route: "view-catalogue", label: "Corporate Gift Catalogue" },
  { route: "view-orders", label: "My Orders" },
  { route: "view-analytics", label: "Analytics" },
  { route: "view-help", label: "Help & Support" }
];

router.get("/", async (req, res) => {
  const query = String(req.query.q ?? "").trim();
  if (!query) {
    return res.json({ pages: [], products: [], orders: [], help: [] });
  }

  const [products, orders] = await Promise.all([
    prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { category: { contains: query } },
          { description: { contains: query } }
        ]
      },
      take: 8
    }),
    prisma.order.findMany({
      where: {
        userId: req.user!.sub,
        orderNo: { contains: query }
      },
      take: 6
    })
  ]);

  const pageResults = pages.filter((page) => page.label.toLowerCase().includes(query.toLowerCase()));
  const help = [
    "How to track my order",
    "How studio rescheduling works",
    "How to redeem loyalty points",
    "How to request returns"
  ].filter((item) => item.toLowerCase().includes(query.toLowerCase()));

  return res.json({
    pages: pageResults,
    products,
    orders,
    help
  });
});

export default router;