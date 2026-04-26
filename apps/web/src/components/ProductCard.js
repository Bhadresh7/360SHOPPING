import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import { formatINR } from "../lib/format";
import { useApp } from "../context/AppContext";
export function ProductCard({ product }) {
    const navigate = useNavigate();
    const { addToCart, toggleWish, wishlist } = useApp();
    const wished = wishlist.some((item) => item.product.id === product.id);
    return (_jsxs("article", { className: "card product-card reveal-card tilt-card", tabIndex: 0, children: [_jsx("button", { type: "button", className: `heart-btn ${wished ? "active" : ""}`, onClick: () => void toggleWish(product.id), "aria-label": "Toggle wishlist", children: "\u2665" }), _jsx("button", { className: "image-tile", type: "button", onClick: () => navigate(`/view-product/${product.id}`), children: _jsx("span", { children: product.imageEmoji }) }), _jsxs("div", { className: "product-badges", children: [product.isNew && _jsx("span", { className: "badge badge-green", children: "New" }), product.isSale && _jsx("span", { className: "badge badge-red", children: "Sale" }), product.isLimited && _jsx("span", { className: "badge badge-gold", children: "Limited" })] }), _jsx("h3", { children: product.name }), _jsx("p", { className: "muted", children: product.fabric }), _jsxs("div", { className: "rating-row", children: [_jsx("span", { children: "★".repeat(Math.round(product.rating)) }), _jsxs("small", { children: [product.reviewCount, " reviews"] })] }), _jsxs("div", { className: "price-row", children: [_jsx("strong", { children: formatINR(product.pricePaise) }), product.originalPaise ? _jsx("s", { children: formatINR(product.originalPaise) }) : null] }), _jsx("div", { className: "size-dots", children: (product.sizes ?? []).slice(0, 5).map((size) => (_jsx("span", { children: size }, size))) }), _jsx("button", { type: "button", className: "btn-gold", onClick: () => void addToCart({
                    productId: product.id,
                    size: product.sizes?.[0] ?? "M",
                    color: "Default",
                    quantity: 1
                }), children: "Add to Cart" }), product.stock <= 3 ? _jsxs("small", { className: "stock-warn", children: ["Only ", product.stock, " left"] }) : null] }));
}
