import { useEffect, useId, useRef, type ReactNode } from "react";
import { Icon } from "./Icon";

export function PreviewDialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    ref.current?.showModal();
    return () => {
      previousFocus?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="notice-dialog prototype-preview-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
    >
      <button
        className="dialog-close"
        type="button"
        aria-label="Cerrar ventana"
        onClick={onClose}
      >
        <Icon name="close" />
      </button>
      <h2 id={titleId}>{title}</h2>
      {children}
    </dialog>
  );
}
