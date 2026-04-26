import { Router } from "express";
import authRoutes from "./auth.routes.js";
import productsRoutes from "./products.routes.js";
import cartRoutes from "./cart.routes.js";
import wishlistRoutes from "./wishlist.routes.js";
import ordersRoutes from "./orders.routes.js";
import studioRoutes from "./studio.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import notificationsRoutes from "./notifications.routes.js";
import analyticsRoutes from "./analytics.routes.js";
import settingsRoutes from "./settings.routes.js";
import searchRoutes from "./search.routes.js";
import albumsRoutes from "./albums.routes.js";
import framesRoutes from "./frames.routes.js";
import modelsRoutes from "./models.routes.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "360shopie-api" });
});

router.use("/auth", authRoutes);
router.use("/products", productsRoutes);

router.use(requireAuth);
router.use("/dashboard", dashboardRoutes);
router.use("/cart", cartRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/orders", ordersRoutes);
router.use("/studio", studioRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/settings", settingsRoutes);
router.use("/search", searchRoutes);
router.use("/albums", albumsRoutes);
router.use("/frames", framesRoutes);
router.use("/models", modelsRoutes);

export default router;