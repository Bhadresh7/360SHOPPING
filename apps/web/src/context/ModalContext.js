import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
const ModalContext = createContext(null);
export function ModalProvider({ children }) {
    const [stack, setStack] = useState([]);
    const closeModal = useCallback((id) => {
        setStack((current) => current.filter((modal) => modal.id !== id));
    }, []);
    const closeTop = useCallback(() => {
        setStack((current) => current.slice(0, -1));
    }, []);
    const openModal = useCallback((config) => {
        const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        setStack((current) => [...current, { ...config, id }]);
        return id;
    }, []);
    useEffect(() => {
        if (stack.length === 0) {
            return;
        }
        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                closeTop();
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [stack.length, closeTop]);
    const value = useMemo(() => ({
        stack,
        openModal,
        closeModal,
        closeTop
    }), [stack, openModal, closeModal, closeTop]);
    return _jsx(ModalContext.Provider, { value: value, children: children });
}
export function useModal() {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModal must be used inside ModalProvider");
    }
    return context;
}
