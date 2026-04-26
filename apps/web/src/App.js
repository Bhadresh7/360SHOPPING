import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { useApp } from "./context/AppContext";
import { AIAssistantPage, AIStylePage, AlbumsPage, AnalyticsPage, BulkOrdersPage, CataloguePage, DashboardPage, FramesPage, HelpPage, LoyaltyPage, ModelingPage, NotificationsPage, OrdersPage, ProductDetailPage, ReferralPage, SettingsPage, ShopPage, StudioPage, WishlistPage, LogoCustomizerPage } from "./pages/views";
import { LoginPage } from "./pages/LoginPage";
function Protected({ children }) {
    const { token } = useApp();
    const location = useLocation();
    if (!token) {
        return _jsx(Navigate, { to: "/login", state: { from: location.pathname }, replace: true });
    }
    return children;
}
export default function App() {
    const { token } = useApp();
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: token ? _jsx(Navigate, { to: "/view-dashboard", replace: true }) : _jsx(LoginPage, {}) }), _jsxs(Route, { path: "/", element: _jsx(Protected, { children: _jsx(AppLayout, {}) }), children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: "view-dashboard", replace: true }) }), _jsx(Route, { path: "view-dashboard", element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "view-ai", element: _jsx(AIAssistantPage, {}) }), _jsx(Route, { path: "view-studio", element: _jsx(StudioPage, {}) }), _jsx(Route, { path: "view-albums", element: _jsx(AlbumsPage, {}) }), _jsx(Route, { path: "view-frames", element: _jsx(FramesPage, {}) }), _jsx(Route, { path: "view-modeling", element: _jsx(ModelingPage, {}) }), _jsx(Route, { path: "view-shop", element: _jsx(ShopPage, {}) }), _jsx(Route, { path: "view-product/:productId", element: _jsx(ProductDetailPage, {}) }), _jsx(Route, { path: "view-aistyle", element: _jsx(AIStylePage, {}) }), _jsx(Route, { path: "view-orders", element: _jsx(OrdersPage, {}) }), _jsx(Route, { path: "view-wishlist", element: _jsx(WishlistPage, {}) }), _jsx(Route, { path: "view-catalogue", element: _jsx(CataloguePage, {}) }), _jsx(Route, { path: "view-customize", element: _jsx(LogoCustomizerPage, {}) }), _jsx(Route, { path: "view-bulk", element: _jsx(BulkOrdersPage, {}) }), _jsx(Route, { path: "view-analytics", element: _jsx(AnalyticsPage, {}) }), _jsx(Route, { path: "view-settings", element: _jsx(SettingsPage, {}) }), _jsx(Route, { path: "view-notifications", element: _jsx(NotificationsPage, {}) }), _jsx(Route, { path: "view-loyalty", element: _jsx(LoyaltyPage, {}) }), _jsx(Route, { path: "view-referral", element: _jsx(ReferralPage, {}) }), _jsx(Route, { path: "view-help", element: _jsx(HelpPage, {}) })] }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: token ? "/view-dashboard" : "/login", replace: true }) })] }));
}
