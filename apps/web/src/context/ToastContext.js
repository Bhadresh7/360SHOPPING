import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
const ToastContext = createContext(null);
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const timers = useRef({});
    const dismiss = useCallback((id) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
        const timer = timers.current[id];
        if (timer) {
            window.clearTimeout(timer);
            delete timers.current[id];
        }
    }, []);
    const toast = useCallback((message, type = "success", duration = 3000) => {
        const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        setToasts((current) => [{ id, message, type, duration }, ...current].slice(0, 3));
        timers.current[id] = window.setTimeout(() => dismiss(id), duration);
    }, [dismiss]);
    const value = useMemo(() => ({ toasts, toast, dismiss }), [toasts, toast, dismiss]);
    return _jsx(ToastContext.Provider, { value: value, children: children });
}
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used inside ToastProvider");
    }
    return context;
}
