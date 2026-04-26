import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useToast } from "../context/ToastContext";
export function ToastViewport() {
    const { toasts, dismiss } = useToast();
    return (_jsx("aside", { className: "toast-viewport", "aria-live": "polite", "aria-atomic": "true", children: toasts.map((toast) => (_jsxs("button", { className: `toast toast-${toast.type}`, onClick: () => dismiss(toast.id), type: "button", children: [_jsx("span", { children: toast.message }), _jsx("span", { className: "toast-progress", style: { animationDuration: `${toast.duration}ms` } })] }, toast.id))) }));
}
