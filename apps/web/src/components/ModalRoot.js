import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { useModal } from "../context/ModalContext";
const FOCUSABLE = "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])";
export function ModalRoot() {
    const { stack, closeModal } = useModal();
    const latest = stack[stack.length - 1];
    const dialogRef = useRef(null);
    useEffect(() => {
        if (!latest || !dialogRef.current) {
            return;
        }
        const focusables = Array.from(dialogRef.current.querySelectorAll(FOCUSABLE));
        focusables[0]?.focus();
        const onKeyDown = (event) => {
            if (event.key !== "Tab" || focusables.length === 0) {
                return;
            }
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            }
            else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };
        dialogRef.current.addEventListener("keydown", onKeyDown);
        return () => dialogRef.current?.removeEventListener("keydown", onKeyDown);
    }, [latest]);
    if (!latest) {
        return null;
    }
    return (_jsx("div", { className: "modal-backdrop", role: "presentation", onClick: () => closeModal(latest.id), children: _jsxs("div", { className: "modal", ref: dialogRef, role: "dialog", "aria-modal": "true", "aria-label": latest.title, onClick: (event) => event.stopPropagation(), children: [_jsxs("header", { className: "modal-header", children: [_jsx("h3", { children: latest.title }), _jsx("button", { type: "button", className: "icon-btn", onClick: () => closeModal(latest.id), children: "\u2715" })] }), _jsx("div", { className: "modal-body", children: latest.body }), latest.actions ? _jsx("footer", { className: "modal-actions", children: latest.actions }) : null] }) }));
}
