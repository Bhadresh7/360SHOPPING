import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchGlobal } from "../lib/api";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
export function SearchModal() {
    const navigate = useNavigate();
    const { searchOpen, setSearchOpen } = useApp();
    const { toast } = useToast();
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState({ pages: [], products: [], orders: [], help: [] });
    useEffect(() => {
        if (!searchOpen || query.trim().length < 2) {
            setResult({ pages: [], products: [], orders: [], help: [] });
            return;
        }
        const timer = window.setTimeout(async () => {
            try {
                setLoading(true);
                const data = await searchGlobal(query);
                setResult(data);
            }
            catch {
                toast("Search is currently unavailable", "warning", 1800);
            }
            finally {
                setLoading(false);
            }
        }, 250);
        return () => window.clearTimeout(timer);
    }, [query, searchOpen, toast]);
    const isEmpty = useMemo(() => !loading &&
        result.pages.length === 0 &&
        result.products.length === 0 &&
        result.orders.length === 0 &&
        result.help.length === 0, [loading, result]);
    if (!searchOpen) {
        return null;
    }
    return (_jsx("div", { className: "search-overlay", role: "presentation", onClick: () => setSearchOpen(false), children: _jsxs("div", { className: "search-modal", role: "dialog", "aria-modal": "true", onClick: (event) => event.stopPropagation(), children: [_jsxs("div", { className: "search-head", children: [_jsx("input", { autoFocus: true, value: query, onChange: (event) => setQuery(event.target.value), placeholder: "Search pages, products, orders, help..." }), _jsx("button", { type: "button", onClick: () => setSearchOpen(false), className: "icon-btn", children: "\u2715" })] }), _jsxs("div", { className: "search-body", children: [loading ? (_jsxs("div", { className: "skeleton-list", children: [_jsx("div", { className: "skeleton h-72" }), _jsx("div", { className: "skeleton h-72" }), _jsx("div", { className: "skeleton h-72" })] })) : (_jsxs(_Fragment, { children: [_jsxs("section", { children: [_jsx("h4", { children: "Pages" }), _jsx("div", { className: "search-list", children: result.pages.map((page) => (_jsx("button", { type: "button", onClick: () => {
                                                    navigate(`/${page.route}`);
                                                    setSearchOpen(false);
                                                }, children: page.label }, page.route))) })] }), _jsxs("section", { children: [_jsx("h4", { children: "Products" }), _jsx("div", { className: "search-list", children: result.products.map((product) => (_jsxs("button", { type: "button", onClick: () => {
                                                    navigate(`/view-product/${product.id}`);
                                                    setSearchOpen(false);
                                                }, children: [product.imageEmoji, " ", product.name] }, product.id))) })] }), _jsxs("section", { children: [_jsx("h4", { children: "Orders" }), _jsx("div", { className: "search-list", children: result.orders.map((order) => (_jsxs("button", { type: "button", onClick: () => {
                                                    navigate("/view-orders");
                                                    setSearchOpen(false);
                                                }, children: [order.orderNo, " \u00B7 ", order.status] }, order.id))) })] }), _jsxs("section", { children: [_jsx("h4", { children: "Help" }), _jsx("div", { className: "search-list", children: result.help.map((item) => (_jsx("button", { type: "button", onClick: () => {
                                                    navigate("/view-help");
                                                    setSearchOpen(false);
                                                }, children: item }, item))) })] })] })), isEmpty ? (_jsxs("div", { className: "empty-state compact", children: [_jsx("span", { children: "\uD83D\uDD0E" }), _jsx("h4", { children: "No matches yet" }), _jsx("p", { children: "Try keywords like order, studio, saree, rewards, or support." })] })) : null] })] }) }));
}
