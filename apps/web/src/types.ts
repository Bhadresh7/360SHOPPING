export type Division = "STUDIO" | "LUXE" | "CORPORATE";

export type ToastType = "success" | "error" | "info" | "warning";

export interface User {
  id: string;
  name: string;
  email: string;
  loyaltyPoints: number;
  referralCode: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  division: Division;
  category: string;
  description: string;
  pricePaise: number;
  originalPaise: number | null;
  ecoScore: number;
  rating: number;
  reviewCount: number;
  stock: number;
  isNew: boolean;
  isSale: boolean;
  isLimited: boolean;
  fabric: string;
  imageEmoji: string;
  colors: string[];
  sizes: string[];
  tags: string[];
  createdAt: string;
  price?: string;
  originalPrice?: string | null;
  seller?: {
    name: string;
    email: string;
  } | null;
}

export interface CartItem {
  id: string;
  quantity: number;
  size: string;
  color: string;
  product: Product;
}

export interface CartState {
  items: CartItem[];
  summary: {
    subtotalPaise: number;
    shippingPaise: number;
    taxPaise: number;
    totalPaise: number;
    count: number;
  };
}

export interface WishlistItem {
  id: string;
  listName: string;
  product: Product;
}

export interface DashboardOverview {
  metrics: {
    totalRevenuePaise: number;
    totalOrders: number;
    totalBookings: number;
    wishlistCount: number;
    cartCount: number;
    loyaltyPoints: number;
  };
  quickStats: string[];
  activityFeed: {
    id: string;
    type: string;
    text: string;
    detail: string;
    time: string;
  }[];
  revenueHistory: {
    labels: string[];
    studio: number[];
    luxe: number[];
    corp: number[];
  };
}

export interface NotificationItem {
  id: string;
  type: "STUDIO" | "FASHION" | "CORPORATE" | "SYSTEM" | "AI";
  title: string;
  description: string;
  actionRoute: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface StudioBooking {
  id: string;
  sessionType: string;
  bookingDate: string;
  duration: string;
  amountPaise: number;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  addOns: string[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  size: string;
  color: string;
  unitPaise: number;
  product: Product;
}

export interface Order {
  id: string;
  orderNo: string;
  status: "PROCESSING" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED" | "RETURNED";
  paymentMethod: string;
  totalPaise: number;
  createdAt: string;
  items: OrderItem[];
}

export interface Album {
  id: string;
  name: string;
  date: string;
  count: number;
  size: string;
  ai: boolean;
}

export interface SmartFrame {
  id: string;
  name: string;
  location: string;
  status: string;
  slide: string;
  lastSync: string;
}

export interface TalentModel {
  id: string;
  name: string;
  age: number;
  height: string;
  tags: string[];
  status: string;
  ratePaise: number;
  score: number;
  gender: string;
}