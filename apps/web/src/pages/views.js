import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createStudioBooking, getAnalyticsSummary, getDashboard, getNotifications, getOrders, getProduct, getProducts, getStudioBookings, markAllNotificationsRead, markNotificationRead } from "../lib/api";
import { formatCompactINR, formatDate, formatINR, formatNumberIndian, formatRelative } from "../lib/format";
import { useApp } from "../context/AppContext";
import { useModal } from "../context/ModalContext";
import { useToast } from "../context/ToastContext";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { ProductCard } from "../components/ProductCard";
function ViewContainer({ id, children }) {
    return (_jsx("section", { id: id, className: "view active", children: children }));
}
function Sparkline({ points }) {
    const max = Math.max(...points, 1);
    const mapped = points
        .map((point, index) => {
        const x = (index / (points.length - 1 || 1)) * 100;
        const y = 100 - (point / max) * 100;
        return `${x},${y}`;
    })
        .join(" ");
    return (_jsx("svg", { className: "sparkline", viewBox: "0 0 100 100", preserveAspectRatio: "none", "aria-hidden": "true", children: _jsx("polyline", { points: mapped }) }));
}
function EmptyState({ icon, title, description, action }) {
    return (_jsxs("div", { className: "empty-state", children: [_jsx("span", { children: icon }), _jsx("h3", { children: title }), _jsx("p", { children: description }), action] }));
}
const activitySeed = [
    { id: "a1", type: "Studio", text: "New corporate headshot request", detail: "10 participants · 2PM", time: "3m ago" },
    { id: "a2", type: "Fashion", text: "AI style pick saved", detail: "Linen Summer Dress · 94%", time: "17m ago" },
    { id: "a3", type: "Corporate", text: "Bulk enquiry received", detail: "MOQ 250 · Festive kit", time: "39m ago" },
    { id: "a4", type: "AI", text: "New personalization insight", detail: "Warm Autumn profile updated", time: "1h ago" }
];
const revenueByPeriod = {
    Day: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        studio: [52, 60, 58, 72, 66, 70, 75],
        luxe: [38, 42, 48, 46, 55, 59, 64],
        corp: [22, 24, 33, 37, 42, 40, 48]
    },
    Week: {
        labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7"],
        studio: [280, 310, 295, 344, 360, 372, 386],
        luxe: [190, 210, 228, 235, 241, 254, 269],
        corp: [132, 140, 153, 166, 172, 185, 199]
    },
    Month: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        studio: [1200, 1280, 1330, 1400, 1490, 1570, 1630],
        luxe: [980, 1040, 1100, 1180, 1210, 1260, 1340],
        corp: [740, 780, 810, 860, 902, 960, 1020]
    },
    Year: {
        labels: ["2020", "2021", "2022", "2023", "2024", "2025", "2026"],
        studio: [6400, 7300, 8200, 9140, 10100, 11100, 12450],
        luxe: [5200, 6100, 7000, 7800, 8620, 9360, 10210],
        corp: [4400, 4890, 5300, 5900, 6520, 7110, 7680]
    }
};
function buildPath(values, max, width = 660, height = 200) {
    if (values.length === 0)
        return "";
    const step = width / Math.max(values.length - 1, 1);
    return values
        .map((value, index) => {
        const x = index * step;
        const y = height - (value / max) * height;
        return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
        .join(" ");
}
export function DashboardPage() {
    const navigate = useNavigate();
    const { user } = useApp();
    const [overview, setOverview] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("Month");
    const [activityFilter, setActivityFilter] = useState("All");
    const [calendarMode, setCalendarMode] = useState("month");
    useEffect(() => {
        let mounted = true;
        async function bootstrap() {
            try {
                setLoading(true);
                const [overviewData, productsData] = await Promise.all([getDashboard(), getProducts({ division: "LUXE" })]);
                if (!mounted)
                    return;
                setOverview(overviewData);
                setProducts(productsData.slice(0, 6));
            }
            finally {
                if (mounted)
                    setLoading(false);
            }
        }
        void bootstrap();
        return () => {
            mounted = false;
        };
    }, []);
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12)
            return "Morning";
        if (hour < 17)
            return "Afternoon";
        return "Evening";
    }, []);
    const activeSeries = revenueByPeriod[period];
    const chartMax = Math.max(...activeSeries.studio, ...activeSeries.luxe, ...activeSeries.corp, 1);
    const hoveredPoint = activeSeries.labels.length - 1;
    const metrics = [
        {
            title: "Total Revenue",
            value: overview?.metrics.totalRevenuePaise ?? 0,
            prefix: "₹",
            route: "/view-analytics",
            points: [12, 18, 15, 24, 29, 35, 39],
            change: "+12.4%"
        },
        {
            title: "Orders",
            value: overview?.metrics.totalOrders ?? 0,
            route: "/view-orders",
            points: [8, 9, 11, 14, 13, 17, 19],
            change: "+7.1%"
        },
        {
            title: "Studio Sessions",
            value: overview?.metrics.totalBookings ?? 0,
            route: "/view-studio",
            points: [2, 3, 4, 5, 6, 6, 8],
            change: "+9.8%"
        },
        {
            title: "Wishlist",
            value: overview?.metrics.wishlistCount ?? 0,
            route: "/view-wishlist",
            points: [3, 6, 5, 7, 9, 11, 10],
            change: "+5.6%"
        }
    ];
    const filteredActivity = activitySeed.filter((item) => activityFilter === "All" || item.type === activityFilter);
    return (_jsxs(ViewContainer, { id: "view-dashboard", children: [_jsxs("section", { className: "hero-card", "data-parallax": "0.3", children: [_jsxs("h2", { children: ["Good ", greeting, ", ", user?.name.split(" ")[0] ?? "Creator"] }), _jsx("p", { style: { marginTop: 6 }, children: "Today at a glance for 360Studio, Udhikxa Luxe, and Corporate Gifts." }), _jsx("div", { className: "quick-pill-strip", children: (overview?.quickStats ?? ["Next session in 2 days", "1 order arriving", "3 AI picks waiting"]).map((stat) => (_jsx("span", { children: stat }, stat))) })] }), loading ? (_jsxs("div", { className: "skeleton-list", children: [_jsx("div", { className: "skeleton h-72" }), _jsx("div", { className: "skeleton h-72" }), _jsx("div", { className: "skeleton h-72" })] })) : (_jsxs(_Fragment, { children: [_jsx("section", { className: "metrics-grid", children: metrics.map((metric) => (_jsxs("button", { type: "button", className: "card metric", onClick: () => navigate(metric.route), children: [_jsx("h4", { children: metric.title }), _jsx(AnimatedCounter, { value: metric.value / (metric.prefix ? 100 : 1), prefix: metric.prefix }), _jsxs("small", { style: { color: "var(--green)" }, children: ["\u2197 ", metric.change] }), _jsx(Sparkline, { points: metric.points })] }, metric.title))) }), _jsxs("section", { className: "card reveal-card", children: [_jsxs("div", { className: "section-header", children: [_jsx("h3", { children: "Revenue Overview" }), _jsx("div", { className: "tags", children: ["Day", "Week", "Month", "Year"].map((tab) => (_jsx("button", { type: "button", className: period === tab ? "btn-gold" : "btn-ghost", onClick: () => setPeriod(tab), children: tab }, tab))) })] }), _jsxs("svg", { viewBox: "0 0 700 250", width: "100%", height: "250", "aria-label": "Revenue chart", children: [_jsx("path", { d: buildPath(activeSeries.studio, chartMax), stroke: "var(--studio)", fill: "none", strokeWidth: "3" }), _jsx("path", { d: buildPath(activeSeries.luxe, chartMax), stroke: "var(--luxe)", fill: "none", strokeWidth: "3" }), _jsx("path", { d: buildPath(activeSeries.corp, chartMax), stroke: "var(--corp)", fill: "none", strokeWidth: "3" }), activeSeries.labels.map((label, index) => (_jsx("text", { x: index * (660 / (activeSeries.labels.length - 1 || 1)), y: "242", fill: "var(--text2)", fontSize: "11", children: label }, label)))] }), _jsxs("div", { className: "tags", children: [_jsxs("span", { children: ["Studio: ", formatCompactINR(activeSeries.studio[hoveredPoint] * 10000)] }), _jsxs("span", { children: ["Luxe: ", formatCompactINR(activeSeries.luxe[hoveredPoint] * 10000)] }), _jsxs("span", { children: ["Corp: ", formatCompactINR(activeSeries.corp[hoveredPoint] * 10000)] })] })] }), _jsxs("section", { className: "card-grid-2", children: [_jsxs("article", { className: "card reveal-card", children: [_jsxs("div", { className: "section-header", children: [_jsx("h3", { children: "Activity Feed" }), _jsx("button", { type: "button", className: "btn-ghost", children: "Load More" })] }), _jsx("div", { className: "tags", style: { marginTop: 8 }, children: ["All", "Studio", "Fashion", "Corporate", "AI"].map((tag) => (_jsx("button", { type: "button", className: activityFilter === tag ? "btn-gold" : "btn-ghost", onClick: () => setActivityFilter(tag), children: tag }, tag))) }), _jsx("div", { style: { display: "grid", gap: 10, marginTop: 10 }, children: filteredActivity.map((item) => (_jsxs("article", { className: "card", style: { padding: 10 }, children: [_jsxs("div", { className: "section-header", children: [_jsx("strong", { children: item.text }), _jsx("small", { children: item.time })] }), _jsx("p", { children: item.detail }), _jsx("button", { type: "button", className: "link-btn", style: { marginTop: 6 }, children: "Quick Action" })] }, item.id))) })] }), _jsxs("article", { className: "card reveal-card", children: [_jsxs("div", { className: "section-header", children: [_jsx("h3", { children: "AI Picks" }), _jsx("button", { type: "button", className: "btn-corp", onClick: () => navigate("/view-aistyle"), children: "Open AI Style" })] }), _jsx("div", { style: { display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4, marginTop: 8 }, children: products.map((product) => (_jsx("div", { style: { minWidth: 230 }, children: _jsx(ProductCard, { product: product }) }, product.id))) })] })] }), _jsxs("section", { className: "card-grid-2", children: [_jsxs("article", { className: "card reveal-card", children: [_jsxs("div", { className: "section-header", children: [_jsx("h3", { children: "Upcoming Sessions Calendar" }), _jsxs("div", { className: "tags", children: [_jsx("button", { type: "button", className: calendarMode === "month" ? "btn-gold" : "btn-ghost", onClick: () => setCalendarMode("month"), children: "Month" }), _jsx("button", { type: "button", className: calendarMode === "timeline" ? "btn-gold" : "btn-ghost", onClick: () => setCalendarMode("timeline"), children: "Next 7 Days" })] })] }), calendarMode === "month" ? (_jsx("div", { className: "card-grid-4", style: { marginTop: 10 }, children: Array.from({ length: 28 }).map((_, index) => (_jsxs("div", { className: "card", style: { padding: 8, textAlign: "center", minHeight: 54 }, children: [_jsx("small", { children: index + 1 }), [3, 7, 11, 19, 24].includes(index + 1) ? (_jsx("div", { style: { width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", margin: "6px auto 0" } })) : null] }, index))) })) : (_jsx("div", { style: { display: "grid", gap: 8, marginTop: 12 }, children: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (_jsxs("div", { className: "card", style: { padding: 10 }, children: [_jsxs("strong", { children: [day, " \u00B7 ", new Date(Date.now() + index * 86400000).toLocaleDateString("en-IN", { day: "numeric", month: "short" })] }), _jsx("p", { children: index % 2 ? "1 booking scheduled" : "No booking" })] }, day))) }))] }), _jsxs("article", { className: "card reveal-card", children: [_jsx("h3", { children: "Quick Stats Widgets" }), _jsxs("div", { className: "card-grid-2", style: { marginTop: 10 }, children: [_jsxs("div", { className: "card metric", children: [_jsx("h4", { children: "Loyalty Points" }), _jsx(AnimatedCounter, { value: overview?.metrics.loyaltyPoints ?? 0 }), _jsx("small", { children: "2,840 / 5,000 to Gold" })] }), _jsxs("div", { className: "card metric", children: [_jsx("h4", { children: "AI Style Score" }), _jsx(AnimatedCounter, { value: 87, suffix: "%" }), _jsx("small", { children: "High compatibility for curated edits" })] }), _jsxs("div", { className: "card metric", children: [_jsx("h4", { children: "Eco Impact" }), _jsx(AnimatedCounter, { value: 4.2, suffix: "kg" }), _jsx("small", { children: "CO2 saved via eco purchases \uD83C\uDF33" })] }), _jsxs("div", { className: "card metric", children: [_jsx("h4", { children: "Referral Code" }), _jsx("strong", { children: user?.referralCode ?? "AADHYA500" }), _jsx("button", { type: "button", className: "btn-corp", onClick: () => navigator.clipboard.writeText(user?.referralCode ?? "AADHYA500"), children: "Copy & Share" })] })] })] })] })] }))] }));
}
export function StudioPage() {
    const { toast } = useToast();
    const [tab, setTab] = useState("book");
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [wizardStep, setWizardStep] = useState(1);
    const [sessionType, setSessionType] = useState("Portrait Session");
    const [addOns, setAddOns] = useState([]);
    const [date, setDate] = useState("");
    const [duration, setDuration] = useState("2hr");
    useEffect(() => {
        let mounted = true;
        void (async () => {
            try {
                setLoading(true);
                const data = await getStudioBookings();
                if (mounted)
                    setBookings(data);
            }
            finally {
                if (mounted)
                    setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);
    const upcoming = bookings.filter((booking) => new Date(booking.bookingDate) >= new Date());
    const past = bookings.filter((booking) => new Date(booking.bookingDate) < new Date());
    async function submitBooking() {
        if (!date) {
            toast("Select a date and time first", "warning", 2000);
            return;
        }
        const payload = {
            sessionType,
            bookingDate: new Date(date).toISOString(),
            duration,
            amountPaise: duration === "Full-day" ? 4999900 : duration === "Half-day" ? 2999900 : duration === "2hr" ? 1599900 : 999900,
            addOns
        };
        await createStudioBooking(payload);
        toast("Studio request submitted", "success", 2000);
        const latest = await getStudioBookings();
        setBookings(latest);
        setTab("upcoming");
        setWizardStep(1);
    }
    const tabs = [
        { id: "book", label: "Book Session" },
        { id: "upcoming", label: "Upcoming Sessions" },
        { id: "past", label: "Past Sessions" },
        { id: "rental", label: "Cultural Dress Rental" },
        { id: "packages", label: "Studio Packages" },
        { id: "gallery", label: "My Studio Gallery" }
    ];
    return (_jsxs(ViewContainer, { id: "view-studio", children: [_jsxs("div", { className: "section-header", children: [_jsx("h2", { children: "360Studio Booking Command Centre" }), _jsx("button", { type: "button", className: "btn-gold", children: "Next Available Slot" })] }), _jsx("div", { className: "tags", children: tabs.map((item) => (_jsx("button", { type: "button", className: tab === item.id ? "btn-gold" : "btn-ghost", onClick: () => setTab(item.id), children: item.label }, item.id))) }), tab === "book" ? (_jsxs("section", { className: "card-grid-2", children: [_jsxs("article", { className: "card reveal-card", children: [_jsxs("h3", { children: ["Step ", wizardStep, " of 5"] }), _jsx("p", { style: { marginTop: 6 }, children: "Guided booking wizard with pricing preview and payment simulation." }), _jsx("div", { className: "section-divider" }), wizardStep === 1 ? (_jsx("div", { className: "card-grid-2", children: ["Portrait Session", "Maternity Session", "Corporate Headshots", "Family Session"].map((type) => (_jsxs("button", { type: "button", className: "card", onClick: () => setSessionType(type), style: { borderColor: sessionType === type ? "var(--border2)" : undefined }, children: [_jsx("h4", { children: type }), _jsx("p", { children: "Click to choose this session format." })] }, type))) })) : null, wizardStep === 2 ? (_jsx("div", { className: "tags", children: ["Backdrop Colours", "Makeup Artist +₹1,500", "Hair Stylist +₹2,000", "Extra Prints Pack"].map((addon) => (_jsx("button", { type: "button", className: addOns.includes(addon) ? "btn-gold" : "btn-ghost", onClick: () => setAddOns((current) => current.includes(addon) ? current.filter((item) => item !== addon) : [...current, addon]), children: addon }, addon))) })) : null, wizardStep === 3 ? (_jsxs("div", { className: "field-row", children: [_jsxs("label", { className: "field", children: [_jsx("span", { children: "Date & Time" }), _jsx("input", { type: "datetime-local", value: date, onChange: (event) => setDate(event.target.value) })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Duration" }), _jsxs("select", { value: duration, onChange: (event) => setDuration(event.target.value), children: [_jsx("option", { children: "1hr" }), _jsx("option", { children: "2hr" }), _jsx("option", { children: "Half-day" }), _jsx("option", { children: "Full-day" })] })] })] })) : null, wizardStep === 4 ? (_jsx("div", { className: "card-grid-3", children: ["Ava", "Mira", "Rhea", "Ira", "Sam", "Kabir"].map((model) => (_jsxs("button", { type: "button", className: "card", children: [_jsx("div", { style: { fontSize: "1.6rem" }, children: "\uD83D\uDC8E" }), _jsx("strong", { children: model }), _jsx("small", { children: "Editorial \u00B7 Available" })] }, model))) })) : null, wizardStep === 5 ? (_jsxs("div", { className: "card", children: [_jsx("h4", { children: "Review & Payment" }), _jsxs("p", { children: ["Session: ", sessionType] }), _jsxs("p", { children: ["Duration: ", duration] }), _jsxs("p", { children: ["Add-ons: ", addOns.length ? addOns.join(", ") : "None"] }), _jsxs("p", { children: ["Estimated total:", " ", _jsx("strong", { children: formatINR(duration === "Full-day"
                                                    ? 4999900
                                                    : duration === "Half-day"
                                                        ? 2999900
                                                        : duration === "2hr"
                                                            ? 1599900
                                                            : 999900) })] })] })) : null, _jsx("div", { className: "section-divider" }), _jsxs("div", { className: "section-header", children: [_jsx("button", { type: "button", className: "btn-ghost", disabled: wizardStep === 1, onClick: () => setWizardStep((step) => Math.max(1, step - 1)), children: "Back" }), wizardStep < 5 ? (_jsx("button", { type: "button", className: "btn-gold", onClick: () => setWizardStep((step) => Math.min(5, step + 1)), children: "Next Step" })) : (_jsx("button", { type: "button", className: "btn-gold", onClick: () => void submitBooking(), children: "Confirm Booking" }))] })] }), _jsxs("article", { className: "card reveal-card", children: [_jsx("h3", { children: "Availability Calendar" }), _jsx("p", { style: { marginTop: 6 }, children: "Green: available \u00B7 Red: booked \u00B7 Gold: limited slots." }), _jsx("div", { className: "card-grid-4", style: { marginTop: 10 }, children: Array.from({ length: 28 }).map((_, index) => {
                                    const day = index + 1;
                                    const tone = day % 7 === 0 ? "var(--red)" : day % 5 === 0 ? "var(--gold)" : "var(--green)";
                                    return (_jsxs("div", { className: "card", style: { textAlign: "center", padding: 8 }, children: [_jsx("small", { children: day }), _jsx("div", { style: { width: 8, height: 8, borderRadius: "50%", background: tone, margin: "6px auto 0" } })] }, day));
                                }) }), _jsx("div", { className: "section-divider" }), _jsx("h4", { children: "Photographer Profiles" }), _jsx("div", { className: "tags", style: { marginTop: 8 }, children: ["Nikhil · Portrait", "Anvi · Editorial", "Rahul · Corporate", "Maya · Family"].map((name) => (_jsx("span", { children: name }, name))) })] })] })) : null, tab === "upcoming" ? (_jsxs("section", { className: "card reveal-card", children: [_jsx("h3", { children: "Upcoming Sessions Timeline" }), loading ? (_jsxs("div", { className: "skeleton-list", style: { marginTop: 10 }, children: [_jsx("div", { className: "skeleton h-72" }), _jsx("div", { className: "skeleton h-72" })] })) : upcoming.length === 0 ? (_jsx(EmptyState, { icon: "\uD83D\uDCC5", title: "No upcoming sessions", description: "Book a studio slot to see timeline entries here." })) : (_jsx("div", { style: { display: "grid", gap: 10, marginTop: 10 }, children: upcoming.map((booking) => (_jsxs("article", { className: "card", style: { padding: 12 }, children: [_jsxs("div", { className: "section-header", children: [_jsx("strong", { children: booking.sessionType }), _jsx("span", { children: booking.status })] }), _jsxs("p", { children: [formatDate(booking.bookingDate), " \u00B7 ", booking.duration] }), _jsxs("small", { children: ["Amount: ", formatINR(booking.amountPaise)] }), _jsxs("div", { className: "tags", style: { marginTop: 8 }, children: [_jsx("button", { type: "button", className: "btn-ghost", children: "Reschedule" }), _jsx("button", { type: "button", className: "btn-ghost", children: "Download Invoice" }), _jsx("button", { type: "button", className: "btn-corp", children: "Add to Calendar" })] })] }, booking.id))) }))] })) : null, tab === "past" ? (_jsxs("section", { className: "card reveal-card", children: [_jsx("h3", { children: "Past Sessions" }), _jsx("div", { className: "card-grid-4", style: { marginTop: 10 }, children: [...(past.length ? past : upcoming)].map((session, index) => (_jsxs("button", { type: "button", className: "card", style: { textAlign: "left" }, children: [_jsx("div", { style: { fontSize: "2rem" }, children: "\uD83D\uDDBC" }), _jsx("strong", { children: session.sessionType }), _jsx("small", { children: formatDate(session.bookingDate) }), _jsx("small", { children: "Tap to open details & rating" })] }, session.id ?? index))) })] })) : null, tab === "rental" ? (_jsxs("section", { className: "card reveal-card", children: [_jsxs("div", { className: "section-header", children: [_jsx("h3", { children: "Cultural Dress Rental" }), _jsx("div", { className: "tags", children: ["Indian", "Japanese", "Arabic", "African", "Thai", "Western", "Korean"].map((culture) => (_jsx("span", { children: culture }, culture))) })] }), _jsx("div", { className: "product-grid", style: { marginTop: 10 }, children: ["Royal Lehenga", "Kimono Set", "Arabic Abaya", "Kente Wrap"].map((item) => (_jsxs("article", { className: "card", children: [_jsx("div", { className: "image-tile", children: "\uD83D\uDC58" }), _jsx("h4", { children: item }), _jsx("p", { children: "Fabric: Premium blend \u00B7 Occasion: Cultural/Editorial" }), _jsx("small", { children: "Deposit \u20B92,000 \u00B7 Rental \u20B93,500" }), _jsxs("div", { className: "tags", style: { marginTop: 8 }, children: [_jsx("button", { type: "button", className: "btn-ghost", children: "Size Guide" }), _jsx("button", { type: "button", className: "btn-corp", children: "Try Virtually" })] })] }, item))) })] })) : null, tab === "packages" ? (_jsxs("section", { className: "card reveal-card", children: [_jsx("h3", { children: "Studio Packages" }), _jsx("div", { className: "card-grid-3", style: { marginTop: 10 }, children: [
                            { name: "Standard", price: "₹19,999", features: ["2hr session", "1 backdrop", "15 edits"] },
                            { name: "Premium", price: "₹34,999", features: ["Half-day", "Stylist", "40 edits"], popular: true },
                            { name: "Platinum", price: "₹59,999", features: ["Full-day", "Makeup + Hair", "Unlimited exports"] }
                        ].map((pkg) => (_jsxs("article", { className: "card", style: { borderColor: pkg.popular ? "var(--gold)" : undefined }, children: [_jsx("h4", { children: pkg.name }), pkg.popular ? _jsx("small", { style: { color: "var(--gold-l)" }, children: "Most Popular" }) : null, _jsx("p", { style: { margin: "6px 0" }, children: pkg.price }), _jsx("ul", { style: { margin: 0, paddingLeft: 16 }, children: pkg.features.map((feature) => (_jsx("li", { children: feature }, feature))) }), _jsx("button", { type: "button", className: "btn-gold", style: { marginTop: 10 }, children: "Choose Plan" })] }, pkg.name))) })] })) : null, tab === "gallery" ? (_jsxs("section", { className: "card reveal-card", children: [_jsx("h3", { children: "My Studio Gallery" }), _jsx("div", { style: { columns: 4, columnGap: 10, marginTop: 10 }, children: Array.from({ length: 20 }).map((_, index) => (_jsx("div", { className: "card", style: { marginBottom: 10, minHeight: 90 + (index % 5) * 20 }, children: _jsx("div", { style: { fontSize: "2rem" }, children: index % 3 ? "📷" : "🎞" }) }, index))) })] })) : null] }));
}
export function AlbumsPage() {
    const { openModal, closeModal } = useModal();
    const [filter, setFilter] = useState("All");
    const albums = [
        { id: "al1", name: "Maternity Gold", date: "2026-03-18", count: 240, size: "1.2GB", ai: true },
        { id: "al2", name: "Family Portraits", date: "2026-02-02", count: 160, size: "860MB", ai: false },
        { id: "al3", name: "Corporate Headshots", date: "2026-01-19", count: 312, size: "2.4GB", ai: true }
    ];
    return (_jsxs(ViewContainer, { id: "view-albums", children: [_jsxs("div", { className: "section-header", children: [_jsx("h2", { children: "Digital Albums" }), _jsx("div", { className: "tags", children: ["All", "Recent", "Favourited", "Shared"].map((item) => (_jsx("button", { type: "button", className: filter === item ? "btn-gold" : "btn-ghost", onClick: () => setFilter(item), children: item }, item))) })] }), _jsx("section", { className: "product-grid", children: albums.map((album) => (_jsxs("article", { className: "card reveal-card tilt-card", children: [_jsx("div", { className: "card-grid-3", children: Array.from({ length: 6 }).map((_, index) => (_jsx("div", { className: "card", style: { minHeight: 42, display: "grid", placeItems: "center", padding: 0 }, children: index % 2 ? "🖼" : "📸" }, index))) }), _jsx("h4", { style: { marginTop: 10 }, children: album.name }), _jsxs("p", { children: [formatDate(album.date), " \u00B7 ", album.count, " photos \u00B7 ", album.size] }), album.ai ? _jsx("small", { style: { color: "var(--ai)" }, children: "AI Enhanced" }) : null, _jsxs("div", { className: "tags", style: { marginTop: 8 }, children: [_jsx("button", { type: "button", className: "btn-ghost", children: "Download" }), _jsx("button", { type: "button", className: "btn-ghost", children: "Share" }), _jsx("button", { type: "button", className: "btn-corp", children: "Push to Frame" }), _jsx("button", { type: "button", className: "btn-gold", onClick: () => {
                                        const modalId = openModal({
                                            title: album.name,
                                            body: (_jsxs("div", { children: [_jsx("p", { children: "Masonry preview with select mode, AI toggle, and share controls." }), _jsx("div", { className: "card-grid-3", style: { marginTop: 10 }, children: Array.from({ length: 9 }).map((_, index) => (_jsx("div", { className: "card", style: { minHeight: 90, display: "grid", placeItems: "center" }, children: index % 2 ? "📷" : "🖼" }, index))) })] })),
                                            actions: (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", className: "btn-ghost", onClick: () => closeModal(modalId), children: "Close" }), _jsx("button", { type: "button", className: "btn-gold", children: "Generate Share Link" })] }))
                                        });
                                    }, children: "Open" })] })] }, album.id))) })] }));
}
export function FramesPage() {
    const [selected, setSelected] = useState(0);
    const [previewEmoji, setPreviewEmoji] = useState("🖼");
    const [frames, setFrames] = useState([
        { id: "f1", name: "Living Room", location: "Home", status: "Online", slide: "Family Album", sync: "2m ago" },
        { id: "f2", name: "Studio Screen", location: "Studio", status: "Sleeping", slide: "Campaign Picks", sync: "14m ago" },
        { id: "f3", name: "Office Panel", location: "Office", status: "Offline", slide: "Corporate Loop", sync: "3h ago" }
    ]);
    useEffect(() => {
        const pool = ["🖼", "📸", "🎞", "🌄", "👗"];
        const timer = window.setInterval(() => {
            setPreviewEmoji(pool[Math.floor(Math.random() * pool.length)]);
        }, 3000);
        return () => window.clearInterval(timer);
    }, []);
    return (_jsxs(ViewContainer, { id: "view-frames", children: [_jsxs("div", { className: "section-header", children: [_jsx("h2", { children: "Smart Frames Dashboard" }), _jsx("button", { type: "button", className: "btn-gold", children: "Add New Frame" })] }), _jsx("section", { className: "card-grid-3", children: frames.map((frame, index) => (_jsxs("button", { type: "button", className: "card reveal-card", onClick: () => setSelected(index), children: [_jsx("div", { className: "image-tile", children: previewEmoji }), _jsxs("div", { className: "section-header", style: { marginTop: 8 }, children: [_jsx("strong", { children: frame.name }), _jsx("small", { children: frame.status })] }), _jsxs("p", { children: [frame.location, " \u00B7 ", frame.slide] }), _jsxs("small", { children: ["Last sync ", frame.sync] })] }, frame.id))) }), _jsxs("section", { className: "card reveal-card", children: [_jsxs("h3", { children: ["Frame Detail \u00B7 ", frames[selected]?.name] }), _jsxs("div", { className: "card-grid-2", style: { marginTop: 10 }, children: [_jsx("div", { className: "card", style: { minHeight: 260, display: "grid", placeItems: "center" }, children: _jsx("div", { style: { fontSize: "5rem" }, children: previewEmoji }) }), _jsxs("div", { className: "field", children: [_jsxs("label", { children: ["Transition Effect", _jsxs("select", { children: [_jsx("option", { children: "Fade" }), _jsx("option", { children: "Slide" }), _jsx("option", { children: "Zoom" }), _jsx("option", { children: "Ken Burns" })] })] }), _jsxs("label", { children: ["Interval", _jsxs("select", { children: [_jsx("option", { children: "5s" }), _jsx("option", { children: "10s" }), _jsx("option", { children: "30s" }), _jsx("option", { children: "1min" }), _jsx("option", { children: "5min" })] })] }), _jsxs("label", { children: ["Brightness", _jsx("input", { type: "range", min: 0, max: 100, defaultValue: 70 })] }), _jsxs("label", { children: ["Night Mode", _jsx("input", { defaultValue: "11:00 PM to 7:00 AM", readOnly: true })] }), _jsxs("div", { className: "tags", children: [_jsx("button", { type: "button", className: "btn-ghost", children: "Previous" }), _jsx("button", { type: "button", className: "btn-ghost", children: "Next" }), _jsx("button", { type: "button", className: "btn-corp", children: "Random" })] })] })] })] })] }));
}
export function ModelingPage() {
    const { openModal } = useModal();
    const [filters, setFilters] = useState({ gender: "All", availability: "All" });
    const models = [
        { name: "Ava Rao", age: 24, height: "5'8", tags: ["Editorial", "Commercial"], status: "Available", rate: 4500, score: 87 },
        { name: "Nikhil Dev", age: 28, height: "6'1", tags: ["Runway", "Corporate"], status: "On Request", rate: 5200, score: 82 },
        { name: "Mira Shah", age: 22, height: "5'6", tags: ["Cultural", "Lifestyle"], status: "Booked", rate: 3900, score: 91 }
    ];
    const visible = models.filter((model) => (filters.availability === "All" || model.status === filters.availability) &&
        (filters.gender === "All" || (filters.gender === "Women" ? model.name !== "Nikhil Dev" : model.name === "Nikhil Dev")));
    return (_jsxs(ViewContainer, { id: "view-modeling", children: [_jsx("h2", { children: "Model Selection \u00B7 AI Casting Portal" }), _jsxs("section", { className: "card-grid-4", style: { marginTop: 10 }, children: [_jsxs("label", { className: "field", children: [_jsx("span", { children: "Gender" }), _jsxs("select", { value: filters.gender, onChange: (event) => setFilters((current) => ({ ...current, gender: event.target.value })), children: [_jsx("option", { children: "All" }), _jsx("option", { children: "Women" }), _jsx("option", { children: "Men" })] })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Availability" }), _jsxs("select", { value: filters.availability, onChange: (event) => setFilters((current) => ({ ...current, availability: event.target.value })), children: [_jsx("option", { children: "All" }), _jsx("option", { children: "Available" }), _jsx("option", { children: "Booked" }), _jsx("option", { children: "On Request" })] })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Height" }), _jsx("input", { placeholder: "e.g. 5'7" })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Special Skills" }), _jsx("input", { placeholder: "Runway, Cultural..." })] })] }), _jsx("section", { className: "product-grid", children: visible.map((model) => (_jsxs("article", { className: "card reveal-card tilt-card", children: [_jsx("div", { className: "image-tile", children: "\uD83D\uDC8E" }), _jsx("h3", { children: model.name }), _jsxs("p", { children: [model.age, " yrs \u00B7 ", model.height] }), _jsx("div", { className: "tags", children: model.tags.map((tag) => (_jsx("span", { children: tag }, tag))) }), _jsxs("small", { children: ["Status: ", model.status] }), _jsxs("strong", { children: [formatINR(model.rate * 100), " / hr"] }), _jsx("button", { type: "button", className: "btn-gold", onClick: () => openModal({
                                title: `${model.name} Profile`,
                                body: (_jsxs("div", { className: "field", children: [_jsx("p", { children: "Experience: 5 years \u00B7 Sessions: 214 \u00B7 Avg Rating: 4.8" }), _jsx("div", { className: "card-grid-3", children: Array.from({ length: 6 }).map((_, index) => (_jsx("div", { className: "card", style: { minHeight: 90, display: "grid", placeItems: "center" }, children: "\uD83E\uDDFF" }, index))) }), _jsxs("p", { children: ["AI compatibility score: ", model.score, "% for your upcoming shoot."] })] })),
                                actions: _jsx("button", { type: "button", className: "btn-gold", children: "Book Model" })
                            }), children: "View Profile" })] }, model.name))) }), _jsxs("section", { className: "card reveal-card", children: [_jsx("h3", { children: "AI Casting" }), _jsxs("div", { className: "field-row", style: { marginTop: 8 }, children: [_jsx("input", { placeholder: "Shoot type" }), _jsx("input", { placeholder: "Theme" }), _jsx("input", { placeholder: "Dress style" }), _jsx("input", { placeholder: "Brand aesthetics" })] }), _jsx("div", { className: "tags", style: { marginTop: 10 }, children: visible.slice(0, 3).map((model) => (_jsxs("span", { children: [model.name, " \u00B7 ", model.score, "% match"] }, model.name))) })] })] }));
}
export function ShopPage() {
    const { openModal } = useModal();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [sort, setSort] = useState("newest");
    const [viewMode, setViewMode] = useState("grid");
    useEffect(() => {
        let mounted = true;
        void (async () => {
            try {
                setLoading(true);
                const data = await getProducts({
                    division: "LUXE",
                    search,
                    ...(category !== "All" ? { category } : {}),
                    sort
                });
                if (mounted) {
                    setProducts(data);
                }
            }
            finally {
                if (mounted)
                    setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [search, category, sort]);
    return (_jsxs(ViewContainer, { id: "view-shop", children: [_jsxs("section", { className: "hero-card", "data-parallax": "0.25", children: [_jsx("h2", { children: "Udhikxa Luxe Storefront" }), _jsx("p", { children: "Free shipping over \u20B93,000 \u00B7 100% Eco Certified \u00B7 AI-Powered Style Match" })] }), _jsxs("section", { className: "card-grid-4", children: [_jsxs("label", { className: "field", children: [_jsx("span", { children: "Search" }), _jsx("input", { value: search, onChange: (event) => setSearch(event.target.value), placeholder: "Search products" })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Category" }), _jsxs("select", { value: category, onChange: (event) => setCategory(event.target.value), children: [_jsx("option", { children: "All" }), _jsx("option", { children: "Dresses" }), _jsx("option", { children: "Tops" }), _jsx("option", { children: "Kurtas" }), _jsx("option", { children: "Sarees" }), _jsx("option", { children: "Accessories" })] })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Sort" }), _jsxs("select", { value: sort, onChange: (event) => setSort(event.target.value), children: [_jsx("option", { value: "newest", children: "Newest" }), _jsx("option", { value: "best", children: "Best Sellers" }), _jsx("option", { value: "low-high", children: "Price Low-High" }), _jsx("option", { value: "high-low", children: "Price High-Low" }), _jsx("option", { value: "rating", children: "Rating" }), _jsx("option", { value: "eco", children: "Eco Score" })] })] }), _jsxs("div", { className: "field", children: [_jsx("span", { children: "View" }), _jsxs("div", { className: "tags", children: [_jsx("button", { type: "button", className: viewMode === "grid" ? "btn-gold" : "btn-ghost", onClick: () => setViewMode("grid"), children: "Grid" }), _jsx("button", { type: "button", className: viewMode === "list" ? "btn-gold" : "btn-ghost", onClick: () => setViewMode("list"), children: "List" })] })] })] }), loading ? (_jsxs("div", { className: "skeleton-list", children: [_jsx("div", { className: "skeleton h-72" }), _jsx("div", { className: "skeleton h-72" }), _jsx("div", { className: "skeleton h-72" })] })) : products.length === 0 ? (_jsx(EmptyState, { icon: "\uD83D\uDECD", title: "No products matched", description: "Try clearing filters to browse the latest collection." })) : viewMode === "grid" ? (_jsx("section", { className: "product-grid", children: products.map((product) => (_jsx("div", { onDoubleClick: () => openModal({ title: product.name, body: _jsx("p", { children: product.description }) }), children: _jsx(ProductCard, { product: product }) }, product.id))) })) : (_jsx("section", { style: { display: "grid", gap: 10 }, children: products.map((product) => (_jsx("article", { className: "card reveal-card", children: _jsxs("div", { className: "card-grid-4", children: [_jsx("div", { className: "image-tile", children: product.imageEmoji }), _jsxs("div", { children: [_jsx("h3", { children: product.name }), _jsx("p", { children: product.description }), _jsx("small", { children: product.fabric })] }), _jsxs("div", { children: [_jsx("strong", { children: formatINR(product.pricePaise) }), _jsxs("p", { children: ["\u2B50 ", product.rating, " \u00B7 ", product.reviewCount, " reviews"] })] }), _jsx("button", { type: "button", className: "btn-gold", onClick: () => openModal({
                                    title: product.name,
                                    body: _jsx("p", { children: product.description }),
                                    actions: _jsx("button", { type: "button", className: "btn-gold", children: "Add to Cart" })
                                }), children: "Quick View" })] }) }, product.id))) }))] }));
}
export function ProductDetailPage() {
    const { productId } = useParams();
    const { addToCart } = useApp();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState(null);
    const [size, setSize] = useState("M");
    const [color, setColor] = useState("Default");
    const [quantity, setQuantity] = useState(1);
    const [tab, setTab] = useState("Description");
    const [pincode, setPincode] = useState("");
    const [eta, setEta] = useState("");
    useEffect(() => {
        if (!productId)
            return;
        let mounted = true;
        void (async () => {
            try {
                setLoading(true);
                const data = await getProduct(productId);
                if (!mounted)
                    return;
                setProduct(data);
                setSize(data.sizes?.[0] ?? "M");
                setColor(data.colors?.[0] ?? "Default");
            }
            finally {
                if (mounted)
                    setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [productId]);
    if (loading || !product) {
        return (_jsx(ViewContainer, { id: "view-product", children: _jsxs("div", { className: "skeleton-list", children: [_jsx("div", { className: "skeleton h-72" }), _jsx("div", { className: "skeleton h-72" }), _jsx("div", { className: "skeleton h-72" })] }) }));
    }
    return (_jsxs(ViewContainer, { id: "view-product", children: [_jsxs("section", { className: "card-grid-2", children: [_jsxs("article", { className: "card reveal-card", children: [_jsx("div", { className: "image-tile", style: { minHeight: 300 }, children: product.imageEmoji }), _jsx("div", { className: "card-grid-4", style: { marginTop: 8 }, children: Array.from({ length: 4 }).map((_, index) => (_jsx("button", { type: "button", className: "card", style: { minHeight: 62 }, children: index % 2 ? "🖼" : "📷" }, index))) })] }), _jsxs("article", { className: "card reveal-card", children: [_jsx("small", { children: product.division }), _jsx("h2", { children: product.name }), _jsxs("p", { children: ["\u2B50 ", product.rating, " (", formatNumberIndian(product.reviewCount), " reviews)"] }), _jsx("h3", { children: formatINR(product.pricePaise) }), product.originalPaise ? _jsx("s", { children: formatINR(product.originalPaise) }) : null, _jsx("p", { style: { marginTop: 8 }, children: product.description }), _jsx("div", { className: "section-divider" }), _jsxs("div", { className: "field-row", children: [_jsxs("label", { className: "field", children: [_jsx("span", { children: "Size" }), _jsx("select", { value: size, onChange: (event) => setSize(event.target.value), children: product.sizes.map((option) => (_jsx("option", { children: option }, option))) })] }), _jsxs("label", { className: "field", children: [_jsx("span", { children: "Colour" }), _jsx("select", { value: color, onChange: (event) => setColor(event.target.value), children: product.colors.map((option) => (_jsx("option", { children: option }, option))) })] })] }), _jsxs("div", { className: "field", children: [_jsx("span", { children: "Quantity" }), _jsxs("div", { className: "qty-stepper", style: { width: "fit-content" }, children: [_jsx("button", { type: "button", onClick: () => setQuantity((value) => Math.max(1, value - 1)), children: "\u2212" }), _jsx("span", { children: quantity }), _jsx("button", { type: "button", onClick: () => setQuantity((value) => Math.min(10, value + 1)), children: "+" })] })] }), _jsxs("div", { className: "tags", children: [_jsx("button", { type: "button", className: "btn-gold", onClick: () => void addToCart({
                                            productId: product.id,
                                            size,
                                            color,
                                            quantity
                                        }), children: "Add to Cart" }), _jsx("button", { type: "button", className: "btn-corp", onClick: () => toast("Buy now flow simulated", "info", 1800), children: "Buy Now" }), _jsx("button", { type: "button", className: "btn-ghost", children: "Add to Wishlist" })] }), _jsxs("div", { className: "field-row", style: { marginTop: 10 }, children: [_jsx("input", { value: pincode, onChange: (event) => setPincode(event.target.value), placeholder: "Enter pincode" }), _jsx("button", { type: "button", className: "btn-ghost", onClick: () => setEta(pincode.length >= 6 ? "Delivers by Tue, 30 Apr" : "Enter valid pincode"), children: "Check ETA" })] }), eta ? _jsx("small", { children: eta }) : null] })] }), _jsxs("section", { className: "card reveal-card", children: [_jsx("div", { className: "tags", children: ["Description", "Specifications", "Reviews", "AI Style Tips", "Returns Policy"].map((item) => (_jsx("button", { type: "button", className: tab === item ? "btn-gold" : "btn-ghost", onClick: () => setTab(item), children: item }, item))) }), _jsxs("div", { style: { marginTop: 10 }, children: [tab === "Description" ? _jsx("p", { children: product.description }) : null, tab === "Specifications" ? (_jsx("table", { style: { width: "100%" }, children: _jsxs("tbody", { children: [_jsxs("tr", { children: [_jsx("td", { children: "Fabric" }), _jsx("td", { children: product.fabric })] }), _jsxs("tr", { children: [_jsx("td", { children: "Category" }), _jsx("td", { children: product.category })] }), _jsxs("tr", { children: [_jsx("td", { children: "Eco Score" }), _jsxs("td", { children: [product.ecoScore, "/5"] })] }), _jsxs("tr", { children: [_jsx("td", { children: "Origin" }), _jsx("td", { children: "Made in India" })] })] }) })) : null, tab === "Reviews" ? (_jsx("div", { style: { display: "grid", gap: 8 }, children: ["Perfect fit and breathable fabric.", "Looks premium and elegant.", "Colour exactly as shown."].map((review) => (_jsxs("article", { className: "card", style: { padding: 10 }, children: [_jsx("strong", { children: "\u2605\u2605\u2605\u2605\u2605" }), _jsx("p", { children: review })] }, review))) })) : null, tab === "AI Style Tips" ? (_jsxs("ul", { children: [_jsx("li", { children: "Pair with minimal gold accessories for evening events." }), _jsx("li", { children: "Add a structured jacket for corporate styling." }), _jsx("li", { children: "Use earthy palette makeup for cohesive seasonal look." })] })) : null, tab === "Returns Policy" ? _jsx("p", { children: "7-day easy returns on unused items with tag intact." }) : null] })] })] }));
}
export function AIStylePage() {
    const { toast } = useToast();
    const [uploaded, setUploaded] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [occasion, setOccasion] = useState("Wedding");
    const [budget, setBudget] = useState(8000);
    useEffect(() => {
        if (!analyzing)
            return;
        const timer = window.setInterval(() => {
            setProgress((value) => {
                if (value >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                return value + 8;
            });
        }, 180);
        return () => window.clearInterval(timer);
    }, [analyzing]);
    return (_jsxs(ViewContainer, { id: "view-aistyle", children: [_jsx("h2", { children: "AI Style Match Studio" }), _jsxs("section", { className: "card-grid-2", children: [_jsxs("article", { className: "card reveal-card", children: [_jsx("h3", { children: "Upload Panel" }), _jsx("button", { type: "button", className: "card", style: { marginTop: 10, minHeight: 220, borderStyle: "dashed", display: "grid", placeItems: "center" }, onClick: () => {
                                    setUploaded("👤");
                                    setAnalyzing(true);
                                    setProgress(0);
                                }, children: uploaded ? uploaded : "📷 Drop image or tap to upload" }), analyzing ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "password-meter", style: { marginTop: 10 }, children: _jsx("span", { style: { width: `${progress}%`, background: "var(--gold)" } }) }), _jsxs("small", { children: ["Analyzing image... ", progress, "%"] })] })) : null, _jsxs("div", { className: "tags", style: { marginTop: 10 }, children: [_jsx("button", { type: "button", className: "btn-ghost", children: "Retake" }), _jsx("button", { type: "button", className: "btn-ghost", children: "Upload Different" })] })] }), _jsxs("article", { className: "card reveal-card", children: [_jsx("h3", { children: "Style Preferences" }), _jsx("div", { className: "tags", style: { marginTop: 8 }, children: ["Wedding", "Work", "Travel", "Festive", "Date Night"].map((item) => (_jsx("button", { type: "button", className: occasion === item ? "btn-gold" : "btn-ghost", onClick: () => setOccasion(item), children: item }, item))) }), _jsx("div", { className: "tags", style: { marginTop: 10 }, children: ["Elongate", "Curvy", "Structured", "Flowing"].map((goal) => (_jsx("span", { children: goal }, goal))) }), _jsxs("label", { className: "field", style: { marginTop: 10 }, children: [_jsxs("span", { children: ["Budget ", formatINR(budget * 100)] }), _jsx("input", { type: "range", min: 2000, max: 25000, value: budget, onChange: (event) => setBudget(Number(event.target.value)) })] }), _jsx("div", { className: "tags", style: { marginTop: 10 }, children: ["Earthy", "Jewel", "Pastels", "Monochrome", "Bright", "Neutrals"].map((palette) => (_jsx("span", { children: palette }, palette))) }), _jsx("button", { type: "button", className: "btn-corp", style: { marginTop: 10 }, onClick: () => toast("Preferences randomized", "info", 1600), children: "Surprise Me" })] })] }), _jsxs("section", { className: "card-grid-2", children: [_jsxs("article", { className: "card reveal-card", children: [_jsx("h3", { children: "Feature Detection" }), _jsx("div", { className: "card-grid-2", style: { marginTop: 10 }, children: ["Face Shape", "Skin Tone", "Body Type", "Color Season"].map((label, index) => (_jsxs("div", { className: "card metric", children: [_jsx("h4", { children: label }), _jsx(AnimatedCounter, { value: 74 + index * 6, suffix: "%" })] }, label))) })] }), _jsxs("article", { className: "card reveal-card", children: [_jsx("h3", { children: "Style DNA" }), _jsxs("svg", { viewBox: "0 0 240 240", width: "100%", height: "220", children: [_jsx("polygon", { points: "120,26 192,76 178,168 120,210 62,168 48,76", fill: "rgba(167,139,250,0.08)", stroke: "var(--ai)" }), _jsx("polygon", { points: "120,56 172,88 162,152 120,184 78,152 68,88", fill: "rgba(201,168,76,0.15)", stroke: "var(--gold)" })] }), _jsx("small", { children: "Season: Warm Autumn \u00B7 Primary axis: Natural + Classic" })] })] }), _jsxs("section", { className: "card reveal-card", children: [_jsx("h3", { children: "Recommended Products" }), _jsx("div", { className: "product-grid", style: { marginTop: 10 }, children: Array.from({ length: 6 }).map((_, index) => (_jsxs("article", { className: "card", children: [_jsx("div", { className: "image-tile", children: index % 2 ? "👗" : "🧥" }), _jsxs("strong", { children: ["AI Pick #", index + 1] }), _jsxs("small", { children: [88 - index * 3, "% match"] }), _jsxs("div", { className: "tags", style: { marginTop: 6 }, children: [_jsx("button", { type: "button", className: "btn-ghost", children: "Why this matches" }), _jsx("button", { type: "button", className: "btn-corp", children: "Try On" })] })] }, index))) })] })] }));
}
export function OrdersPage() {
    const { openModal } = useModal();
    const [status, setStatus] = useState("All");
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let mounted = true;
        void (async () => {
            try {
                setLoading(true);
                const data = await getOrders(status === "All" ? undefined : status);
                if (mounted)
                    setOrders(data);
            }
            finally {
                if (mounted)
                    setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [status]);
    return (_jsxs(ViewContainer, { id: "view-orders", children: [_jsxs("div", { className: "section-header", children: [_jsx("h2", { children: "My Orders" }), _jsx("input", { placeholder: "Search by order ID or product", style: { maxWidth: 280 } })] }), _jsx("div", { className: "tags", children: ["All", "PROCESSING", "IN_TRANSIT", "DELIVERED", "CANCELLED", "RETURNED"].map((item) => (_jsx("button", { type: "button", className: status === item ? "btn-gold" : "btn-ghost", onClick: () => setStatus(item), children: item }, item))) }), loading ? (_jsxs("div", { className: "skeleton-list", children: [_jsx("div", { className: "skeleton h-72" }), _jsx("div", { className: "skeleton h-72" })] })) : orders.length === 0 ? (_jsx(EmptyState, { icon: "\uD83D\uDCE6", title: "No orders yet", description: "Start shopping to see your orders here." })) : (_jsx("section", { style: { display: "grid", gap: 10 }, children: orders.map((order) => (_jsxs("article", { className: "card reveal-card", children: [_jsxs("div", { className: "section-header", children: [_jsxs("div", { children: [_jsx("h3", { children: order.orderNo }), _jsx("small", { children: formatDate(order.createdAt) })] }), _jsx("span", { children: order.status })] }), _jsxs("div", { className: "card-grid-2", style: { marginTop: 8 }, children: [_jsx("div", { children: order.items.map((item) => (_jsxs("p", { children: [item.product.imageEmoji, " ", item.product.name, " \u00B7 ", item.quantity] }, item.id))) }), _jsxs("div", { style: { textAlign: "right" }, children: [_jsx("strong", { children: formatINR(order.totalPaise) }), _jsx("p", { children: order.paymentMethod })] })] }), _jsxs("div", { className: "tags", style: { marginTop: 8 }, children: [_jsx("button", { type: "button", className: "btn-ghost", onClick: () => openModal({
                                        title: `Tracking ${order.orderNo}`,
                                        body: (_jsx("div", { className: "field", children: [
                                                "Order Placed",
                                                "Payment Confirmed",
                                                "Packed at Warehouse",
                                                "Shipped",
                                                "Out for Delivery",
                                                "Delivered"
                                            ].map((step, index) => (_jsx("div", { className: "card", style: { padding: 10 }, children: _jsxs("strong", { children: [index <= (order.status === "DELIVERED" ? 5 : order.status === "IN_TRANSIT" ? 3 : 1) ? "✓" : "○", " ", step] }) }, step))) }))
                                    }), children: "Track Order" }), _jsx("button", { type: "button", className: "btn-ghost", children: "View Invoice" }), _jsx("button", { type: "button", className: "btn-ghost", children: "Reorder" }), _jsx("button", { type: "button", className: "btn-corp", children: "Return / Exchange" })] })] }, order.id))) }))] }));
}
export function WishlistPage() {
    const { wishlist, toggleWish, addToCart } = useApp();
    const grouped = useMemo(() => {
        const map = new Map();
        wishlist.forEach((item) => {
            const bucket = map.get(item.listName) ?? [];
            bucket.push(item);
            map.set(item.listName, bucket);
        });
        return Array.from(map.entries());
    }, [wishlist]);
    return (_jsxs(ViewContainer, { id: "view-wishlist", children: [_jsxs("div", { className: "section-header", children: [_jsx("h2", { children: "Wishlist Manager" }), _jsx("button", { type: "button", className: "btn-gold", children: "Create New Wishlist" })] }), grouped.length === 0 ? (_jsx(EmptyState, { icon: "\u2661", title: "Wishlist is empty", description: "Save products from shop to build your lists." })) : (grouped.map(([name, items]) => (_jsxs("section", { className: "card reveal-card", children: [_jsxs("div", { className: "section-header", children: [_jsx("h3", { children: name }), _jsx("button", { type: "button", className: "btn-ghost", children: "Share Wishlist" })] }), _jsx("div", { className: "product-grid", style: { marginTop: 10 }, children: items.map((item) => (_jsxs("article", { className: "card", children: [_jsx("div", { className: "image-tile", children: item.product.imageEmoji }), _jsx("h4", { children: item.product.name }), _jsx("p", { children: formatINR(item.product.pricePaise) }), _jsxs("div", { className: "tags", children: [_jsx("button", { type: "button", className: "btn-gold", onClick: () => void addToCart({
                                                productId: item.product.id,
                                                size: item.product.sizes?.[0] ?? "M",
                                                color: "Default",
                                                quantity: 1
                                            }), children: "Move to Cart" }), _jsx("button", { type: "button", className: "btn-ghost", onClick: () => void toggleWish(item.product.id, name), children: "Remove" })] })] }, item.id))) })] }, name))))] }));
}
export function CataloguePage() {
    const [category, setCategory] = useState("All");
    const products = [
        { name: "Executive Notebook Kit", moq: 100, lead: "5-7 days", customization: "Print · Engrave" },
        { name: "Festive Gourmet Hamper", moq: 200, lead: "8-10 days", customization: "Sticker · Card" },
        { name: "Premium Hoodie Pack", moq: 75, lead: "7-9 days", customization: "Embroider" },
        { name: "Wellness Desk Bundle", moq: 50, lead: "4-6 days", customization: "Print" }
    ];
    return (_jsxs(ViewContainer, { id: "view-catalogue", children: [_jsxs("section", { className: "hero-card", "data-parallax": "0.2", children: [_jsx("h2", { children: "Corporate Gift Catalogue" }), _jsxs("div", { className: "tags", style: { marginTop: 8 }, children: [_jsx("button", { type: "button", className: "btn-gold", children: "Request Physical Catalogue" }), _jsx("button", { type: "button", className: "btn-corp", children: "Book Demo Call" })] })] }), _jsx("div", { className: "tags", children: ["All", "Apparel", "Stationery", "Tech Accessories", "Food & Wellness", "Luxury", "Eco-Friendly"].map((item) => (_jsx("button", { type: "button", className: category === item ? "btn-gold" : "btn-ghost", onClick: () => setCategory(item), children: item }, item))) }), _jsx("section", { className: "product-grid", children: products.map((product) => (_jsxs("article", { className: "card reveal-card", children: [_jsx("div", { className: "image-tile", children: "\uD83C\uDF81" }), _jsx("h3", { children: product.name }), _jsxs("p", { children: ["MOQ ", product.moq, " \u00B7 Ships in ", product.lead] }), _jsx("small", { children: product.customization }), _jsx("button", { type: "button", className: "btn-corp", style: { marginTop: 8 }, children: "Enquire Bulk" })] }, product.name))) }), _jsxs("section", { className: "card reveal-card", children: [_jsx("h3", { children: "Build Your Kit" }), _jsxs("div", { className: "field-row", style: { marginTop: 10 }, children: [_jsxs("select", { children: [_jsx("option", { children: "Joining" }), _jsx("option", { children: "Festival" }), _jsx("option", { children: "Diwali" }), _jsx("option", { children: "Christmas" })] }), _jsx("input", { placeholder: "Quantity", defaultValue: "100" }), _jsx("input", { placeholder: "Products in kit", defaultValue: "Notebook + Mug + Hoodie" }), _jsx("button", { type: "button", className: "btn-gold", children: "Get Estimate" })] })] })] }));
}
export function LogoCustomizerPage() {
    const { toast } = useToast();
    const [textLogo, setTextLogo] = useState("360Shopie");
    const [logoColor, setLogoColor] = useState("#ffffff");
    const [baseColor, setBaseColor] = useState("#111111");
    const [view, setView] = useState("Front");
    function downloadMockup() {
        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 500;
        const context = canvas.getContext("2d");
        if (!context)
            return;
        context.fillStyle = baseColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = logoColor;
        context.font = "bold 72px Syne";
        context.fillText(textLogo, 120, 260);
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "logo-mockup.png";
        link.click();
        toast("Mockup downloaded", "success", 1800);
    }
    return (_jsxs(ViewContainer, { id: "view-customize", children: [_jsx("h2", { children: "Logo Customizer Studio" }), _jsxs("section", { className: "card-grid-2", children: [_jsxs("article", { className: "card reveal-card", children: [_jsx("h3", { children: "Live Preview" }), _jsx("div", { className: "card", style: { marginTop: 10, minHeight: 260, display: "grid", placeItems: "center", background: baseColor }, children: _jsxs("div", { style: { fontFamily: "Syne", fontSize: "2.4rem", color: logoColor }, children: [textLogo, " \u00B7 ", view] }) }), _jsxs("div", { className: "tags", style: { marginTop: 8 }, children: [["Front", "Back", "Side"].map((face) => (_jsx("button", { type: "button", className: view === face ? "btn-gold" : "btn-ghost", onClick: () => setView(face), children: face }, face))), _jsx("button", { type: "button", className: "btn-corp", onClick: downloadMockup, children: "Download PNG" })] })] }), _jsxs("article", { className: "card reveal-card field", children: [_jsx("h3", { children: "Logo Builder" }), _jsxs("label", { children: ["Text Logo", _jsx("input", { value: textLogo, onChange: (event) => setTextLogo(event.target.value) })] }), _jsxs("label", { children: ["Product Base Colour", _jsx("input", { type: "color", value: baseColor, onChange: (event) => setBaseColor(event.target.value) })] }), _jsxs("label", { children: ["Logo Colour", _jsx("input", { type: "color", value: logoColor, onChange: (event) => setLogoColor(event.target.value) })] }), _jsxs("label", { children: ["Packaging", _jsxs("select", { children: [_jsx("option", { children: "Standard Brown" }), _jsx("option", { children: "Branded White Box" }), _jsx("option", { children: "Luxury Black Box" }), _jsx("option", { children: "Eco Kraft" })] })] }), _jsxs("label", { children: ["Message Card", _jsx("textarea", { rows: 3, placeholder: "Write your gift note" })] }), _jsx("button", { type: "button", className: "btn-gold", children: "Save Quote as PDF" })] })] })] }));
}
export function BulkOrdersPage() {
    const [mode, setMode] = useState("kanban");
    const [step, setStep] = useState(1);
    const columns = ["Draft", "Quote Sent", "In Production", "Quality Check", "Dispatched"];
    return (_jsxs(ViewContainer, { id: "view-bulk", children: [_jsxs("div", { className: "section-header", children: [_jsx("h2", { children: "Bulk Orders Pipeline" }), _jsxs("div", { className: "tags", children: [_jsx("button", { type: "button", className: mode === "kanban" ? "btn-gold" : "btn-ghost", onClick: () => setMode("kanban"), children: "Kanban" }), _jsx("button", { type: "button", className: mode === "table" ? "btn-gold" : "btn-ghost", onClick: () => setMode("table"), children: "Table" })] })] }), mode === "kanban" ? (_jsx("section", { className: "card-grid-4", style: { gridTemplateColumns: "repeat(5, minmax(0,1fr))" }, children: columns.map((column, columnIndex) => (_jsxs("article", { className: "card reveal-card", children: [_jsx("h3", { children: column }), _jsx("div", { style: { display: "grid", gap: 8, marginTop: 8 }, children: Array.from({ length: 2 }).map((_, index) => (_jsxs("div", { className: "card", style: { padding: 10 }, children: [_jsxs("strong", { children: ["BO-", columnIndex + 1, index + 1, "42"] }), _jsxs("p", { children: ["Client #", index + 1, " \u00B7 Quantity ", 120 + index * 40] }), _jsxs("small", { children: ["Due in ", 3 - index, " days"] })] }, index))) })] }, column))) })) : (_jsx("section", { className: "card reveal-card", children: _jsxs("table", { style: { width: "100%" }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Order ID" }), _jsx("th", { children: "Client" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Qty" }), _jsx("th", { children: "Amount" })] }) }), _jsx("tbody", { children: Array.from({ length: 6 }).map((_, index) => (_jsxs("tr", { children: [_jsxs("td", { children: ["BO-24", index] }), _jsxs("td", { children: ["Client ", index + 1] }), _jsx("td", { children: columns[index % columns.length] }), _jsx("td", { children: 120 + index * 20 }), _jsx("td", { children: formatINR((2400000 + index * 280000) * 100) })] }, index))) })] }) })), _jsxs("section", { className: "card reveal-card", children: [_jsxs("h3", { children: ["New Bulk Order Request \u00B7 Step ", step, "/5"] }), _jsxs("div", { className: "field-row", style: { marginTop: 10 }, children: [_jsx("input", { placeholder: "Company name" }), _jsx("input", { placeholder: "Contact person" }), _jsx("input", { placeholder: "GSTIN" }), _jsx("input", { placeholder: "Delivery city" })] }), _jsxs("div", { className: "tags", style: { marginTop: 10 }, children: [_jsx("button", { type: "button", className: "btn-ghost", onClick: () => setStep((value) => Math.max(1, value - 1)), children: "Back" }), _jsx("button", { type: "button", className: "btn-gold", onClick: () => setStep((value) => Math.min(5, value + 1)), children: "Next" }), _jsx("button", { type: "button", className: "btn-corp", children: "Auto-save Draft" })] })] })] }));
}
export function AIAssistantPage() {
    const [mode, setMode] = useState("General");
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const [messages, setMessages] = useState([
        { role: "assistant", text: "Hi, I can help with studio bookings, style picks, gifting estimates, and order tracking.", ts: new Date().toISOString() }
    ]);
    const listRef = useRef(null);
    const [showScrollFab, setShowScrollFab] = useState(false);
    useEffect(() => {
        const container = listRef.current;
        if (!container)
            return;
        const onScroll = () => {
            const diff = container.scrollHeight - container.scrollTop - container.clientHeight;
            setShowScrollFab(diff > 180);
        };
        container.addEventListener("scroll", onScroll);
        return () => container.removeEventListener("scroll", onScroll);
    }, []);
    useEffect(() => {
        const container = listRef.current;
        if (!container)
            return;
        container.scrollTop = container.scrollHeight;
    }, [messages, typing]);
    function sendMessage(text) {
        if (!text.trim())
            return;
        setMessages((current) => [...current, { role: "user", text, ts: new Date().toISOString() }]);
        setInput("");
        setTyping(true);
        window.setTimeout(() => {
            setTyping(false);
            setMessages((current) => [
                ...current,
                {
                    role: "assistant",
                    text: `Mode: ${mode} · I prepared an actionable response for: "${text}". You can run booking, estimate, or tracking tools from the right panel.`,
                    ts: new Date().toISOString()
                }
            ]);
        }, 1100);
    }
    return (_jsxs(ViewContainer, { id: "view-ai", children: [_jsx("h2", { children: "AI Assistant Hub" }), _jsxs("section", { className: "card-grid-2", style: { gridTemplateColumns: "2fr 1fr" }, children: [_jsxs("article", { className: "card reveal-card", style: { display: "grid", gridTemplateRows: "auto 1fr auto", minHeight: 560 }, children: [_jsx("div", { className: "tags", children: ["General", "Studio Mode", "Fashion Mode", "Corporate Mode"].map((item) => (_jsx("button", { type: "button", className: mode === item ? "btn-gold" : "btn-ghost", onClick: () => setMode(item), children: item }, item))) }), _jsxs("div", { ref: listRef, style: { overflow: "auto", marginTop: 10, display: "grid", gap: 8, alignContent: "start" }, children: [messages.map((message, index) => (_jsxs("article", { className: "card", style: { background: message.role === "assistant" ? "var(--surface2)" : "var(--gold-d)" }, children: [_jsxs("div", { className: "section-header", children: [_jsx("strong", { children: message.role === "assistant" ? "360AI" : "You" }), _jsx("small", { title: message.ts, children: formatRelative(message.ts) })] }), _jsx("p", { style: { marginTop: 5 }, children: message.text }), message.role === "assistant" ? (_jsxs("div", { className: "tags", style: { marginTop: 8 }, children: [_jsx("button", { type: "button", className: "btn-ghost", children: "Copy" }), _jsx("button", { type: "button", className: "btn-ghost", children: "\uD83D\uDC4D" }), _jsx("button", { type: "button", className: "btn-ghost", children: "\uD83D\uDC4E" })] })) : null] }, `${message.ts}-${index}`))), typing ? _jsx("div", { className: "card", children: "\u25CF \u25CF \u25CF Typing..." }) : null] }), _jsxs("form", { onSubmit: (event) => {
                                    event.preventDefault();
                                    sendMessage(input);
                                }, className: "field-row", style: { marginTop: 10 }, children: [_jsx("input", { value: input, onChange: (event) => setInput(event.target.value), placeholder: "Ask 360AI anything..." }), _jsx("button", { type: "submit", className: "btn-gold", children: "Send" })] }), showScrollFab ? (_jsx("button", { type: "button", className: "btn-gold", style: { position: "absolute", right: 28, bottom: 90 }, onClick: () => {
                                    if (listRef.current)
                                        listRef.current.scrollTop = listRef.current.scrollHeight;
                                }, children: "\u2193" })) : null] }), _jsxs("article", { className: "card reveal-card", children: [_jsx("h3", { children: "AI Tools Panel" }), _jsx("div", { style: { display: "grid", gap: 8, marginTop: 10 }, children: ["Style Scanner", "Price Estimator", "Booking Assistant", "Order Tracker", "Gift Recommender"].map((tool) => (_jsxs("button", { type: "button", className: "card", onClick: () => sendMessage(tool), children: [_jsx("strong", { children: tool }), _jsx("p", { children: "Launch inline tool" })] }, tool))) }), _jsx("div", { className: "section-divider" }), _jsx("h4", { children: "Conversation Memory" }), _jsxs("div", { className: "tags", style: { marginTop: 8 }, children: [_jsx("span", { children: "Warm Autumn" }), _jsx("span", { children: "Prefers eco fabrics" }), _jsx("span", { children: "Books weekends" })] })] })] })] }));
}
export function AnalyticsPage() {
    const [range, setRange] = useState("30D");
    const [chartType, setChartType] = useState("Bar");
    const [summary, setSummary] = useState(null);
    const [sortBy, setSortBy] = useState("reviewCount");
    useEffect(() => {
        let mounted = true;
        void (async () => {
            const data = await getAnalyticsSummary();
            if (mounted)
                setSummary(data);
        })();
        return () => {
            mounted = false;
        };
    }, []);
    const topProducts = useMemo(() => {
        const source = [...(summary?.topProducts ?? [])];
        if (sortBy === "rating")
            source.sort((a, b) => b.rating - a.rating);
        if (sortBy === "reviewCount")
            source.sort((a, b) => b.reviewCount - a.reviewCount);
        if (sortBy === "ecoScore")
            source.sort((a, b) => b.ecoScore - a.ecoScore);
        return source;
    }, [summary, sortBy]);
    return (_jsxs(ViewContainer, { id: "view-analytics", children: [_jsxs("div", { className: "section-header", children: [_jsx("h2", { children: "Analytics Intelligence Centre" }), _jsx("div", { className: "tags", children: ["Today", "7D", "30D", "90D", "YTD"].map((item) => (_jsx("button", { type: "button", className: range === item ? "btn-gold" : "btn-ghost", onClick: () => setRange(item), children: item }, item))) })] }), _jsxs("section", { className: "metrics-grid", children: [_jsxs("article", { className: "card metric", children: [_jsx("h4", { children: "Revenue" }), _jsx(AnimatedCounter, { value: (summary?.kpis?.revenueByDivision?.STUDIO ?? 0) / 100, prefix: "\u20B9" }), _jsx("small", { children: "+8.4%" })] }), _jsxs("article", { className: "card metric", children: [_jsx("h4", { children: "Orders" }), _jsx(AnimatedCounter, { value: summary?.kpis?.orderCount ?? 0 }), _jsx("small", { children: "+6.1%" })] }), _jsxs("article", { className: "card metric", children: [_jsx("h4", { children: "AOV" }), _jsx(AnimatedCounter, { value: 7420, prefix: "\u20B9" }), _jsx("small", { children: "+3.8%" })] }), _jsxs("article", { className: "card metric", children: [_jsx("h4", { children: "New Customers" }), _jsx(AnimatedCounter, { value: summary?.kpis?.users ?? 0 }), _jsx("small", { children: "+5.4%" })] })] }), _jsxs("section", { className: "card reveal-card", children: [_jsxs("div", { className: "section-header", children: [_jsx("h3", { children: "Revenue Chart" }), _jsx("div", { className: "tags", children: ["Bar", "Line", "Area"].map((item) => (_jsx("button", { type: "button", className: chartType === item ? "btn-gold" : "btn-ghost", onClick: () => setChartType(item), children: item }, item))) })] }), _jsx("div", { className: "card-grid-3", style: { marginTop: 10 }, children: ["Studio", "Luxe", "Corporate"].map((division, index) => (_jsxs("div", { className: "card", style: { minHeight: 160 }, children: [_jsx("strong", { children: division }), _jsx("div", { style: { height: 100, display: "flex", alignItems: "end", gap: 6, marginTop: 8 }, children: Array.from({ length: 6 }).map((_, valueIndex) => (_jsx("div", { style: {
                                            flex: 1,
                                            height: `${30 + valueIndex * 10 + index * 7}%`,
                                            background: index === 0 ? "var(--studio)" : index === 1 ? "var(--luxe)" : "var(--corp)",
                                            opacity: 0.8,
                                            borderRadius: 6
                                        } }, valueIndex))) })] }, division))) })] }), _jsxs("section", { className: "card-grid-2", children: [_jsxs("article", { className: "card reveal-card", children: [_jsx("h3", { children: "Division Breakdown" }), _jsxs("svg", { viewBox: "0 0 220 220", width: "100%", height: "220", children: [_jsx("circle", { cx: "110", cy: "110", r: "78", fill: "none", stroke: "var(--studio)", strokeWidth: "24", strokeDasharray: "180 320", transform: "rotate(-90 110 110)" }), _jsx("circle", { cx: "110", cy: "110", r: "78", fill: "none", stroke: "var(--luxe)", strokeWidth: "24", strokeDasharray: "90 320", strokeDashoffset: "-180", transform: "rotate(-90 110 110)" }), _jsx("circle", { cx: "110", cy: "110", r: "78", fill: "none", stroke: "var(--corp)", strokeWidth: "24", strokeDasharray: "50 320", strokeDashoffset: "-270", transform: "rotate(-90 110 110)" }), _jsx("text", { x: "110", y: "114", textAnchor: "middle", fill: "var(--text0)", children: "100%" })] }), _jsxs("div", { className: "tags", children: [_jsx("span", { children: "Studio 56%" }), _jsx("span", { children: "Luxe 29%" }), _jsx("span", { children: "Corporate 15%" })] })] }), _jsxs("article", { className: "card reveal-card", children: [_jsxs("div", { className: "section-header", children: [_jsx("h3", { children: "Top Products" }), _jsxs("select", { value: sortBy, onChange: (event) => setSortBy(event.target.value), children: [_jsx("option", { value: "reviewCount", children: "Units Sold" }), _jsx("option", { value: "rating", children: "Rating" }), _jsx("option", { value: "ecoScore", children: "Eco Score" })] })] }), _jsxs("table", { style: { width: "100%", marginTop: 8 }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Product" }), _jsx("th", { children: "Division" }), _jsx("th", { children: "Rating" }), _jsx("th", { children: "Eco" })] }) }), _jsx("tbody", { children: topProducts.map((product) => (_jsxs("tr", { children: [_jsx("td", { children: product.name }), _jsx("td", { children: product.division }), _jsx("td", { children: product.rating.toFixed(1) }), _jsx("td", { children: product.ecoScore })] }, product.id))) })] })] })] }), _jsxs("section", { className: "card-grid-3", children: [_jsxs("article", { className: "card reveal-card", children: [_jsx("h4", { children: "Customer Analytics" }), _jsx("p", { children: "New vs Returning: 42% / 58%" }), _jsx("small", { children: "Top cities: Bengaluru, Mumbai, Hyderabad, Pune" })] }), _jsxs("article", { className: "card reveal-card", children: [_jsx("h4", { children: "AI Analytics" }), _jsx("p", { children: "Assisted Revenue: \u20B918.2L" }), _jsx("small", { children: "Most asked: style match, order ETA, corporate quote" })] }), _jsxs("article", { className: "card reveal-card", children: [_jsx("h4", { children: "Studio Analytics" }), _jsx("p", { children: "Peak booking hours: 11AM - 3PM" }), _jsx("small", { children: "Session completion rate: 96%" })] })] })] }));
}
export function SettingsPage() {
    const { user, theme, setTheme } = useApp();
    const { toast } = useToast();
    const [tab, setTab] = useState("Profile");
    const tabs = [
        "Profile",
        "Security",
        "Notifications",
        "Privacy",
        "Addresses",
        "Payment Methods",
        "Subscriptions",
        "Integrations",
        "Appearance"
    ];
    return (_jsxs(ViewContainer, { id: "view-settings", children: [_jsx("h2", { children: "Settings & Account Control" }), _jsx("div", { className: "tags", children: tabs.map((item) => (_jsx("button", { type: "button", className: tab === item ? "btn-gold" : "btn-ghost", onClick: () => setTab(item), children: item }, item))) }), _jsxs("section", { className: "card reveal-card", children: [tab === "Profile" ? (_jsxs("div", { className: "field", children: [_jsx("h3", { children: "Profile" }), _jsxs("div", { className: "field-row", children: [_jsx("input", { defaultValue: user?.name }), _jsx("input", { defaultValue: user?.email, readOnly: true }), _jsx("input", { placeholder: "Phone", defaultValue: "+91-9876543210" }), _jsx("input", { placeholder: "Social link" })] }), _jsx("textarea", { rows: 4, placeholder: "Bio", defaultValue: "Creator at 360Shopie" }), _jsx("button", { type: "button", className: "btn-gold", onClick: () => toast("Profile saved", "success", 1800), children: "Save Profile" })] })) : null, tab === "Security" ? (_jsxs("div", { className: "field", children: [_jsx("h3", { children: "Security" }), _jsxs("div", { className: "field-row", children: [_jsx("input", { type: "password", placeholder: "Current password" }), _jsx("input", { type: "password", placeholder: "New password" })] }), _jsxs("label", { children: [_jsx("input", { type: "checkbox", defaultChecked: true }), " Enable 2FA (OTP simulation)"] }), _jsx("button", { type: "button", className: "btn-gold", children: "Update Security" })] })) : null, tab === "Notifications" ? (_jsxs("div", { className: "field", children: [_jsx("h3", { children: "Notification Preferences" }), [
                                "Orders",
                                "Bookings",
                                "AI Matches",
                                "Offers",
                                "Corporate Enquiries"
                            ].map((item) => (_jsxs("label", { children: [_jsx("input", { type: "checkbox", defaultChecked: true }), " ", item] }, item)))] })) : null, tab === "Privacy" ? (_jsxs("div", { className: "field", children: [_jsx("h3", { children: "Privacy" }), _jsx("button", { type: "button", className: "btn-ghost", children: "Request Data Export" }), _jsx("button", { type: "button", className: "btn-ghost", children: "AI Data Opt-out" }), _jsx("button", { type: "button", className: "btn-corp", children: "Delete Account" })] })) : null, tab === "Addresses" ? (_jsxs("div", { className: "field", children: [_jsx("h3", { children: "Addresses" }), _jsx("div", { className: "card", children: "\uD83C\uDFE0 Indiranagar, Bengaluru 560038" }), _jsx("div", { className: "card", children: "\uD83C\uDFE2 HSR Layout, Bengaluru 560102" }), _jsx("button", { type: "button", className: "btn-gold", children: "Add Address" })] })) : null, tab === "Payment Methods" ? (_jsxs("div", { className: "field", children: [_jsx("h3", { children: "Payment Methods" }), _jsx("div", { className: "card", children: "Card \u2022\u2022\u2022\u2022 1842" }), _jsx("div", { className: "card", children: "UPI: aadhya@upi" }), _jsx("button", { type: "button", className: "btn-gold", children: "Add Method" })] })) : null, tab === "Subscriptions" ? (_jsxs("div", { className: "field", children: [_jsx("h3", { children: "Subscriptions" }), _jsx("p", { children: "Current Plan: Platinum Suite" }), _jsx("div", { className: "password-meter", children: _jsx("span", { style: { width: "72%", background: "var(--gold)" } }) }), _jsx("small", { children: "72% monthly usage" }), _jsx("button", { type: "button", className: "btn-corp", children: "Upgrade Plan" })] })) : null, tab === "Integrations" ? (_jsxs("div", { className: "field", children: [_jsx("h3", { children: "Integrations" }), [
                                "Google Calendar",
                                "Razorpay",
                                "WhatsApp Notifications"
                            ].map((integration) => (_jsxs("label", { children: [_jsx("input", { type: "checkbox", defaultChecked: true }), " ", integration] }, integration)))] })) : null, tab === "Appearance" ? (_jsxs("div", { className: "field", children: [_jsx("h3", { children: "Appearance" }), _jsxs("div", { className: "tags", children: [_jsx("button", { type: "button", className: theme === "dark" ? "btn-gold" : "btn-ghost", onClick: () => setTheme("dark"), children: "Dark" }), _jsx("button", { type: "button", className: theme === "light" ? "btn-gold" : "btn-ghost", onClick: () => setTheme("light"), children: "Light" })] }), _jsx("div", { className: "tags", children: ["gold", "teal", "blue", "purple", "rose"].map((accent) => (_jsx("span", { children: accent }, accent))) })] })) : null] })] }));
}
export function NotificationsPage() {
    const navigate = useNavigate();
    const { refreshBootstrapData } = useApp();
    const [filter, setFilter] = useState("All");
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    async function loadData(selected = filter) {
        setLoading(true);
        try {
            const data = await getNotifications(selected === "All" ? undefined : selected);
            setItems(data.items);
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        void loadData();
    }, [filter]);
    return (_jsxs(ViewContainer, { id: "view-notifications", children: [_jsxs("div", { className: "section-header", children: [_jsx("h2", { children: "Notifications Centre" }), _jsx("button", { type: "button", className: "btn-gold", onClick: async () => {
                            await markAllNotificationsRead();
                            await loadData();
                            await refreshBootstrapData();
                        }, children: "Mark all read" })] }), _jsx("div", { className: "tags", children: ["All", "Unread", "STUDIO", "FASHION", "CORPORATE", "SYSTEM", "AI"].map((tab) => (_jsx("button", { type: "button", className: filter === tab ? "btn-gold" : "btn-ghost", onClick: () => setFilter(tab), children: tab }, tab))) }), loading ? (_jsxs("div", { className: "skeleton-list", children: [_jsx("div", { className: "skeleton h-72" }), _jsx("div", { className: "skeleton h-72" })] })) : items.length === 0 ? (_jsx(EmptyState, { icon: "\uD83C\uDF89", title: "You're all caught up", description: "No notifications in this category." })) : (_jsx("section", { style: { display: "grid", gap: 10 }, children: items
                    .filter((item) => (filter === "Unread" ? !item.isRead : true))
                    .map((item) => (_jsxs("article", { className: "card reveal-card", style: { borderColor: item.isRead ? undefined : "var(--border2)" }, children: [_jsxs("div", { className: "section-header", children: [_jsx("strong", { children: item.title }), _jsx("small", { children: formatRelative(item.createdAt) })] }), _jsx("p", { children: item.description }), _jsxs("div", { className: "tags", style: { marginTop: 8 }, children: [_jsx("button", { type: "button", className: "btn-ghost", onClick: async () => {
                                        await markNotificationRead(item.id);
                                        await loadData();
                                        await refreshBootstrapData();
                                    }, children: "Mark read" }), item.actionRoute ? (_jsx("button", { type: "button", className: "btn-corp", onClick: () => navigate(`/${item.actionRoute}`), children: "Open" })) : null] })] }, item.id))) }))] }));
}
export function LoyaltyPage() {
    const { user } = useApp();
    const points = user?.loyaltyPoints ?? 2840;
    const progress = Math.min(100, (points / 5000) * 100);
    return (_jsxs(ViewContainer, { id: "view-loyalty", children: [_jsxs("section", { className: "hero-card", "data-parallax": "0.15", children: [_jsx("h2", { children: "Loyalty & Rewards" }), _jsx("p", { children: "Earn and redeem across Studio, Luxe, and Corporate experiences." })] }), _jsxs("section", { className: "card reveal-card", children: [_jsx("h3", { children: "Points Card" }), _jsx(AnimatedCounter, { value: points }), _jsxs("p", { children: ["Tier: Gold \u00B7 ", formatNumberIndian(5000 - points), " points to Platinum"] }), _jsx("div", { className: "password-meter", style: { marginTop: 8 }, children: _jsx("span", { style: { width: `${progress}%`, background: "var(--gold)" } }) }), _jsx("small", { children: "Points expire on 31 Dec 2026" })] }), _jsxs("section", { className: "card-grid-2", children: [_jsxs("article", { className: "card reveal-card", children: [_jsx("h3", { children: "Earn Points" }), _jsxs("ul", { children: [_jsx("li", { children: "Book a session +200 pts" }), _jsx("li", { children: "Purchase +1 pt per \u20B910" }), _jsx("li", { children: "Refer a friend +500 pts" }), _jsx("li", { children: "Write a review +50 pts" }), _jsx("li", { children: "Complete profile +100 pts" })] })] }), _jsxs("article", { className: "card reveal-card", children: [_jsx("h3", { children: "Redeem Points" }), _jsxs("div", { style: { display: "grid", gap: 8 }, children: [_jsx("div", { className: "card", children: "\u20B9500 off over \u20B93,000 \u00B7 1,000 pts" }), _jsx("div", { className: "card", children: "Free session upgrade \u00B7 1,500 pts" }), _jsx("div", { className: "card", children: "Priority slot access \u00B7 700 pts" })] })] })] })] }));
}
export function ReferralPage() {
    const { user } = useApp();
    const code = user?.referralCode ?? "AADHYA500";
    return (_jsxs(ViewContainer, { id: "view-referral", children: [_jsx("h2", { children: "Refer & Earn" }), _jsxs("section", { className: "card reveal-card", children: [_jsx("h3", { children: "Your Referral Code" }), _jsxs("div", { className: "section-header", style: { marginTop: 8 }, children: [_jsx("strong", { style: { fontSize: "1.6rem" }, children: code }), _jsxs("div", { className: "tags", children: [_jsx("button", { type: "button", className: "btn-gold", onClick: () => navigator.clipboard.writeText(code), children: "Copy" }), _jsx("button", { type: "button", className: "btn-corp", children: "Share WhatsApp" })] })] })] }), _jsxs("section", { className: "card-grid-3", children: [_jsxs("article", { className: "card metric", children: [_jsx("h4", { children: "Sent" }), _jsx(AnimatedCounter, { value: 24 })] }), _jsxs("article", { className: "card metric", children: [_jsx("h4", { children: "Signed Up" }), _jsx(AnimatedCounter, { value: 11 })] }), _jsxs("article", { className: "card metric", children: [_jsx("h4", { children: "Earned" }), _jsx(AnimatedCounter, { value: 55000, prefix: "\u20B9" })] })] }), _jsxs("section", { className: "card reveal-card", children: [_jsx("h3", { children: "How it works" }), _jsx("p", { children: "Share \u2192 Friend signs up \u2192 Friend makes first purchase \u2192 You earn \u20B9500" }), _jsxs("table", { style: { width: "100%", marginTop: 10 }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Name" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Reward" })] }) }), _jsxs("tbody", { children: [_jsxs("tr", { children: [_jsx("td", { children: "stellary.io" }), _jsx("td", { children: "Signed up" }), _jsx("td", { children: "\u20B9500" })] }), _jsxs("tr", { children: [_jsx("td", { children: "finleaf.in" }), _jsx("td", { children: "Invite sent" }), _jsx("td", { children: "Pending" })] })] })] })] })] }));
}
export function HelpPage() {
    const [query, setQuery] = useState("");
    const [openFaq, setOpenFaq] = useState(null);
    const faqs = [
        { q: "How do I track an order?", a: "Open My Orders and click Track Order to view the live timeline." },
        { q: "Can I reschedule studio sessions?", a: "Yes, go to Studio > Upcoming and click Reschedule." },
        { q: "How do returns work?", a: "Select order item, choose reason, and pick a pickup slot." },
        { q: "How is AI style score calculated?", a: "It combines style preferences, color season, and fit profile." }
    ];
    const visible = faqs.filter((item) => item.q.toLowerCase().includes(query.toLowerCase()));
    return (_jsxs(ViewContainer, { id: "view-help", children: [_jsx("h2", { children: "Help & Support" }), _jsx("input", { value: query, onChange: (event) => setQuery(event.target.value), placeholder: "How can we help you?" }), _jsxs("section", { className: "card reveal-card", style: { marginTop: 10 }, children: [_jsx("h3", { children: "FAQ" }), _jsx("div", { style: { display: "grid", gap: 8, marginTop: 8 }, children: visible.map((faq) => (_jsxs("article", { className: "card", children: [_jsxs("button", { type: "button", className: "section-header", onClick: () => setOpenFaq((current) => (current === faq.q ? null : faq.q)), children: [_jsx("strong", { children: faq.q }), _jsx("span", { children: openFaq === faq.q ? "−" : "+" })] }), openFaq === faq.q ? _jsx("p", { style: { marginTop: 8 }, children: faq.a }) : null] }, faq.q))) })] }), _jsxs("section", { className: "card-grid-2", children: [_jsxs("article", { className: "card reveal-card", children: [_jsx("h3", { children: "Contact Options" }), _jsxs("div", { className: "tags", style: { marginTop: 8 }, children: [_jsx("button", { type: "button", className: "btn-gold", children: "Live Chat" }), _jsx("button", { type: "button", className: "btn-ghost", children: "Email Support" }), _jsx("button", { type: "button", className: "btn-ghost", children: "WhatsApp" }), _jsx("button", { type: "button", className: "btn-corp", children: "Request Callback" })] })] }), _jsxs("article", { className: "card reveal-card", children: [_jsx("h3", { children: "System Status" }), _jsxs("ul", { children: [_jsx("li", { children: "Website: \u2705 Operational" }), _jsx("li", { children: "Payments: \u2705 Operational" }), _jsx("li", { children: "AI Services: \u2705 Operational" }), _jsx("li", { children: "Frame Sync: \u26A0 Partial delay" })] })] })] })] }));
}
