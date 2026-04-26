import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createOrder,
  createStudioBooking,
  getAnalyticsSummary,
  getDashboard,
  getNotifications,
  getOrders,
  getProduct,
  getProducts,
  getStudioBookings,
  getAlbums,
  getFrames,
  getModels,
  markAllNotificationsRead,
  markNotificationRead
} from "../lib/api";
import {
  formatCompactINR,
  formatDate,
  formatINR,
  formatNumberIndian,
  formatRelative
} from "../lib/format";
import { useApp } from "../context/AppContext";
import { useModal } from "../context/ModalContext";
import { useToast } from "../context/ToastContext";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { ProductCard } from "../components/ProductCard";
import type {
  DashboardOverview,
  NotificationItem,
  Order,
  Product,
  StudioBooking,
  WishlistItem,
  Album,
  SmartFrame,
  TalentModel
} from "../types";

function ViewContainer({ id, children }: { id: string; children: ReactNode }) {
  return (
    <section id={id} className="view active">
      {children}
    </section>
  );
}

function Sparkline({ points }: { points: number[] }) {
  const max = Math.max(...points, 1);
  const mapped = points
    .map((point, index) => {
      const x = (index / (points.length - 1 || 1)) * 100;
      const y = 100 - (point / max) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="sparkline" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={mapped} />
    </svg>
  );
}

function EmptyState({ icon, title, description, action }: { icon: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <span>{icon}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}



function buildPath(values: readonly number[], max: number, width = 660, height = 200): string {
  if (values.length === 0) return "";
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
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityFilter, setActivityFilter] = useState("All");
  const [calendarMode, setCalendarMode] = useState<"month" | "timeline">("month");

  useEffect(() => {
    let mounted = true;
    async function bootstrap() {
      try {
        setLoading(true);
        const [overviewData, productsData] = await Promise.all([getDashboard(), getProducts({ division: "LUXE" })]);
        if (!mounted) return;
        setOverview(overviewData);
        setProducts(productsData.slice(0, 6));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Morning";
    if (hour < 17) return "Afternoon";
    return "Evening";
  }, []);

  const activeSeries = overview?.revenueHistory ?? {
    labels: ["Past", "Recent", "Now"],
    studio: [0, 0, 0],
    luxe: [0, 0, 0],
    corp: [0, 0, 0]
  };
  const chartMax = Math.max(...activeSeries.studio, ...activeSeries.luxe, ...activeSeries.corp, 1);
  const hoveredPoint = activeSeries.labels.length - 1;

  const metrics = [
    {
      title: "Total Revenue",
      value: overview?.metrics.totalRevenuePaise ?? 0,
      prefix: "₹",
      route: "/view-analytics",
      points: overview?.revenueHistory.luxe ?? [0,0,0],
      change: "+12.4%"
    },
    {
      title: "Orders",
      value: overview?.metrics.totalOrders ?? 0,
      route: "/view-orders",
      points: [0, 0, overview?.metrics.totalOrders ?? 0],
      change: "+7.1%"
    },
    {
      title: "Studio Sessions",
      value: overview?.metrics.totalBookings ?? 0,
      route: "/view-studio",
      points: [0, 0, overview?.metrics.totalBookings ?? 0],
      change: "+9.8%"
    },
    {
      title: "Wishlist",
      value: overview?.metrics.wishlistCount ?? 0,
      route: "/view-wishlist",
      points: [0, 0, overview?.metrics.wishlistCount ?? 0],
      change: "+5.6%"
    }
  ];

  const filteredActivity = (overview?.activityFeed ?? []).filter((item) => activityFilter === "All" || item.type === activityFilter);

  return (
    <ViewContainer id="view-dashboard">
      <section className="hero-card" data-parallax="0.3">
        <h2>
          Good {greeting}, {user?.name.split(" ")[0] ?? "Creator"}
        </h2>
        <p style={{ marginTop: 6 }}>Today at a glance for 360Studio, Udhikxa Luxe, and Corporate Gifts.</p>
        <div className="quick-pill-strip">
          {(overview?.quickStats ?? ["Next session in 2 days", "1 order arriving", "3 AI picks waiting"]).map((stat) => (
            <span key={stat}>{stat}</span>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="skeleton-list">
          <div className="skeleton h-72" />
          <div className="skeleton h-72" />
          <div className="skeleton h-72" />
        </div>
      ) : (
        <>
          <section className="metrics-grid">
            {metrics.map((metric) => (
              <button
                type="button"
                className="card metric"
                key={metric.title}
                onClick={() => navigate(metric.route)}
              >
                <h4>{metric.title}</h4>
                <AnimatedCounter value={metric.value / (metric.prefix ? 100 : 1)} prefix={metric.prefix} />
                <small style={{ color: "var(--green)" }}>↗ {metric.change}</small>
                <Sparkline points={metric.points} />
              </button>
            ))}
          </section>

          <section className="card reveal-card">
            <div className="section-header">
              <h3>Revenue Overview</h3>
              <div className="tags">
                <span className="btn-gold">Recent Trends</span>
              </div>
            </div>
            <svg viewBox="0 0 700 250" width="100%" height="250" aria-label="Revenue chart">
              <path d={buildPath(activeSeries.studio, chartMax)} stroke="var(--studio)" fill="none" strokeWidth="3" />
              <path d={buildPath(activeSeries.luxe, chartMax)} stroke="var(--luxe)" fill="none" strokeWidth="3" />
              <path d={buildPath(activeSeries.corp, chartMax)} stroke="var(--corp)" fill="none" strokeWidth="3" />
              {activeSeries.labels.map((label: string, index: number) => (
                <text key={label} x={index * (660 / (activeSeries.labels.length - 1 || 1))} y="242" fill="var(--text2)" fontSize="11">
                  {label}
                </text>
              ))}
            </svg>
            <div className="tags">
              <span>Studio: {formatCompactINR(activeSeries.studio[hoveredPoint] * 10000)}</span>
              <span>Luxe: {formatCompactINR(activeSeries.luxe[hoveredPoint] * 10000)}</span>
              <span>Corp: {formatCompactINR(activeSeries.corp[hoveredPoint] * 10000)}</span>
            </div>
          </section>

          <section className="card-grid-2">
            <article className="card reveal-card">
              <div className="section-header">
                <h3>Activity Feed</h3>
                <button type="button" className="btn-ghost">
                  Load More
                </button>
              </div>
              <div className="tags" style={{ marginTop: 8 }}>
                {["All", "Studio", "Fashion", "Corporate", "AI"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={activityFilter === tag ? "btn-gold" : "btn-ghost"}
                    onClick={() => setActivityFilter(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                {filteredActivity.map((item: any) => (
                  <article key={item.id} className="card" style={{ padding: 10 }}>
                    <div className="section-header">
                      <strong>{item.text}</strong>
                      <small>{item.time}</small>
                    </div>
                    <p>{item.detail}</p>
                    <button type="button" className="link-btn" style={{ marginTop: 6 }}>
                      Quick Action
                    </button>
                  </article>
                ))}
              </div>
            </article>

            <article className="card reveal-card">
              <div className="section-header">
                <h3>AI Picks</h3>
                <button type="button" className="btn-corp" onClick={() => navigate("/view-aistyle")}>Open AI Style</button>
              </div>
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4, marginTop: 8 }}>
                {products.map((product) => (
                  <div key={product.id} style={{ minWidth: 230 }}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="card-grid-2">
            <article className="card reveal-card">
              <div className="section-header">
                <h3>Upcoming Sessions Calendar</h3>
                <div className="tags">
                  <button
                    type="button"
                    className={calendarMode === "month" ? "btn-gold" : "btn-ghost"}
                    onClick={() => setCalendarMode("month")}
                  >
                    Month
                  </button>
                  <button
                    type="button"
                    className={calendarMode === "timeline" ? "btn-gold" : "btn-ghost"}
                    onClick={() => setCalendarMode("timeline")}
                  >
                    Next 7 Days
                  </button>
                </div>
              </div>
              {calendarMode === "month" ? (
                <div className="card-grid-4" style={{ marginTop: 10 }}>
                  {Array.from({ length: 28 }).map((_, index) => (
                    <div key={index} className="card" style={{ padding: 8, textAlign: "center", minHeight: 54 }}>
                      <small>{index + 1}</small>
                      {[3, 7, 11, 19, 24].includes(index + 1) ? (
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", margin: "6px auto 0" }} />
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                    <div key={day} className="card" style={{ padding: 10 }}>
                      <strong>
                        {day} · {new Date(Date.now() + index * 86400000).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </strong>
                      <p>{index % 2 ? "1 booking scheduled" : "No booking"}</p>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="card reveal-card">
              <h3>Quick Stats Widgets</h3>
              <div className="card-grid-2" style={{ marginTop: 10 }}>
                <div className="card metric">
                  <h4>Loyalty Points</h4>
                  <AnimatedCounter value={overview?.metrics.loyaltyPoints ?? 0} />
                  <small>{(overview?.metrics.loyaltyPoints ?? 0).toLocaleString()} / 5,000 to Gold</small>
                </div>
                <div className="card metric">
                  <h4>AI Style Score</h4>
                  <AnimatedCounter value={87} suffix="%" />
                  <small>High compatibility for curated edits</small>
                </div>
                <div className="card metric">
                  <h4>Eco Impact</h4>
                  <AnimatedCounter value={4.2} suffix="kg" />
                  <small>CO2 saved via eco purchases 🌳</small>
                </div>
                <div className="card metric">
                  <h4>Referral Code</h4>
                  <strong>{user?.referralCode ?? "AADHYA500"}</strong>
                  <button
                    type="button"
                    className="btn-corp"
                    onClick={() => navigator.clipboard.writeText(user?.referralCode ?? "AADHYA500")}
                  >
                    Copy & Share
                  </button>
                </div>
              </div>
            </article>
          </section>
        </>
      )}
    </ViewContainer>
  );
}

export function StudioPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"book" | "upcoming" | "past" | "rental" | "packages" | "gallery">("book");
  const [bookings, setBookings] = useState<StudioBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [wizardStep, setWizardStep] = useState(1);
  const [sessionType, setSessionType] = useState("Portrait Session");
  const [addOns, setAddOns] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState<"1hr" | "2hr" | "Half-day" | "Full-day">("2hr");

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        setLoading(true);
        const data = await getStudioBookings();
        if (mounted) setBookings(data);
      } finally {
        if (mounted) setLoading(false);
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
  ] as const;

  return (
    <ViewContainer id="view-studio">
      <div className="section-header">
        <h2>360Studio Booking Command Centre</h2>
        <button type="button" className="btn-gold">Next Available Slot</button>
      </div>

      <div className="tags">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tab === item.id ? "btn-gold" : "btn-ghost"}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "book" ? (
        <section className="card-grid-2">
          <article className="card reveal-card">
            <h3>Step {wizardStep} of 5</h3>
            <p style={{ marginTop: 6 }}>Guided booking wizard with pricing preview and payment simulation.</p>
            <div className="section-divider" />

            {wizardStep === 1 ? (
              <div className="card-grid-2">
                {["Portrait Session", "Maternity Session", "Corporate Headshots", "Family Session"].map((type) => (
                  <button
                    type="button"
                    key={type}
                    className="card"
                    onClick={() => setSessionType(type)}
                    style={{ borderColor: sessionType === type ? "var(--border2)" : undefined }}
                  >
                    <h4>{type}</h4>
                    <p>Click to choose this session format.</p>
                  </button>
                ))}
              </div>
            ) : null}

            {wizardStep === 2 ? (
              <div className="tags">
                {["Backdrop Colours", "Makeup Artist +₹1,500", "Hair Stylist +₹2,000", "Extra Prints Pack"].map((addon) => (
                  <button
                    key={addon}
                    type="button"
                    className={addOns.includes(addon) ? "btn-gold" : "btn-ghost"}
                    onClick={() =>
                      setAddOns((current) =>
                        current.includes(addon) ? current.filter((item) => item !== addon) : [...current, addon]
                      )
                    }
                  >
                    {addon}
                  </button>
                ))}
              </div>
            ) : null}

            {wizardStep === 3 ? (
              <div className="field-row">
                <label className="field">
                  <span>Date & Time</span>
                  <input type="datetime-local" value={date} onChange={(event) => setDate(event.target.value)} />
                </label>
                <label className="field">
                  <span>Duration</span>
                  <select value={duration} onChange={(event) => setDuration(event.target.value as typeof duration)}>
                    <option>1hr</option>
                    <option>2hr</option>
                    <option>Half-day</option>
                    <option>Full-day</option>
                  </select>
                </label>
              </div>
            ) : null}

            {wizardStep === 4 ? (
              <div className="card-grid-3">
                {["Ava", "Mira", "Rhea", "Ira", "Sam", "Kabir"].map((model) => (
                  <button key={model} type="button" className="card">
                    <div style={{ fontSize: "1.6rem" }}>💎</div>
                    <strong>{model}</strong>
                    <small>Editorial · Available</small>
                  </button>
                ))}
              </div>
            ) : null}

            {wizardStep === 5 ? (
              <div className="card">
                <h4>Review & Payment</h4>
                <p>Session: {sessionType}</p>
                <p>Duration: {duration}</p>
                <p>Add-ons: {addOns.length ? addOns.join(", ") : "None"}</p>
                <p>
                  Estimated total:{" "}
                  <strong>
                    {formatINR(
                      duration === "Full-day"
                        ? 4999900
                        : duration === "Half-day"
                          ? 2999900
                          : duration === "2hr"
                            ? 1599900
                            : 999900
                    )}
                  </strong>
                </p>
              </div>
            ) : null}

            <div className="section-divider" />
            <div className="section-header">
              <button
                type="button"
                className="btn-ghost"
                disabled={wizardStep === 1}
                onClick={() => setWizardStep((step) => Math.max(1, step - 1))}
              >
                Back
              </button>
              {wizardStep < 5 ? (
                <button type="button" className="btn-gold" onClick={() => setWizardStep((step) => Math.min(5, step + 1))}>
                  Next Step
                </button>
              ) : (
                <button type="button" className="btn-gold" onClick={() => void submitBooking()}>
                  Confirm Booking
                </button>
              )}
            </div>
          </article>

          <article className="card reveal-card">
            <h3>Availability Calendar</h3>
            <p style={{ marginTop: 6 }}>Green: available · Red: booked · Gold: limited slots.</p>
            <div className="card-grid-4" style={{ marginTop: 10 }}>
              {Array.from({ length: 28 }).map((_, index) => {
                const day = index + 1;
                const tone = day % 7 === 0 ? "var(--red)" : day % 5 === 0 ? "var(--gold)" : "var(--green)";
                return (
                  <div key={day} className="card" style={{ textAlign: "center", padding: 8 }}>
                    <small>{day}</small>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: tone, margin: "6px auto 0" }} />
                  </div>
                );
              })}
            </div>
            <div className="section-divider" />
            <h4>Photographer Profiles</h4>
            <div className="tags" style={{ marginTop: 8 }}>
              {["Nikhil · Portrait", "Anvi · Editorial", "Rahul · Corporate", "Maya · Family"].map((name) => (
                <span key={name}>{name}</span>
              ))}
            </div>
          </article>
        </section>
      ) : null}

      {tab === "upcoming" ? (
        <section className="card reveal-card">
          <h3>Upcoming Sessions Timeline</h3>
          {loading ? (
            <div className="skeleton-list" style={{ marginTop: 10 }}>
              <div className="skeleton h-72" />
              <div className="skeleton h-72" />
            </div>
          ) : upcoming.length === 0 ? (
            <EmptyState icon="📅" title="No upcoming sessions" description="Book a studio slot to see timeline entries here." />
          ) : (
            <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
              {upcoming.map((booking) => (
                <article key={booking.id} className="card" style={{ padding: 12 }}>
                  <div className="section-header">
                    <strong>{booking.sessionType}</strong>
                    <span>{booking.status}</span>
                  </div>
                  <p>
                    {formatDate(booking.bookingDate)} · {booking.duration}
                  </p>
                  <small>Amount: {formatINR(booking.amountPaise)}</small>
                  <div className="tags" style={{ marginTop: 8 }}>
                    <button type="button" className="btn-ghost">
                      Reschedule
                    </button>
                    <button type="button" className="btn-ghost">
                      Download Invoice
                    </button>
                    <button type="button" className="btn-corp">
                      Add to Calendar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {tab === "past" ? (
        <section className="card reveal-card">
          <h3>Past Sessions</h3>
          <div className="card-grid-4" style={{ marginTop: 10 }}>
            {[...(past.length ? past : upcoming)].map((session, index) => (
              <button key={session.id ?? index} type="button" className="card" style={{ textAlign: "left" }}>
                <div style={{ fontSize: "2rem" }}>🖼</div>
                <strong>{session.sessionType}</strong>
                <small>{formatDate(session.bookingDate)}</small>
                <small>Tap to open details & rating</small>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {tab === "rental" ? (
        <section className="card reveal-card">
          <div className="section-header">
            <h3>Cultural Dress Rental</h3>
            <div className="tags">
              {["Indian", "Japanese", "Arabic", "African", "Thai", "Western", "Korean"].map((culture) => (
                <span key={culture}>{culture}</span>
              ))}
            </div>
          </div>
          <div className="product-grid" style={{ marginTop: 10 }}>
            {["Royal Lehenga", "Kimono Set", "Arabic Abaya", "Kente Wrap"].map((item) => (
              <article key={item} className="card">
                <div className="image-tile">👘</div>
                <h4>{item}</h4>
                <p>Fabric: Premium blend · Occasion: Cultural/Editorial</p>
                <small>Deposit ₹2,000 · Rental ₹3,500</small>
                <div className="tags" style={{ marginTop: 8 }}>
                  <button type="button" className="btn-ghost">Size Guide</button>
                  <button type="button" className="btn-corp">Try Virtually</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {tab === "packages" ? (
        <section className="card reveal-card">
          <h3>Studio Packages</h3>
          <div className="card-grid-3" style={{ marginTop: 10 }}>
            {[
              { name: "Standard", price: "₹19,999", features: ["2hr session", "1 backdrop", "15 edits"] },
              { name: "Premium", price: "₹34,999", features: ["Half-day", "Stylist", "40 edits"], popular: true },
              { name: "Platinum", price: "₹59,999", features: ["Full-day", "Makeup + Hair", "Unlimited exports"] }
            ].map((pkg) => (
              <article key={pkg.name} className="card" style={{ borderColor: pkg.popular ? "var(--gold)" : undefined }}>
                <h4>{pkg.name}</h4>
                {pkg.popular ? <small style={{ color: "var(--gold-l)" }}>Most Popular</small> : null}
                <p style={{ margin: "6px 0" }}>{pkg.price}</p>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {pkg.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <button type="button" className="btn-gold" style={{ marginTop: 10 }}>
                  Choose Plan
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {tab === "gallery" ? (
        <section className="card reveal-card">
          <h3>My Studio Gallery</h3>
          <div style={{ columns: 4, columnGap: 10, marginTop: 10 }}>
            {Array.from({ length: 20 }).map((_, index) => (
              <div key={index} className="card" style={{ marginBottom: 10, minHeight: 90 + (index % 5) * 20 }}>
                <div style={{ fontSize: "2rem" }}>{index % 3 ? "📷" : "🎞"}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </ViewContainer>
  );
}

export function AlbumsPage() {
  const { openModal, closeModal } = useModal();
  const [filter, setFilter] = useState("All");
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        setLoading(true);
        const data = await getAlbums();
        if (mounted) setAlbums(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <ViewContainer id="view-albums">
      <div className="section-header">
        <h2>Digital Albums</h2>
        <div className="tags">
          {["All", "Recent", "Favourited", "Shared"].map((item) => (
            <button
              key={item}
              type="button"
              className={filter === item ? "btn-gold" : "btn-ghost"}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="skeleton-list"><div className="skeleton h-72" /><div className="skeleton h-72" /></div>
      ) : (
        <section className="product-grid">
        {albums.map((album) => (
          <article key={album.id} className="card reveal-card tilt-card">
            <div className="card-grid-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="card" style={{ minHeight: 42, display: "grid", placeItems: "center", padding: 0 }}>
                  {index % 2 ? "🖼" : "📸"}
                </div>
              ))}
            </div>
            <h4 style={{ marginTop: 10 }}>{album.name}</h4>
            <p>
              {formatDate(album.date)} · {album.count} photos · {album.size}
            </p>
            {album.ai ? <small style={{ color: "var(--ai)" }}>AI Enhanced</small> : null}
            <div className="tags" style={{ marginTop: 8 }}>
              <button type="button" className="btn-ghost">Download</button>
              <button type="button" className="btn-ghost">Share</button>
              <button type="button" className="btn-corp">Push to Frame</button>
              <button
                type="button"
                className="btn-gold"
                onClick={() => {
                  const modalId = openModal({
                    title: album.name,
                    body: (
                      <div>
                        <p>Masonry preview with select mode, AI toggle, and share controls.</p>
                        <div className="card-grid-3" style={{ marginTop: 10 }}>
                          {Array.from({ length: 9 }).map((_, index) => (
                            <div key={index} className="card" style={{ minHeight: 90, display: "grid", placeItems: "center" }}>
                              {index % 2 ? "📷" : "🖼"}
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                    actions: (
                      <>
                        <button type="button" className="btn-ghost" onClick={() => closeModal(modalId)}>
                          Close
                        </button>
                        <button type="button" className="btn-gold">
                          Generate Share Link
                        </button>
                      </>
                    )
                  });
                }}
              >
                Open
              </button>
            </div>
          </article>
        ))}
      </section>
      )}
    </ViewContainer>
  );
}

export function FramesPage() {
  const [selected, setSelected] = useState(0);
  const [previewEmoji, setPreviewEmoji] = useState("🖼");
  const [frames, setFrames] = useState<SmartFrame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        setLoading(true);
        const data = await getFrames();
        if (mounted) setFrames(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const pool = ["🖼", "📸", "🎞", "🌄", "👗"];
    const timer = window.setInterval(() => {
      setPreviewEmoji(pool[Math.floor(Math.random() * pool.length)]);
    }, 3000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <ViewContainer id="view-frames">
      <div className="section-header">
        <h2>Smart Frames Dashboard</h2>
        <button type="button" className="btn-gold">Add New Frame</button>
      </div>
      {loading ? (
        <div className="skeleton h-48" />
      ) : (
        <>
          <section className="card-grid-3">
        {frames.map((frame, index) => (
          <button key={frame.id} type="button" className="card reveal-card" onClick={() => setSelected(index)}>
            <div className="image-tile">{previewEmoji}</div>
            <div className="section-header" style={{ marginTop: 8 }}>
              <strong>{frame.name}</strong>
              <small>{frame.status}</small>
            </div>
            <p>
              {frame.location} · {frame.slide}
            </p>
            <small>Last sync {frame.lastSync}</small>
          </button>
        ))}
      </section>

      <section className="card reveal-card">
        <h3>Frame Detail · {frames[selected]?.name}</h3>
        <div className="card-grid-2" style={{ marginTop: 10 }}>
          <div className="card" style={{ minHeight: 260, display: "grid", placeItems: "center" }}>
            <div style={{ fontSize: "5rem" }}>{previewEmoji}</div>
          </div>
          <div className="field">
            <label>
              Transition Effect
              <select>
                <option>Fade</option>
                <option>Slide</option>
                <option>Zoom</option>
                <option>Ken Burns</option>
              </select>
            </label>
            <label>
              Interval
              <select>
                <option>5s</option>
                <option>10s</option>
                <option>30s</option>
                <option>1min</option>
                <option>5min</option>
              </select>
            </label>
            <label>
              Brightness
              <input type="range" min={0} max={100} defaultValue={70} />
            </label>
            <label>
              Night Mode
              <input defaultValue="11:00 PM to 7:00 AM" readOnly />
            </label>
            <div className="tags">
              <button type="button" className="btn-ghost">Previous</button>
              <button type="button" className="btn-ghost">Next</button>
              <button type="button" className="btn-corp">Random</button>
            </div>
          </div>
        </div>
      </section>
      </>
      )}
    </ViewContainer>
  );
}

export function ModelingPage() {
  const { openModal } = useModal();
  const [filters, setFilters] = useState({ gender: "All", availability: "All" });
  const [models, setModels] = useState<TalentModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        setLoading(true);
        const data = await getModels();
        if (mounted) setModels(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const visible = models.filter((model) =>
    (filters.availability === "All" || model.status === filters.availability) &&
    (filters.gender === "All" || (filters.gender === "Women" ? model.name !== "Nikhil Dev" : model.name === "Nikhil Dev"))
  );

  return (
    <ViewContainer id="view-modeling">
      <h2>Model Selection · AI Casting Portal</h2>
      <section className="card-grid-4" style={{ marginTop: 10 }}>
        <label className="field">
          <span>Gender</span>
          <select value={filters.gender} onChange={(event) => setFilters((current) => ({ ...current, gender: event.target.value }))}>
            <option>All</option>
            <option>Women</option>
            <option>Men</option>
          </select>
        </label>
        <label className="field">
          <span>Availability</span>
          <select value={filters.availability} onChange={(event) => setFilters((current) => ({ ...current, availability: event.target.value }))}>
            <option>All</option>
            <option>Available</option>
            <option>Booked</option>
            <option>On Request</option>
          </select>
        </label>
        <label className="field">
          <span>Height</span>
          <input placeholder="e.g. 5'7" />
        </label>
        <label className="field">
          <span>Special Skills</span>
          <input placeholder="Runway, Cultural..." />
        </label>
      </section>
      {loading ? (
        <div className="skeleton-list"><div className="skeleton h-72" /><div className="skeleton h-72" /></div>
      ) : (
        <>
          <section className="product-grid">
        {visible.map((model) => (
          <article key={model.name} className="card reveal-card tilt-card">
            <div className="image-tile">💎</div>
            <h3>{model.name}</h3>
            <p>
              {model.age} yrs · {model.height}
            </p>
            <div className="tags">
              {model.tags.map((tag: string) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <small>Status: {model.status}</small>
            <strong>{formatINR(model.ratePaise)} / hr</strong>
            <button
              type="button"
              className="btn-gold"
              onClick={() =>
                openModal({
                  title: `${model.name} Profile`,
                  body: (
                    <div className="field">
                      <p>Experience: 5 years · Sessions: 214 · Avg Rating: 4.8</p>
                      <div className="card-grid-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <div key={index} className="card" style={{ minHeight: 90, display: "grid", placeItems: "center" }}>
                            🧿
                          </div>
                        ))}
                      </div>
                      <p>AI compatibility score: {model.score}% for your upcoming shoot.</p>
                    </div>
                  ),
                  actions: <button type="button" className="btn-gold">Book Model</button>
                })
              }
            >
              View Profile
            </button>
          </article>
        ))}
      </section>

      <section className="card reveal-card">
        <h3>AI Casting</h3>
        <div className="field-row" style={{ marginTop: 8 }}>
          <input placeholder="Shoot type" />
          <input placeholder="Theme" />
          <input placeholder="Dress style" />
          <input placeholder="Brand aesthetics" />
        </div>
        <div className="tags" style={{ marginTop: 10 }}>
          {visible.slice(0, 3).map((model) => (
            <span key={model.name}>{model.name} · {model.score}% match</span>
          ))}
        </div>
      </section>
      </>
      )}
    </ViewContainer>
  );
}

export function ShopPage() {
  const { openModal } = useModal();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [search, category, sort]);

  return (
    <ViewContainer id="view-shop">
      <section className="hero-card" data-parallax="0.25">
        <h2>Udhikxa Luxe Storefront</h2>
        <p>Free shipping over ₹3,000 · 100% Eco Certified · AI-Powered Style Match</p>
      </section>

      <section className="card-grid-4">
        <label className="field">
          <span>Search</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" />
        </label>
        <label className="field">
          <span>Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option>All</option>
            <option>Dresses</option>
            <option>Tops</option>
            <option>Kurtas</option>
            <option>Sarees</option>
            <option>Accessories</option>
          </select>
        </label>
        <label className="field">
          <span>Sort</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="newest">Newest</option>
            <option value="best">Best Sellers</option>
            <option value="low-high">Price Low-High</option>
            <option value="high-low">Price High-Low</option>
            <option value="rating">Rating</option>
            <option value="eco">Eco Score</option>
          </select>
        </label>
        <div className="field">
          <span>View</span>
          <div className="tags">
            <button type="button" className={viewMode === "grid" ? "btn-gold" : "btn-ghost"} onClick={() => setViewMode("grid")}>Grid</button>
            <button type="button" className={viewMode === "list" ? "btn-gold" : "btn-ghost"} onClick={() => setViewMode("list")}>List</button>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="skeleton-list">
          <div className="skeleton h-72" />
          <div className="skeleton h-72" />
          <div className="skeleton h-72" />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon="🛍"
          title="No products matched"
          description="Try clearing filters to browse the latest collection."
        />
      ) : viewMode === "grid" ? (
        <section className="product-grid">
          {products.map((product) => (
            <div key={product.id} onDoubleClick={() => openModal({ title: product.name, body: <p>{product.description}</p> })}>
              <ProductCard product={product} />
            </div>
          ))}
        </section>
      ) : (
        <section style={{ display: "grid", gap: 10 }}>
          {products.map((product) => (
            <article key={product.id} className="card reveal-card">
              <div className="card-grid-4">
                <div className="image-tile">{product.imageEmoji}</div>
                <div>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <small>{product.fabric}</small>
                </div>
                <div>
                  <strong>{formatINR(product.pricePaise)}</strong>
                  <p>⭐ {product.rating} · {product.reviewCount} reviews</p>
                </div>
                <button
                  type="button"
                  className="btn-gold"
                  onClick={() =>
                    openModal({
                      title: product.name,
                      body: <p>{product.description}</p>,
                      actions: <button type="button" className="btn-gold">Add to Cart</button>
                    })
                  }
                >
                  Quick View
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </ViewContainer>
  );
}

export function ProductDetailPage() {
  const { productId } = useParams();
  const { addToCart } = useApp();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [size, setSize] = useState("M");
  const [color, setColor] = useState("Default");
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState("Description");
  const [pincode, setPincode] = useState("");
  const [eta, setEta] = useState("");

  useEffect(() => {
    if (!productId) return;
    let mounted = true;
    void (async () => {
      try {
        setLoading(true);
        const data = await getProduct(productId);
        if (!mounted) return;
        setProduct(data);
        setSize(data.sizes?.[0] ?? "M");
        setColor(data.colors?.[0] ?? "Default");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [productId]);

  if (loading || !product) {
    return (
      <ViewContainer id="view-product">
        <div className="skeleton-list">
          <div className="skeleton h-72" />
          <div className="skeleton h-72" />
          <div className="skeleton h-72" />
        </div>
      </ViewContainer>
    );
  }

  return (
    <ViewContainer id="view-product">
      <section className="card-grid-2">
        <article className="card reveal-card">
          <div className="image-tile" style={{ minHeight: 300 }}>{product.imageEmoji}</div>
          <div className="card-grid-4" style={{ marginTop: 8 }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <button key={index} type="button" className="card" style={{ minHeight: 62 }}>
                {index % 2 ? "🖼" : "📷"}
              </button>
            ))}
          </div>
        </article>

        <article className="card reveal-card">
          <small>{product.division}</small>
          <h2>{product.name}</h2>
          <p>⭐ {product.rating} ({formatNumberIndian(product.reviewCount)} reviews)</p>
          <h3>{formatINR(product.pricePaise)}</h3>
          {product.originalPaise ? <s>{formatINR(product.originalPaise)}</s> : null}
          {product.seller && (
            <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--surface2)', borderRadius: 8, border: '1px border var(--border)' }}>
              <span style={{ fontSize: '0.85rem' }}>Sold by: <strong>{product.seller.name}</strong></span>
            </div>
          )}
          <p style={{ marginTop: 8 }}>{product.description}</p>
          <div className="section-divider" />

          <div className="field-row">
            <label className="field">
              <span>Size</span>
              <select value={size} onChange={(event) => setSize(event.target.value)}>
                {product.sizes.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Colour</span>
              <select value={color} onChange={(event) => setColor(event.target.value)}>
                {product.colors.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="field">
            <span>Quantity</span>
            <div className="qty-stepper" style={{ width: "fit-content" }}>
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
                −
              </button>
              <span>{quantity}</span>
              <button type="button" onClick={() => setQuantity((value) => Math.min(10, value + 1))}>
                +
              </button>
            </div>
          </div>

          <div className="tags">
            <button
              type="button"
              className="btn-gold"
              onClick={() =>
                void addToCart({
                  productId: product.id,
                  size,
                  color,
                  quantity
                })
              }
            >
              Add to Cart
            </button>
            <button type="button" className="btn-corp" onClick={() => toast("Buy now flow simulated", "info", 1800)}>
              Buy Now
            </button>
            <button type="button" className="btn-ghost">
              Add to Wishlist
            </button>
          </div>

          <div className="field-row" style={{ marginTop: 10 }}>
            <input value={pincode} onChange={(event) => setPincode(event.target.value)} placeholder="Enter pincode" />
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setEta(pincode.length >= 6 ? "Delivers by Tue, 30 Apr" : "Enter valid pincode")}
            >
              Check ETA
            </button>
          </div>
          {eta ? <small>{eta}</small> : null}
        </article>
      </section>

      <section className="card reveal-card">
        <div className="tags">
          {["Description", "Specifications", "Reviews", "AI Style Tips", "Returns Policy"].map((item) => (
            <button key={item} type="button" className={tab === item ? "btn-gold" : "btn-ghost"} onClick={() => setTab(item)}>
              {item}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 10 }}>
          {tab === "Description" ? <p>{product.description}</p> : null}
          {tab === "Specifications" ? (
            <table style={{ width: "100%" }}>
              <tbody>
                <tr><td>Fabric</td><td>{product.fabric}</td></tr>
                <tr><td>Category</td><td>{product.category}</td></tr>
                <tr><td>Eco Score</td><td>{product.ecoScore}/5</td></tr>
                <tr><td>Origin</td><td>Made in India</td></tr>
              </tbody>
            </table>
          ) : null}
          {tab === "Reviews" ? (
            <div style={{ display: "grid", gap: 8 }}>
              {["Perfect fit and breathable fabric.", "Looks premium and elegant.", "Colour exactly as shown."].map((review) => (
                <article key={review} className="card" style={{ padding: 10 }}>
                  <strong>★★★★★</strong>
                  <p>{review}</p>
                </article>
              ))}
            </div>
          ) : null}
          {tab === "AI Style Tips" ? (
            <ul>
              <li>Pair with minimal gold accessories for evening events.</li>
              <li>Add a structured jacket for corporate styling.</li>
              <li>Use earthy palette makeup for cohesive seasonal look.</li>
            </ul>
          ) : null}
          {tab === "Returns Policy" ? <p>7-day easy returns on unused items with tag intact.</p> : null}
        </div>
      </section>
    </ViewContainer>
  );
}

export function AIStylePage() {
  const { toast } = useToast();
  const [uploaded, setUploaded] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [occasion, setOccasion] = useState("Wedding");
  const [budget, setBudget] = useState(8000);

  useEffect(() => {
    if (!analyzing) return;
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

  return (
    <ViewContainer id="view-aistyle">
      <h2>AI Style Match Studio</h2>

      <section className="card-grid-2">
        <article className="card reveal-card">
          <h3>Upload Panel</h3>
          <button
            type="button"
            className="card"
            style={{ marginTop: 10, minHeight: 220, borderStyle: "dashed", display: "grid", placeItems: "center" }}
            onClick={() => {
              setUploaded("👤");
              setAnalyzing(true);
              setProgress(0);
            }}
          >
            {uploaded ? uploaded : "📷 Drop image or tap to upload"}
          </button>
          {analyzing ? (
            <>
              <div className="password-meter" style={{ marginTop: 10 }}>
                <span style={{ width: `${progress}%`, background: "var(--gold)" }} />
              </div>
              <small>Analyzing image... {progress}%</small>
            </>
          ) : null}
          <div className="tags" style={{ marginTop: 10 }}>
            <button type="button" className="btn-ghost">Retake</button>
            <button type="button" className="btn-ghost">Upload Different</button>
          </div>
        </article>

        <article className="card reveal-card">
          <h3>Style Preferences</h3>
          <div className="tags" style={{ marginTop: 8 }}>
            {["Wedding", "Work", "Travel", "Festive", "Date Night"].map((item) => (
              <button key={item} type="button" className={occasion === item ? "btn-gold" : "btn-ghost"} onClick={() => setOccasion(item)}>
                {item}
              </button>
            ))}
          </div>
          <div className="tags" style={{ marginTop: 10 }}>
            {["Elongate", "Curvy", "Structured", "Flowing"].map((goal) => (
              <span key={goal}>{goal}</span>
            ))}
          </div>
          <label className="field" style={{ marginTop: 10 }}>
            <span>Budget {formatINR(budget * 100)}</span>
            <input type="range" min={2000} max={25000} value={budget} onChange={(event) => setBudget(Number(event.target.value))} />
          </label>
          <div className="tags" style={{ marginTop: 10 }}>
            {["Earthy", "Jewel", "Pastels", "Monochrome", "Bright", "Neutrals"].map((palette) => (
              <span key={palette}>{palette}</span>
            ))}
          </div>
          <button type="button" className="btn-corp" style={{ marginTop: 10 }} onClick={() => toast("Preferences randomized", "info", 1600)}>
            Surprise Me
          </button>
        </article>
      </section>

      <section className="card-grid-2">
        <article className="card reveal-card">
          <h3>Feature Detection</h3>
          <div className="card-grid-2" style={{ marginTop: 10 }}>
            {["Face Shape", "Skin Tone", "Body Type", "Color Season"].map((label, index) => (
              <div key={label} className="card metric">
                <h4>{label}</h4>
                <AnimatedCounter value={74 + index * 6} suffix="%" />
              </div>
            ))}
          </div>
        </article>
        <article className="card reveal-card">
          <h3>Style DNA</h3>
          <svg viewBox="0 0 240 240" width="100%" height="220">
            <polygon points="120,26 192,76 178,168 120,210 62,168 48,76" fill="rgba(167,139,250,0.08)" stroke="var(--ai)" />
            <polygon points="120,56 172,88 162,152 120,184 78,152 68,88" fill="rgba(201,168,76,0.15)" stroke="var(--gold)" />
          </svg>
          <small>Season: Warm Autumn · Primary axis: Natural + Classic</small>
        </article>
      </section>

      <section className="card reveal-card">
        <h3>Recommended Products</h3>
        <div className="product-grid" style={{ marginTop: 10 }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <article key={index} className="card">
              <div className="image-tile">{index % 2 ? "👗" : "🧥"}</div>
              <strong>AI Pick #{index + 1}</strong>
              <small>{88 - index * 3}% match</small>
              <div className="tags" style={{ marginTop: 6 }}>
                <button type="button" className="btn-ghost">Why this matches</button>
                <button type="button" className="btn-corp">Try On</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </ViewContainer>
  );
}

export function OrdersPage() {
  const { openModal } = useModal();
  const [status, setStatus] = useState("All");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        setLoading(true);
        const data = await getOrders(status === "All" ? undefined : status);
        if (mounted) setOrders(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [status]);

  return (
    <ViewContainer id="view-orders">
      <div className="section-header">
        <h2>My Orders</h2>
        <input placeholder="Search by order ID or product" style={{ maxWidth: 280 }} />
      </div>

      <div className="tags">
        {["All", "PROCESSING", "IN_TRANSIT", "DELIVERED", "CANCELLED", "RETURNED"].map((item) => (
          <button key={item} type="button" className={status === item ? "btn-gold" : "btn-ghost"} onClick={() => setStatus(item)}>
            {item}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="skeleton-list">
          <div className="skeleton h-72" />
          <div className="skeleton h-72" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState icon="📦" title="No orders yet" description="Start shopping to see your orders here." />
      ) : (
        <section style={{ display: "grid", gap: 10 }}>
          {orders.map((order) => (
            <article key={order.id} className="card reveal-card">
              <div className="section-header">
                <div>
                  <h3>{order.orderNo}</h3>
                  <small>{formatDate(order.createdAt)}</small>
                </div>
                <span>{order.status}</span>
              </div>
              <div className="card-grid-2" style={{ marginTop: 8 }}>
                <div>
                  {order.items.map((item) => (
                    <p key={item.id}>
                      {item.product.imageEmoji} {item.product.name} · {item.quantity}
                    </p>
                  ))}
                </div>
                <div style={{ textAlign: "right" }}>
                  <strong>{formatINR(order.totalPaise)}</strong>
                  <p>{order.paymentMethod}</p>
                </div>
              </div>
              <div className="tags" style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() =>
                    openModal({
                      title: `Tracking ${order.orderNo}`,
                      body: (
                        <div className="field">
                          {[
                            "Order Placed",
                            "Payment Confirmed",
                            "Packed at Warehouse",
                            "Shipped",
                            "Out for Delivery",
                            "Delivered"
                          ].map((step, index) => (
                            <div key={step} className="card" style={{ padding: 10 }}>
                              <strong>
                                {index <= (order.status === "DELIVERED" ? 5 : order.status === "IN_TRANSIT" ? 3 : 1) ? "✓" : "○"} {step}
                              </strong>
                            </div>
                          ))}
                        </div>
                      )
                    })
                  }
                >
                  Track Order
                </button>
                <button type="button" className="btn-ghost">View Invoice</button>
                <button type="button" className="btn-ghost">Reorder</button>
                <button type="button" className="btn-corp">Return / Exchange</button>
              </div>
            </article>
          ))}
        </section>
      )}
    </ViewContainer>
  );
}

export function WishlistPage() {
  const { wishlist, toggleWish, addToCart } = useApp();
  const grouped = useMemo(() => {
    const map = new Map<string, WishlistItem[]>();
    wishlist.forEach((item) => {
      const bucket = map.get(item.listName) ?? [];
      bucket.push(item);
      map.set(item.listName, bucket);
    });
    return Array.from(map.entries());
  }, [wishlist]);

  return (
    <ViewContainer id="view-wishlist">
      <div className="section-header">
        <h2>Wishlist Manager</h2>
        <button type="button" className="btn-gold">Create New Wishlist</button>
      </div>

      {grouped.length === 0 ? (
        <EmptyState icon="♡" title="Wishlist is empty" description="Save products from shop to build your lists." />
      ) : (
        grouped.map(([name, items]) => (
          <section key={name} className="card reveal-card">
            <div className="section-header">
              <h3>{name}</h3>
              <button type="button" className="btn-ghost">Share Wishlist</button>
            </div>
            <div className="product-grid" style={{ marginTop: 10 }}>
              {items.map((item) => (
                <article key={item.id} className="card">
                  <div className="image-tile">{item.product.imageEmoji}</div>
                  <h4>{item.product.name}</h4>
                  <p>{formatINR(item.product.pricePaise)}</p>
                  <div className="tags">
                    <button
                      type="button"
                      className="btn-gold"
                      onClick={() =>
                        void addToCart({
                          productId: item.product.id,
                          size: item.product.sizes?.[0] ?? "M",
                          color: "Default",
                          quantity: 1
                        })
                      }
                    >
                      Move to Cart
                    </button>
                    <button type="button" className="btn-ghost" onClick={() => void toggleWish(item.product.id, name)}>
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))
      )}
    </ViewContainer>
  );
}

export function CataloguePage() {
  const [category, setCategory] = useState("All");
  const products = [
    { name: "Executive Notebook Kit", moq: 100, lead: "5-7 days", customization: "Print · Engrave" },
    { name: "Festive Gourmet Hamper", moq: 200, lead: "8-10 days", customization: "Sticker · Card" },
    { name: "Premium Hoodie Pack", moq: 75, lead: "7-9 days", customization: "Embroider" },
    { name: "Wellness Desk Bundle", moq: 50, lead: "4-6 days", customization: "Print" }
  ];

  return (
    <ViewContainer id="view-catalogue">
      <section className="hero-card" data-parallax="0.2">
        <h2>Corporate Gift Catalogue</h2>
        <div className="tags" style={{ marginTop: 8 }}>
          <button type="button" className="btn-gold">Request Physical Catalogue</button>
          <button type="button" className="btn-corp">Book Demo Call</button>
        </div>
      </section>

      <div className="tags">
        {["All", "Apparel", "Stationery", "Tech Accessories", "Food & Wellness", "Luxury", "Eco-Friendly"].map((item) => (
          <button
            key={item}
            type="button"
            className={category === item ? "btn-gold" : "btn-ghost"}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <section className="product-grid">
        {products.map((product) => (
          <article key={product.name} className="card reveal-card">
            <div className="image-tile">🎁</div>
            <h3>{product.name}</h3>
            <p>MOQ {product.moq} · Ships in {product.lead}</p>
            <small>{product.customization}</small>
            <button type="button" className="btn-corp" style={{ marginTop: 8 }}>
              Enquire Bulk
            </button>
          </article>
        ))}
      </section>

      <section className="card reveal-card">
        <h3>Build Your Kit</h3>
        <div className="field-row" style={{ marginTop: 10 }}>
          <select>
            <option>Joining</option>
            <option>Festival</option>
            <option>Diwali</option>
            <option>Christmas</option>
          </select>
          <input placeholder="Quantity" defaultValue="100" />
          <input placeholder="Products in kit" defaultValue="Notebook + Mug + Hoodie" />
          <button type="button" className="btn-gold">Get Estimate</button>
        </div>
      </section>
    </ViewContainer>
  );
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
    if (!context) return;
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

  return (
    <ViewContainer id="view-customize">
      <h2>Logo Customizer Studio</h2>
      <section className="card-grid-2">
        <article className="card reveal-card">
          <h3>Live Preview</h3>
          <div className="card" style={{ marginTop: 10, minHeight: 260, display: "grid", placeItems: "center", background: baseColor }}>
            <div style={{ fontFamily: "Syne", fontSize: "2.4rem", color: logoColor }}>{textLogo} · {view}</div>
          </div>
          <div className="tags" style={{ marginTop: 8 }}>
            {["Front", "Back", "Side"].map((face) => (
              <button key={face} type="button" className={view === face ? "btn-gold" : "btn-ghost"} onClick={() => setView(face)}>
                {face}
              </button>
            ))}
            <button type="button" className="btn-corp" onClick={downloadMockup}>Download PNG</button>
          </div>
        </article>

        <article className="card reveal-card field">
          <h3>Logo Builder</h3>
          <label>
            Text Logo
            <input value={textLogo} onChange={(event) => setTextLogo(event.target.value)} />
          </label>
          <label>
            Product Base Colour
            <input type="color" value={baseColor} onChange={(event) => setBaseColor(event.target.value)} />
          </label>
          <label>
            Logo Colour
            <input type="color" value={logoColor} onChange={(event) => setLogoColor(event.target.value)} />
          </label>
          <label>
            Packaging
            <select>
              <option>Standard Brown</option>
              <option>Branded White Box</option>
              <option>Luxury Black Box</option>
              <option>Eco Kraft</option>
            </select>
          </label>
          <label>
            Message Card
            <textarea rows={3} placeholder="Write your gift note" />
          </label>
          <button type="button" className="btn-gold">Save Quote as PDF</button>
        </article>
      </section>
    </ViewContainer>
  );
}

export function BulkOrdersPage() {
  const [mode, setMode] = useState<"kanban" | "table">("kanban");
  const [step, setStep] = useState(1);
  const columns = ["Draft", "Quote Sent", "In Production", "Quality Check", "Dispatched"];

  return (
    <ViewContainer id="view-bulk">
      <div className="section-header">
        <h2>Bulk Orders Pipeline</h2>
        <div className="tags">
          <button type="button" className={mode === "kanban" ? "btn-gold" : "btn-ghost"} onClick={() => setMode("kanban")}>Kanban</button>
          <button type="button" className={mode === "table" ? "btn-gold" : "btn-ghost"} onClick={() => setMode("table")}>Table</button>
        </div>
      </div>

      {mode === "kanban" ? (
        <section className="card-grid-4" style={{ gridTemplateColumns: "repeat(5, minmax(0,1fr))" }}>
          {columns.map((column, columnIndex) => (
            <article key={column} className="card reveal-card">
              <h3>{column}</h3>
              <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="card" style={{ padding: 10 }}>
                    <strong>BO-{columnIndex + 1}{index + 1}42</strong>
                    <p>Client #{index + 1} · Quantity {120 + index * 40}</p>
                    <small>Due in {3 - index} days</small>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="card reveal-card">
          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Client</th>
                <th>Status</th>
                <th>Qty</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, index) => (
                <tr key={index}>
                  <td>BO-24{index}</td>
                  <td>Client {index + 1}</td>
                  <td>{columns[index % columns.length]}</td>
                  <td>{120 + index * 20}</td>
                  <td>{formatINR((2400000 + index * 280000) * 100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="card reveal-card">
        <h3>New Bulk Order Request · Step {step}/5</h3>
        <div className="field-row" style={{ marginTop: 10 }}>
          <input placeholder="Company name" />
          <input placeholder="Contact person" />
          <input placeholder="GSTIN" />
          <input placeholder="Delivery city" />
        </div>
        <div className="tags" style={{ marginTop: 10 }}>
          <button type="button" className="btn-ghost" onClick={() => setStep((value) => Math.max(1, value - 1))}>Back</button>
          <button type="button" className="btn-gold" onClick={() => setStep((value) => Math.min(5, value + 1))}>Next</button>
          <button type="button" className="btn-corp">Auto-save Draft</button>
        </div>
      </section>
    </ViewContainer>
  );
}

export function AIAssistantPage() {
  const [mode, setMode] = useState("General");
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi, I can help with studio bookings, style picks, gifting estimates, and order tracking.", ts: new Date().toISOString() }
  ]);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [showScrollFab, setShowScrollFab] = useState(false);

  useEffect(() => {
    const container = listRef.current;
    if (!container) return;
    const onScroll = () => {
      const diff = container.scrollHeight - container.scrollTop - container.clientHeight;
      setShowScrollFab(diff > 180);
    };
    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const container = listRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages, typing]);

  function sendMessage(text: string) {
    if (!text.trim()) return;
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

  return (
    <ViewContainer id="view-ai">
      <h2>AI Assistant Hub</h2>
      <section className="card-grid-2" style={{ gridTemplateColumns: "2fr 1fr" }}>
        <article className="card reveal-card" style={{ display: "grid", gridTemplateRows: "auto 1fr auto", minHeight: 560 }}>
          <div className="tags">
            {["General", "Studio Mode", "Fashion Mode", "Corporate Mode"].map((item) => (
              <button key={item} type="button" className={mode === item ? "btn-gold" : "btn-ghost"} onClick={() => setMode(item)}>
                {item}
              </button>
            ))}
          </div>

          <div ref={listRef} style={{ overflow: "auto", marginTop: 10, display: "grid", gap: 8, alignContent: "start" }}>
            {messages.map((message, index) => (
              <article key={`${message.ts}-${index}`} className="card" style={{ background: message.role === "assistant" ? "var(--surface2)" : "var(--gold-d)" }}>
                <div className="section-header">
                  <strong>{message.role === "assistant" ? "360AI" : "You"}</strong>
                  <small title={message.ts}>{formatRelative(message.ts)}</small>
                </div>
                <p style={{ marginTop: 5 }}>{message.text}</p>
                {message.role === "assistant" ? (
                  <div className="tags" style={{ marginTop: 8 }}>
                    <button type="button" className="btn-ghost">Copy</button>
                    <button type="button" className="btn-ghost">👍</button>
                    <button type="button" className="btn-ghost">👎</button>
                  </div>
                ) : null}
              </article>
            ))}
            {typing ? <div className="card">● ● ● Typing...</div> : null}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(input);
            }}
            className="field-row"
            style={{ marginTop: 10 }}
          >
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask 360AI anything..." />
            <button type="submit" className="btn-gold">
              Send
            </button>
          </form>

          {showScrollFab ? (
            <button type="button" className="btn-gold" style={{ position: "absolute", right: 28, bottom: 90 }} onClick={() => {
              if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
            }}>
              ↓
            </button>
          ) : null}
        </article>

        <article className="card reveal-card">
          <h3>AI Tools Panel</h3>
          <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
            {["Style Scanner", "Price Estimator", "Booking Assistant", "Order Tracker", "Gift Recommender"].map((tool) => (
              <button key={tool} type="button" className="card" onClick={() => sendMessage(tool)}>
                <strong>{tool}</strong>
                <p>Launch inline tool</p>
              </button>
            ))}
          </div>
          <div className="section-divider" />
          <h4>Conversation Memory</h4>
          <div className="tags" style={{ marginTop: 8 }}>
            <span>Warm Autumn</span>
            <span>Prefers eco fabrics</span>
            <span>Books weekends</span>
          </div>
        </article>
      </section>
    </ViewContainer>
  );
}

export function AnalyticsPage() {
  const [range, setRange] = useState("30D");
  const [chartType, setChartType] = useState<"Bar" | "Line" | "Area">("Bar");
  const [summary, setSummary] = useState<any>(null);
  const [sortBy, setSortBy] = useState("reviewCount");

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const data = await getAnalyticsSummary();
      if (mounted) setSummary(data);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const topProducts = useMemo(() => {
    const source = [...(summary?.topProducts ?? [])];
    if (sortBy === "rating") source.sort((a, b) => b.rating - a.rating);
    if (sortBy === "reviewCount") source.sort((a, b) => b.reviewCount - a.reviewCount);
    if (sortBy === "ecoScore") source.sort((a, b) => b.ecoScore - a.ecoScore);
    return source;
  }, [summary, sortBy]);

  return (
    <ViewContainer id="view-analytics">
      <div className="section-header">
        <h2>Analytics Intelligence Centre</h2>
        <div className="tags">
          {["Today", "7D", "30D", "90D", "YTD"].map((item) => (
            <button key={item} type="button" className={range === item ? "btn-gold" : "btn-ghost"} onClick={() => setRange(item)}>
              {item}
            </button>
          ))}
        </div>
      </div>

      <section className="metrics-grid">
        <article className="card metric">
          <h4>Revenue</h4>
          <AnimatedCounter value={(summary?.kpis?.revenueByDivision?.STUDIO ?? 0) / 100} prefix="₹" />
          <small>+8.4%</small>
        </article>
        <article className="card metric">
          <h4>Orders</h4>
          <AnimatedCounter value={summary?.kpis?.orderCount ?? 0} />
          <small>+6.1%</small>
        </article>
        <article className="card metric">
          <h4>AOV</h4>
          <AnimatedCounter value={7420} prefix="₹" />
          <small>+3.8%</small>
        </article>
        <article className="card metric">
          <h4>New Customers</h4>
          <AnimatedCounter value={summary?.kpis?.users ?? 0} />
          <small>+5.4%</small>
        </article>
      </section>

      <section className="card reveal-card">
        <div className="section-header">
          <h3>Revenue Chart</h3>
          <div className="tags">
            {(["Bar", "Line", "Area"] as const).map((item) => (
              <button key={item} type="button" className={chartType === item ? "btn-gold" : "btn-ghost"} onClick={() => setChartType(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="card-grid-3" style={{ marginTop: 10 }}>
          {["Studio", "Luxe", "Corporate"].map((division, index) => (
            <div key={division} className="card" style={{ minHeight: 160 }}>
              <strong>{division}</strong>
              <div style={{ height: 100, display: "flex", alignItems: "end", gap: 6, marginTop: 8 }}>
                {Array.from({ length: 6 }).map((_, valueIndex) => (
                  <div
                    key={valueIndex}
                    style={{
                      flex: 1,
                      height: `${30 + valueIndex * 10 + index * 7}%`,
                      background: index === 0 ? "var(--studio)" : index === 1 ? "var(--luxe)" : "var(--corp)",
                      opacity: 0.8,
                      borderRadius: 6
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card-grid-2">
        <article className="card reveal-card">
          <h3>Division Breakdown</h3>
          <svg viewBox="0 0 220 220" width="100%" height="220">
            <circle cx="110" cy="110" r="78" fill="none" stroke="var(--studio)" strokeWidth="24" strokeDasharray="180 320" transform="rotate(-90 110 110)" />
            <circle cx="110" cy="110" r="78" fill="none" stroke="var(--luxe)" strokeWidth="24" strokeDasharray="90 320" strokeDashoffset="-180" transform="rotate(-90 110 110)" />
            <circle cx="110" cy="110" r="78" fill="none" stroke="var(--corp)" strokeWidth="24" strokeDasharray="50 320" strokeDashoffset="-270" transform="rotate(-90 110 110)" />
            <text x="110" y="114" textAnchor="middle" fill="var(--text0)">100%</text>
          </svg>
          <div className="tags">
            <span>Studio 56%</span>
            <span>Luxe 29%</span>
            <span>Corporate 15%</span>
          </div>
        </article>

        <article className="card reveal-card">
          <div className="section-header">
            <h3>Top Products</h3>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="reviewCount">Units Sold</option>
              <option value="rating">Rating</option>
              <option value="ecoScore">Eco Score</option>
            </select>
          </div>
          <table style={{ width: "100%", marginTop: 8 }}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Division</th>
                <th>Rating</th>
                <th>Eco</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product: Product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.division}</td>
                  <td>{product.rating.toFixed(1)}</td>
                  <td>{product.ecoScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>

      <section className="card-grid-3">
        <article className="card reveal-card">
          <h4>Customer Analytics</h4>
          <p>New vs Returning: 42% / 58%</p>
          <small>Top cities: Bengaluru, Mumbai, Hyderabad, Pune</small>
        </article>
        <article className="card reveal-card">
          <h4>AI Analytics</h4>
          <p>Assisted Revenue: ₹18.2L</p>
          <small>Most asked: style match, order ETA, corporate quote</small>
        </article>
        <article className="card reveal-card">
          <h4>Studio Analytics</h4>
          <p>Peak booking hours: 11AM - 3PM</p>
          <small>Session completion rate: 96%</small>
        </article>
      </section>
    </ViewContainer>
  );
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

  return (
    <ViewContainer id="view-settings">
      <h2>Settings & Account Control</h2>
      <div className="tags">
        {tabs.map((item) => (
          <button key={item} type="button" className={tab === item ? "btn-gold" : "btn-ghost"} onClick={() => setTab(item)}>
            {item}
          </button>
        ))}
      </div>

      <section className="card reveal-card">
        {tab === "Profile" ? (
          <div className="field">
            <h3>Profile</h3>
            <div className="field-row">
              <input defaultValue={user?.name} />
              <input defaultValue={user?.email} readOnly />
              <input placeholder="Phone" defaultValue="+91-9876543210" />
              <input placeholder="Social link" />
            </div>
            <textarea rows={4} placeholder="Bio" defaultValue="Creator at 360Shopie" />
            <button type="button" className="btn-gold" onClick={() => toast("Profile saved", "success", 1800)}>
              Save Profile
            </button>
          </div>
        ) : null}

        {tab === "Security" ? (
          <div className="field">
            <h3>Security</h3>
            <div className="field-row">
              <input type="password" placeholder="Current password" />
              <input type="password" placeholder="New password" />
            </div>
            <label><input type="checkbox" defaultChecked /> Enable 2FA (OTP simulation)</label>
            <button type="button" className="btn-gold">Update Security</button>
          </div>
        ) : null}

        {tab === "Notifications" ? (
          <div className="field">
            <h3>Notification Preferences</h3>
            {[
              "Orders",
              "Bookings",
              "AI Matches",
              "Offers",
              "Corporate Enquiries"
            ].map((item) => (
              <label key={item}><input type="checkbox" defaultChecked /> {item}</label>
            ))}
          </div>
        ) : null}

        {tab === "Privacy" ? (
          <div className="field">
            <h3>Privacy</h3>
            <button type="button" className="btn-ghost">Request Data Export</button>
            <button type="button" className="btn-ghost">AI Data Opt-out</button>
            <button type="button" className="btn-corp">Delete Account</button>
          </div>
        ) : null}

        {tab === "Addresses" ? (
          <div className="field">
            <h3>Addresses</h3>
            <div className="card">🏠 Indiranagar, Bengaluru 560038</div>
            <div className="card">🏢 HSR Layout, Bengaluru 560102</div>
            <button type="button" className="btn-gold">Add Address</button>
          </div>
        ) : null}

        {tab === "Payment Methods" ? (
          <div className="field">
            <h3>Payment Methods</h3>
            <div className="card">Card •••• 1842</div>
            <div className="card">UPI: aadhya@upi</div>
            <button type="button" className="btn-gold">Add Method</button>
          </div>
        ) : null}

        {tab === "Subscriptions" ? (
          <div className="field">
            <h3>Subscriptions</h3>
            <p>Current Plan: Platinum Suite</p>
            <div className="password-meter"><span style={{ width: "72%", background: "var(--gold)" }} /></div>
            <small>72% monthly usage</small>
            <button type="button" className="btn-corp">Upgrade Plan</button>
          </div>
        ) : null}

        {tab === "Integrations" ? (
          <div className="field">
            <h3>Integrations</h3>
            {[
              "Google Calendar",
              "Razorpay",
              "WhatsApp Notifications"
            ].map((integration) => (
              <label key={integration}><input type="checkbox" defaultChecked /> {integration}</label>
            ))}
          </div>
        ) : null}

        {tab === "Appearance" ? (
          <div className="field">
            <h3>Appearance</h3>
            <div className="tags">
              <button type="button" className={theme === "dark" ? "btn-gold" : "btn-ghost"} onClick={() => setTheme("dark")}>Dark</button>
              <button type="button" className={theme === "light" ? "btn-gold" : "btn-ghost"} onClick={() => setTheme("light")}>Light</button>
            </div>
            <div className="tags">
              {["gold", "teal", "blue", "purple", "rose"].map((accent) => (
                <span key={accent}>{accent}</span>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </ViewContainer>
  );
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const { refreshBootstrapData } = useApp();
  const [filter, setFilter] = useState("All");
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData(selected = filter) {
    setLoading(true);
    try {
      const data = await getNotifications(selected === "All" ? undefined : selected);
      setItems(data.items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [filter]);

  return (
    <ViewContainer id="view-notifications">
      <div className="section-header">
        <h2>Notifications Centre</h2>
        <button
          type="button"
          className="btn-gold"
          onClick={async () => {
            await markAllNotificationsRead();
            await loadData();
            await refreshBootstrapData();
          }}
        >
          Mark all read
        </button>
      </div>

      <div className="tags">
        {["All", "Unread", "STUDIO", "FASHION", "CORPORATE", "SYSTEM", "AI"].map((tab) => (
          <button key={tab} type="button" className={filter === tab ? "btn-gold" : "btn-ghost"} onClick={() => setFilter(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="skeleton-list">
          <div className="skeleton h-72" />
          <div className="skeleton h-72" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon="🎉" title="You're all caught up" description="No notifications in this category." />
      ) : (
        <section style={{ display: "grid", gap: 10 }}>
          {items
            .filter((item) => (filter === "Unread" ? !item.isRead : true))
            .map((item) => (
              <article key={item.id} className="card reveal-card" style={{ borderColor: item.isRead ? undefined : "var(--border2)" }}>
                <div className="section-header">
                  <strong>{item.title}</strong>
                  <small>{formatRelative(item.createdAt)}</small>
                </div>
                <p>{item.description}</p>
                <div className="tags" style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={async () => {
                      await markNotificationRead(item.id);
                      await loadData();
                      await refreshBootstrapData();
                    }}
                  >
                    Mark read
                  </button>
                  {item.actionRoute ? (
                    <button type="button" className="btn-corp" onClick={() => navigate(`/${item.actionRoute}`)}>
                      Open
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
        </section>
      )}
    </ViewContainer>
  );
}

export function LoyaltyPage() {
  const { user } = useApp();
  const points = user?.loyaltyPoints ?? 2840;
  const progress = Math.min(100, (points / 5000) * 100);

  return (
    <ViewContainer id="view-loyalty">
      <section className="hero-card" data-parallax="0.15">
        <h2>Loyalty & Rewards</h2>
        <p>Earn and redeem across Studio, Luxe, and Corporate experiences.</p>
      </section>

      <section className="card reveal-card">
        <h3>Points Card</h3>
        <AnimatedCounter value={points} />
        <p>Tier: Gold · {formatNumberIndian(5000 - points)} points to Platinum</p>
        <div className="password-meter" style={{ marginTop: 8 }}>
          <span style={{ width: `${progress}%`, background: "var(--gold)" }} />
        </div>
        <small>Points expire on 31 Dec 2026</small>
      </section>

      <section className="card-grid-2">
        <article className="card reveal-card">
          <h3>Earn Points</h3>
          <ul>
            <li>Book a session +200 pts</li>
            <li>Purchase +1 pt per ₹10</li>
            <li>Refer a friend +500 pts</li>
            <li>Write a review +50 pts</li>
            <li>Complete profile +100 pts</li>
          </ul>
        </article>

        <article className="card reveal-card">
          <h3>Redeem Points</h3>
          <div style={{ display: "grid", gap: 8 }}>
            <div className="card">₹500 off over ₹3,000 · 1,000 pts</div>
            <div className="card">Free session upgrade · 1,500 pts</div>
            <div className="card">Priority slot access · 700 pts</div>
          </div>
        </article>
      </section>
    </ViewContainer>
  );
}

export function ReferralPage() {
  const { user } = useApp();
  const code = user?.referralCode ?? "AADHYA500";

  return (
    <ViewContainer id="view-referral">
      <h2>Refer & Earn</h2>
      <section className="card reveal-card">
        <h3>Your Referral Code</h3>
        <div className="section-header" style={{ marginTop: 8 }}>
          <strong style={{ fontSize: "1.6rem" }}>{code}</strong>
          <div className="tags">
            <button type="button" className="btn-gold" onClick={() => navigator.clipboard.writeText(code)}>Copy</button>
            <button type="button" className="btn-corp">Share WhatsApp</button>
          </div>
        </div>
      </section>

      <section className="card-grid-3">
        <article className="card metric">
          <h4>Sent</h4>
          <AnimatedCounter value={24} />
        </article>
        <article className="card metric">
          <h4>Signed Up</h4>
          <AnimatedCounter value={11} />
        </article>
        <article className="card metric">
          <h4>Earned</h4>
          <AnimatedCounter value={55000} prefix="₹" />
        </article>
      </section>

      <section className="card reveal-card">
        <h3>How it works</h3>
        <p>Share → Friend signs up → Friend makes first purchase → You earn ₹500</p>
        <table style={{ width: "100%", marginTop: 10 }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Reward</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>stellary.io</td><td>Signed up</td><td>₹500</td></tr>
            <tr><td>finleaf.in</td><td>Invite sent</td><td>Pending</td></tr>
          </tbody>
        </table>
      </section>
    </ViewContainer>
  );
}

export function HelpPage() {
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const faqs = [
    { q: "How do I track an order?", a: "Open My Orders and click Track Order to view the live timeline." },
    { q: "Can I reschedule studio sessions?", a: "Yes, go to Studio > Upcoming and click Reschedule." },
    { q: "How do returns work?", a: "Select order item, choose reason, and pick a pickup slot." },
    { q: "How is AI style score calculated?", a: "It combines style preferences, color season, and fit profile." }
  ];

  const visible = faqs.filter((item) => item.q.toLowerCase().includes(query.toLowerCase()));

  return (
    <ViewContainer id="view-help">
      <h2>Help & Support</h2>
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="How can we help you?" />

      <section className="card reveal-card" style={{ marginTop: 10 }}>
        <h3>FAQ</h3>
        <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
          {visible.map((faq) => (
            <article key={faq.q} className="card">
              <button type="button" className="section-header" onClick={() => setOpenFaq((current) => (current === faq.q ? null : faq.q))}>
                <strong>{faq.q}</strong>
                <span>{openFaq === faq.q ? "−" : "+"}</span>
              </button>
              {openFaq === faq.q ? <p style={{ marginTop: 8 }}>{faq.a}</p> : null}
            </article>
          ))}
        </div>
      </section>

      <section className="card-grid-2">
        <article className="card reveal-card">
          <h3>Contact Options</h3>
          <div className="tags" style={{ marginTop: 8 }}>
            <button type="button" className="btn-gold">Live Chat</button>
            <button type="button" className="btn-ghost">Email Support</button>
            <button type="button" className="btn-ghost">WhatsApp</button>
            <button type="button" className="btn-corp">Request Callback</button>
          </div>
        </article>

        <article className="card reveal-card">
          <h3>System Status</h3>
          <ul>
            <li>Website: ✅ Operational</li>
            <li>Payments: ✅ Operational</li>
            <li>AI Services: ✅ Operational</li>
            <li>Frame Sync: ⚠ Partial delay</li>
          </ul>
        </article>
      </section>
    </ViewContainer>
  );
}