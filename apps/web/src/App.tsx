import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import {
  AIAssistantPage,
  AIStylePage,
  AlbumsPage,
  AnalyticsPage,
  BulkOrdersPage,
  CataloguePage,
  DashboardPage,
  FramesPage,
  HelpPage,
  LoyaltyPage,
  ModelingPage,
  NotificationsPage,
  OrdersPage,
  ProductDetailPage,
  ReferralPage,
  SettingsPage,
  ShopPage,
  StudioPage,
  WishlistPage,
  LogoCustomizerPage
} from "./pages/views";
import { SellerDashboard } from "./pages/SellerDashboard";

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<AppLayout />}
      >
        <Route index element={<Navigate to="view-shop" replace />} />

        <Route path="view-shop" element={<ShopPage />} />
        <Route path="view-product/:productId" element={<ProductDetailPage />} />
        <Route path="view-dashboard" element={<DashboardPage />} />
        <Route path="view-ai" element={<AIAssistantPage />} />
        <Route path="view-studio" element={<StudioPage />} />
        <Route path="view-albums" element={<AlbumsPage />} />
        <Route path="view-frames" element={<FramesPage />} />
        <Route path="view-modeling" element={<ModelingPage />} />
        <Route path="view-aistyle" element={<AIStylePage />} />
        <Route path="view-orders" element={<OrdersPage />} />
        <Route path="view-wishlist" element={<WishlistPage />} />
        <Route path="view-catalogue" element={<CataloguePage />} />
        <Route path="view-customize" element={<LogoCustomizerPage />} />
        <Route path="view-bulk" element={<BulkOrdersPage />} />
        <Route path="view-analytics" element={<AnalyticsPage />} />
        <Route path="view-settings" element={<SettingsPage />} />
        <Route path="view-notifications" element={<NotificationsPage />} />
        <Route path="view-loyalty" element={<LoyaltyPage />} />
        <Route path="view-referral" element={<ReferralPage />} />
        <Route path="view-help" element={<HelpPage />} />
        <Route path="view-seller-dashboard" element={<SellerDashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/view-shop" replace />} />
    </Routes>
  );
}