import axios from "axios";
import type {
  CartState,
  DashboardOverview,
  NotificationItem,
  Order,
  Product,
  StudioBooking,
  User,
  WishlistItem,
  Album,
  SmartFrame,
  TalentModel
} from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api"
});

let tokenStore = "";

export function setAuthToken(token: string | null) {
  tokenStore = token ?? "";
}

api.interceptors.request.use((config) => {
  if (tokenStore) {
    config.headers.Authorization = `Bearer ${tokenStore}`;
  }
  return config;
});

export async function loginApi(email: string, password: string): Promise<{ token: string; user: User }> {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

export async function registerApi(payload: {
  name: string;
  email: string;
  password: string;
}): Promise<{ token: string; user: User }> {
  const { data } = await api.post("/auth/register", payload);
  return data;
}

export async function getDashboard(): Promise<DashboardOverview> {
  const { data } = await api.get("/dashboard/overview");
  return data;
}

export async function getProducts(params?: Record<string, string | number>) {
  const { data } = await api.get<Product[]>("/products", { params });
  return data;
}

export async function getProduct(productId: string) {
  const { data } = await api.get<Product>(`/products/${productId}`);
  return data;
}

export async function getCart() {
  const { data } = await api.get<CartState>("/cart");
  return data;
}

export async function addCartItem(payload: {
  productId: string;
  size: string;
  color: string;
  quantity: number;
}) {
  const { data } = await api.post<CartState>("/cart/add", payload);
  return data;
}

export async function updateCartItem(itemId: string, quantity: number) {
  const { data } = await api.patch<CartState>(`/cart/${itemId}`, { quantity });
  return data;
}

export async function removeCartItem(itemId: string) {
  const { data } = await api.delete<CartState>(`/cart/${itemId}`);
  return data;
}

export async function getWishlist() {
  const { data } = await api.get<WishlistItem[]>("/wishlist");
  return data;
}

export async function toggleWishlist(productId: string, listName = "My Wishlist") {
  const { data } = await api.post<{ added: boolean }>("/wishlist/toggle", { productId, listName });
  return data;
}

export async function getStudioBookings() {
  const { data } = await api.get<StudioBooking[]>("/studio/bookings");
  return data;
}

export async function createStudioBooking(payload: {
  sessionType: string;
  bookingDate: string;
  duration: "1hr" | "2hr" | "Half-day" | "Full-day";
  amountPaise: number;
  addOns: string[];
}) {
  const { data } = await api.post<StudioBooking>("/studio/bookings", payload);
  return data;
}

export async function getOrders(status?: string) {
  const { data } = await api.get<Order[]>("/orders", {
    params: status ? { status } : undefined
  });
  return data;
}

export async function createOrder(payload: {
  paymentMethod: "UPI" | "Card" | "NetBanking" | "COD";
  items: Array<{ productId: string; quantity: number; size: string; color: string }>;
}) {
  const { data } = await api.post<Order>("/orders", payload);
  return data;
}

export async function getNotifications(type?: string) {
  const { data } = await api.get<{ unread: number; items: NotificationItem[] }>("/notifications", {
    params: type ? { type } : undefined
  });
  return data;
}

export async function markNotificationRead(id: string) {
  await api.post(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  await api.post("/notifications/mark-all-read");
}

export async function getAnalyticsSummary() {
  const { data } = await api.get("/analytics/summary");
  return data;
}

export async function searchGlobal(q: string) {
  const { data } = await api.get("/search", { params: { q } });
  return data;
}

export async function getAlbums(): Promise<Album[]> {
  const { data } = await api.get<Album[]>("/albums");
  return data;
}

export async function getFrames(): Promise<SmartFrame[]> {
  const { data } = await api.get<SmartFrame[]>("/frames");
  return data;
}

export async function getModels(): Promise<TalentModel[]> {
  const { data } = await api.get<TalentModel[]>("/models");
  return data;
}