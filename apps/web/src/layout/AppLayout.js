import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ToastViewport } from "../components/ToastViewport";
import { SearchModal } from "../components/SearchModal";
import { CartDrawer } from "../components/CartDrawer";
import { ModalRoot } from "../components/ModalRoot";
import { useApp } from "../context/AppContext";
gsap.registerPlugin(ScrollTrigger);
export function AppLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { notificationsUnread, cart, setSearchOpen, setCartDrawerOpen } = useApp();
    const [collapsed, setCollapsed] = useState(false);
    const mainRef = useRef(null);
    const sections = useMemo(() => [
        {
            title: "Home",
            items: [
                { icon: "🏠", label: "Dashboard", route: "view-dashboard" },
                { icon: "⭐", label: "Rewards", route: "view-loyalty" },
                { icon: "🔔", label: "Notifications", route: "view-notifications", badge: notificationsUnread }
            ]
        },
        {
            title: "360Studio",
            items: [
                { icon: "📸", label: "Studio Bookings", route: "view-studio" },
                { icon: "🖼", label: "Digital Albums", route: "view-albums" },
                { icon: "📺", label: "Smart Frames", route: "view-frames" },
                { icon: "💎", label: "Model Selection", route: "view-modeling" }
            ]
        },
        {
            title: "Udhikxa Luxe",
            items: [
                { icon: "🛍", label: "Shop", route: "view-shop" },
                { icon: "✨", label: "AI Style Match", route: "view-aistyle" },
                { icon: "📦", label: "My Orders", route: "view-orders" },
                { icon: "♡", label: "Wishlist", route: "view-wishlist", badge: cart?.summary.count },
                { icon: "🛒", label: "Cart", route: "view-shop", drawer: "cart" }
            ]
        },
        {
            title: "Corporate Gifts",
            items: [
                { icon: "📋", label: "Gift Catalogue", route: "view-catalogue" },
                { icon: "🎨", label: "Logo Customizer", route: "view-customize" },
                { icon: "🏭", label: "Bulk Orders", route: "view-bulk" }
            ]
        },
        {
            title: "Platform",
            items: [
                { icon: "🤖", label: "AI Assistant", route: "view-ai" },
                { icon: "📈", label: "Analytics", route: "view-analytics" },
                { icon: "⚙️", label: "Settings", route: "view-settings" },
                { icon: "👥", label: "Refer & Earn", route: "view-referral" },
                { icon: "❓", label: "Help & Support", route: "view-help" }
            ]
        }
    ], [notificationsUnread, cart?.summary.count]);
    useEffect(() => {
        const onKeyDown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                setSearchOpen(true);
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [setSearchOpen]);
    useEffect(() => {
        const page = document.querySelector(".view.active");
        if (!page) {
            return;
        }
        gsap.from(page.querySelectorAll(".metric"), {
            y: 30,
            opacity: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: "power3.out"
        });
        gsap.from(page.querySelectorAll(".card"), {
            y: 24,
            opacity: 0,
            duration: 0.45,
            stagger: 0.06,
            delay: 0.1,
            ease: "power2.out"
        });
    }, [location.pathname]);
    useEffect(() => {
        const main = mainRef.current;
        if (!main) {
            return;
        }
        const updateParallax = () => {
            const scrollTop = main.scrollTop;
            main.querySelectorAll("[data-parallax]").forEach((element) => {
                const speed = Number(element.dataset.parallax ?? "0.3");
                element.style.transform = `translateY(${scrollTop * speed}px)`;
            });
        };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("revealed");
                }
            });
        }, { threshold: 0.15 });
        main.querySelectorAll(".reveal-card").forEach((node) => observer.observe(node));
        main.addEventListener("scroll", updateParallax);
        updateParallax();
        return () => {
            main.removeEventListener("scroll", updateParallax);
            observer.disconnect();
        };
    }, [location.pathname]);
    useEffect(() => {
        const setupMagnetic = (selector, scale = 1.04) => {
            const buttons = Array.from(document.querySelectorAll(selector));
            const handlers = buttons.map((button) => {
                const onMove = (event) => {
                    const rect = button.getBoundingClientRect();
                    const dx = (event.clientX - rect.left - rect.width / 2) * 0.25;
                    const dy = (event.clientY - rect.top - rect.height / 2) * 0.25;
                    button.style.transform = `translate(${Math.max(-8, Math.min(8, dx))}px, ${Math.max(-8, Math.min(8, dy))}px) scale(${scale})`;
                };
                const onLeave = () => {
                    button.style.transform = "translate(0,0) scale(1)";
                };
                button.addEventListener("mousemove", onMove);
                button.addEventListener("mouseleave", onLeave);
                return () => {
                    button.removeEventListener("mousemove", onMove);
                    button.removeEventListener("mouseleave", onLeave);
                };
            });
            return () => handlers.forEach((remove) => remove());
        };
        const setupTilt = () => {
            const cards = Array.from(document.querySelectorAll(".tilt-card"));
            const handlers = cards.map((card) => {
                const onMove = (event) => {
                    const rect = card.getBoundingClientRect();
                    const x = (event.clientY - rect.top - rect.height / 2) / 10;
                    const y = -(event.clientX - rect.left - rect.width / 2) / 10;
                    card.style.transform = `perspective(600px) rotateX(${x}deg) rotateY(${y}deg) scale(1.02)`;
                };
                const onLeave = () => {
                    card.style.transform = "translateZ(0)";
                };
                card.addEventListener("mousemove", onMove);
                card.addEventListener("mouseleave", onLeave);
                return () => {
                    card.removeEventListener("mousemove", onMove);
                    card.removeEventListener("mouseleave", onLeave);
                };
            });
            return () => handlers.forEach((remove) => remove());
        };
        const cleanupMagneticGold = setupMagnetic(".btn-gold");
        const cleanupMagneticCorp = setupMagnetic(".btn-corp");
        const cleanupTilt = setupTilt();
        return () => {
            cleanupMagneticGold();
            cleanupMagneticCorp();
            cleanupTilt();
        };
    }, [location.pathname]);
    useEffect(() => {
        const glow = document.getElementById("cursorGlow");
        if (!glow || window.innerWidth < 768) {
            return;
        }
        const onMove = (event) => {
            glow.style.left = `${event.clientX}px`;
            glow.style.top = `${event.clientY}px`;
        };
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
    }, []);
    return (_jsxs("div", { className: "app-shell", children: [_jsx("div", { id: "cursorGlow" }), _jsx(Sidebar, { collapsed: collapsed, sections: sections, onToggle: () => setCollapsed((value) => !value), onOpenCart: () => setCartDrawerOpen(true) }), _jsxs("div", { className: "content-shell", children: [_jsx(Topbar, { onOpenSearch: () => setSearchOpen(true) }), _jsx("main", { className: "main", ref: mainRef, children: _jsx(Outlet, {}) })] }), _jsxs("nav", { className: "mobile-nav", children: [_jsx("button", { type: "button", onClick: () => navigate("/view-dashboard"), children: "\uD83C\uDFE0" }), _jsx("button", { type: "button", onClick: () => navigate("/view-studio"), children: "\uD83D\uDCF8" }), _jsx("button", { type: "button", onClick: () => navigate("/view-shop"), children: "\uD83D\uDECD" }), _jsx("button", { type: "button", onClick: () => navigate("/view-catalogue"), children: "\uD83C\uDF81" }), _jsx("button", { type: "button", onClick: () => navigate("/view-ai"), children: "\uD83E\uDD16" })] }), _jsx(SearchModal, {}), _jsx(CartDrawer, {}), _jsx(ModalRoot, {}), _jsx(ToastViewport, {})] }));
}
