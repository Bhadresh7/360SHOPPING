import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

export interface ModalConfig {
  id: string;
  title: string;
  body: ReactNode;
  actions?: ReactNode;
}

interface ModalContextShape {
  stack: ModalConfig[];
  openModal: (config: Omit<ModalConfig, "id">) => string;
  closeModal: (id: string) => void;
  closeTop: () => void;
}

const ModalContext = createContext<ModalContextShape | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<ModalConfig[]>([]);

  const closeModal = useCallback((id: string) => {
    setStack((current) => current.filter((modal) => modal.id !== id));
  }, []);

  const closeTop = useCallback(() => {
    setStack((current) => current.slice(0, -1));
  }, []);

  const openModal = useCallback((config: Omit<ModalConfig, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setStack((current) => [...current, { ...config, id }]);
    return id;
  }, []);

  useEffect(() => {
    if (stack.length === 0) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeTop();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [stack.length, closeTop]);

  const value = useMemo(
    () => ({
      stack,
      openModal,
      closeModal,
      closeTop
    }),
    [stack, openModal, closeModal, closeTop]
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used inside ModalProvider");
  }
  return context;
}