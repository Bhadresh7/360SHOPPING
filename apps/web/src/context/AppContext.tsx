import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import {
  addCartItem,
  getCart,
  getNotifications,
  getWishlist,
  loginApi,
  removeCartItem,
  setAuthToken,
  toggleWishlist,
  updateCartItem
} from "../lib/api";
import { supabase } from "../lib/supabase";
import type { CartState, User, WishlistItem } from "../types";
import { useToast } from "./ToastContext";

const TOKEN_KEY = "shopie-token";
const USER_KEY = "shopie-user";
const THEME_KEY = "shopie-theme";

interface AppContextShape {
  token: string | null;
  user: User | null;
  theme: "dark" | "light";
  cart: CartState | null;
  wishlist: WishlistItem[];
  notificationsUnread: number;
  isBootstrapping: boolean;
  cartDrawerOpen: boolean;
  searchOpen: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
  setTheme: (theme: "dark" | "light") => void;
  refreshBootstrapData: () => Promise<void>;
  addToCart: (payload: { productId: string; size: string; color: string; quantity: number }) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  changeCartQty: (id: string, quantity: number) => Promise<void>;
  toggleWish: (productId: string, listName?: string) => Promise<void>;
  setCartDrawerOpen: (value: boolean) => void;
  setSearchOpen: (value: boolean) => void;
}

const AppContext = createContext<AppContextShape | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>("mock-token");
  const [user, setUser] = useState<User | null>({
    id: "clxadmin001",
    name: "Admin User",
    email: "admin@gmail.com",
    loyaltyPoints: 9999,
    referralCode: "ADMIN777"
  });
  const [theme, setThemeState] = useState<"dark" | "light">(() =>
    (localStorage.getItem(THEME_KEY) as "dark" | "light" | null) ?? "dark"
  );
  const [cart, setCart] = useState<CartState | null>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [notificationsUnread, setNotificationsUnread] = useState(0);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const refreshBootstrapData = useCallback(async () => {
    if (!token) {
      setCart(null);
      setWishlist([]);
      setNotificationsUnread(0);
      return;
    }

    setIsBootstrapping(true);
    try {
      const [cartData, wishlistData, notificationsData] = await Promise.all([
        getCart(),
        getWishlist(),
        getNotifications()
      ]);
      setCart(cartData);
      setWishlist(wishlistData);
      setNotificationsUnread(notificationsData.unread);
    } catch (error) {
      console.error(error);
      toast("Failed to sync account state", "warning", 2500);
    } finally {
      setIsBootstrapping(false);
    }
  }, [token, toast]);

  useEffect(() => {
    setAuthToken(token);
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      void refreshBootstrapData();
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setCart(null);
      setWishlist([]);
      setNotificationsUnread(0);
    }
  }, [token, refreshBootstrapData]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const login = useCallback(
    async (email: string, password: string, remember: boolean) => {
      // 1. Explicit DB Verification: Check if user exists in the 'User' table
      const { data: userData, error: dbError } = await supabase
        .from('User')
        .select('email, name')
        .eq('email', email.trim())
        .maybeSingle();

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error("Connection error: Unable to reach the database. Please try again later.");
      }

      if (!userData) {
        throw new Error("Account not found. Please verify your email or sign up.");
      }

      // 2. Verify credentials
      // We use the backend API to securely verify the password hash
      try {
        const response = await loginApi(email, password);
        setToken(response.token);
        setUser(response.user);
        if (remember) {
          localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        }
      } catch (error: any) {
        const message = error.response?.data?.message || "Login failed. Please check your password.";
        throw new Error(message);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    toast("Signed out securely", "info", 2200);
  }, [toast]);

  const setTheme = useCallback((nextTheme: "dark" | "light") => {
    setThemeState(nextTheme);
  }, []);

  const addToCart = useCallback(
    async (payload: { productId: string; size: string; color: string; quantity: number }) => {
      const cartData = await addCartItem(payload);
      setCart(cartData);
      setCartDrawerOpen(true);
      toast("Added to cart", "success", 2200);
    },
    [toast]
  );

  const removeFromCart = useCallback(
    async (id: string) => {
      const cartData = await removeCartItem(id);
      setCart(cartData);
      toast("Item removed", "info", 1800);
    },
    [toast]
  );

  const changeCartQty = useCallback(async (id: string, quantity: number) => {
    const cartData = await updateCartItem(id, quantity);
    setCart(cartData);
  }, []);

  const toggleWish = useCallback(
    async (productId: string, listName?: string) => {
      const response = await toggleWishlist(productId, listName);
      const latest = await getWishlist();
      setWishlist(latest);
      toast(response.added ? "Saved to wishlist" : "Removed from wishlist", "info", 1800);
    },
    [toast]
  );

  const value = useMemo(
    () => ({
      token,
      user,
      theme,
      cart,
      wishlist,
      notificationsUnread,
      isBootstrapping,
      cartDrawerOpen,
      searchOpen,
      login,
      logout,
      setTheme,
      refreshBootstrapData,
      addToCart,
      removeFromCart,
      changeCartQty,
      toggleWish,
      setCartDrawerOpen,
      setSearchOpen
    }),
    [
      token,
      user,
      theme,
      cart,
      wishlist,
      notificationsUnread,
      isBootstrapping,
      cartDrawerOpen,
      searchOpen,
      login,
      logout,
      setTheme,
      refreshBootstrapData,
      addToCart,
      removeFromCart,
      changeCartQty,
      toggleWish
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}