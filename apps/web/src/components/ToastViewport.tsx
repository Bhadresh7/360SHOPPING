import { useToast } from "../context/ToastContext";

export function ToastViewport() {
  const { toasts, dismiss } = useToast();

  return (
    <aside className="toast-viewport" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          className={`toast toast-${toast.type}`}
          onClick={() => dismiss(toast.id)}
          type="button"
        >
          <span>{toast.message}</span>
          <span className="toast-progress" style={{ animationDuration: `${toast.duration}ms` }} />
        </button>
      ))}
    </aside>
  );
}