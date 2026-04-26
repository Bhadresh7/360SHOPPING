import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  const type = req.query.type as string | undefined;

  const notifications = await prisma.notification.findMany({
    where: {
      userId: req.user!.sub,
      ...(type ? { type } : {})
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return res.json({
    unread: notifications.filter((item) => !item.isRead).length,
    items: notifications
  });
});

router.post("/mark-all-read", async (req, res) => {
  await prisma.notification.updateMany({
    where: {
      userId: req.user!.sub,
      isRead: false
    },
    data: {
      isRead: true
    }
  });

  return res.status(204).send();
});

router.post("/:id/read", async (req, res) => {
  const item = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!item || item.userId !== req.user!.sub) {
    return res.status(404).json({ message: "Notification not found" });
  }

  await prisma.notification.update({
    where: { id: item.id },
    data: { isRead: true }
  });

  return res.status(204).send();
});

export default router;