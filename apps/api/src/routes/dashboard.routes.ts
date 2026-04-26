import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/overview", async (req, res) => {
  const userId = req.user!.sub;

  const [orders, studioBookings, wishlistCount, cartCount, user, rewards] = await Promise.all([
    prisma.order.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.studioBooking.findMany({ where: { userId }, orderBy: { bookingDate: "desc" }, take: 10 }),
    prisma.wishlistItem.count({ where: { userId } }),
    prisma.cartItem.findMany({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.rewardTransaction.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5 })
  ]);

  const revenuePaise = orders.reduce((sum, order) => sum + order.totalPaise, 0) + studioBookings.reduce((sum, booking) => sum + booking.amountPaise, 0);

  const nextBooking = studioBookings
    .filter((booking) => booking.bookingDate > new Date())
    .sort((a, b) => a.bookingDate.getTime() - b.bookingDate.getTime())[0];

  // Build activity feed from real data
  const activityFeed = [
    ...orders.map((o: any) => ({ id: o.id, type: "Fashion", text: `Order ${o.orderNo}`, detail: `${o.status} · ₹${(o.totalPaise / 100).toLocaleString()}`, createdAt: o.createdAt })),
    ...studioBookings.map((b: any) => ({ id: b.id, type: "Studio", text: b.sessionType, detail: `${b.status} · ${b.duration}`, createdAt: b.createdAt })),
    ...rewards.map((r: any) => ({ id: r.id, type: "AI", text: r.title, detail: `${r.direction === "EARN" ? "+" : "-"}${r.points} points`, createdAt: r.createdAt }))
  ].sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 8);

  return res.json({
    metrics: {
      totalRevenuePaise: revenuePaise,
      totalOrders: orders.length,
      totalBookings: studioBookings.length,
      wishlistCount,
      cartCount: cartCount.reduce((sum: number, item: any) => sum + item.quantity, 0),
      loyaltyPoints: user?.loyaltyPoints ?? 0
    },
    quickStats: [
      nextBooking
        ? `Next session in ${Math.ceil((nextBooking.bookingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days`
        : "No upcoming studio session",
      `${orders.filter((order: any) => order.status === "IN_TRANSIT").length} order arriving`,
      `${Math.max(3, wishlistCount)} AI picks waiting`
    ],
    activityFeed: activityFeed.map((a: any) => ({
      ...a,
      time: "Recent"
    })),
    revenueHistory: {
      labels: ["Past", "Recent", "Now"],
      studio: [0, 0, studioBookings.reduce((sum: number, b: any) => sum + b.amountPaise, 0) / 10000],
      luxe: [0, 0, orders.reduce((sum: number, o: any) => sum + o.totalPaise, 0) / 10000],
      corp: [0, 0, 0]
    }
  });
});

export default router;