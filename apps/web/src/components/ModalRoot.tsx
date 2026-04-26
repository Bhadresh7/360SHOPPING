import { useEffect, useRef } from "react";
import { useModal } from "../context/ModalContext";

const FOCUSABLE =
  "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])";

export function ModalRoot() {
  const { stack, closeModal } = useModal();
  const latest = stack[stack.length - 1];
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!latest || !dialogRef.current) {
      return;
    }
    const focusables = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    focusables[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || focusables.length === 0) {
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
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

  return (
    <div className="modal-backdrop" role="presentation" onClick={() => closeModal(latest.id)}>
      <div
        className="modal"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={latest.title}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <h3>{latest.title}</h3>
          <button type="button" className="icon-btn" onClick={() => closeModal(latest.id)}>
            ✕
          </button>
        </header>
        <div className="modal-body">{latest.body}</div>
        {latest.actions ? <footer className="modal-actions">{latest.actions}</footer> : null}
      </div>
    </div>
  );
}