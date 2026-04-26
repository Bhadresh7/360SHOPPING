import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { addCartItem, getCart, getNotifications, getWishlist, loginApi, removeCartItem, setAuthToken, toggleWishlist, updateCartItem } from "../lib/api";
import { useToast } from "./ToastContext";
const TOKEN_KEY = "shopie-token";
const USER_KEY = "shopie-user";
const THEME_KEY = "shopie-theme";
const AppContext = createContext(null);
export function AppProvider({ children }) {
    const { toast } = useToast();
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    });
    const [theme, setThemeState] = useState(() => localStorage.getItem(THEME_KEY) ?? "dark");
    const [cart, setCart] = useState(null);
    const [wishlist, setWishlist] = useState([]);
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
        }
        catch (error) {
            console.error(error);
            toast("Failed to sync account state", "warning", 2500);
        }
        finally {
            setIsBootstrapping(false);
        }
    }, [token, toast]);
    useEffect(() => {
        setAuthToken(token);
        if (token) {
            localStorage.setItem(TOKEN_KEY, token);
            void refreshBootstrapData();
        }
        else {
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
    const login = useCallback(async (email, password, remember) => {
        const response = await loginApi(email, password);
        setToken(response.token);
        setUser(response.user);
        if (remember) {
            localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        }
    }, []);
    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        toast("Signed out securely", "info", 2200);
    }, [toast]);
    const setTheme = useCallback((nextTheme) => {
        setThemeState(nextTheme);
    }, []);
    const addToCart = useCallback(async (payload) => {
        const cartData = await addCartItem(payload);
        setCart(cartData);
        setCartDrawerOpen(true);
        toast("Added to cart", "success", 2200);
    }, [toast]);
    const removeFromCart = useCallback(async (id) => {
        const cartData = await removeCartItem(id);
        setCart(cartData);
        toast("Item removed", "info", 1800);
    }, [toast]);
    const changeCartQty = useCallback(async (id, quantity) => {
        const cartData = await updateCartItem(id, quantity);
        setCart(cartData);
    }, []);
    const toggleWish = useCallback(async (productId, listName) => {
        const response = await toggleWishlist(productId, listName);
        const latest = await getWishlist();
        setWishlist(latest);
        toast(response.added ? "Saved to wishlist" : "Removed from wishlist", "info", 1800);
    }, [toast]);
    const value = useMemo(() => ({
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
    }), [
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
    ]);
    return _jsx(AppContext.Provider, { value: value, children: children });
}
export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useApp must be used within AppProvider");
    }
    return context;
}
