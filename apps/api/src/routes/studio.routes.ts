import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { parseAddOns } from "../utils/normalize-product.js";

const router = Router();

const bookingSchema = z.object({
  sessionType: z.string().min(3),
  bookingDate: z.coerce.date(),
  duration: z.enum(["1hr", "2hr", "Half-day", "Full-day"]),
  amountPaise: z.coerce.number().int().min(100000),
  addOns: z.array(z.string()).default([])
});

router.get("/bookings", async (req, res) => {
  const bookings = await prisma.studioBooking.findMany({
    where: { userId: req.user!.sub },
    orderBy: { bookingDate: "asc" }
  });

  return res.json(
    bookings.map((booking) => ({
      ...booking,
      addOns: parseAddOns(booking.addOns)
    }))
  );
});

router.post("/bookings", async (req, res) => {
  const parsed = bookingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
  }

  const booking = await prisma.studioBooking.create({
    data: {
      userId: req.user!.sub,
      sessionType: parsed.data.sessionType,
      bookingDate: parsed.data.bookingDate,
      duration: parsed.data.duration,
      amountPaise: parsed.data.amountPaise,
      addOns: JSON.stringify(parsed.data.addOns),
      status: "PENDING"
    }
  });

  await prisma.notification.create({
    data: {
      userId: req.user!.sub,
      type: "STUDIO",
      title: "Studio Request Created",
      description: `Your ${parsed.data.sessionType} request is now under confirmation.`,
      actionRoute: "view-studio"
    }
  });

  return res.status(201).json({
    ...booking,
    addOns: parseAddOns(booking.addOns)
  });
});

export default router;