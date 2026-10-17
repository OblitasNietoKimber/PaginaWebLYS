import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Icon, type IconName } from "./OperationsVisuals";

export function OperationsDialog({ title, children, onClose, className = "", icon }: {
  title: string; children: ReactNode; onClose: () => void; className?: string; icon?: IconName;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const [error, setError] = useState("");
  useEffect(() => {
    if (!returnFocus.current) returnFocus.current = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    const feedback = (event: Event) => setError((event as CustomEvent<string>).detail);
    window.addEventListener("operations:error", feedback);
    return () => {
      window.removeEventListener("operations:error", feedback);
      document.body.style.overflow = overflow;
      // Restore focus after React removes the modal from the top layer.
      requestAnimationFrame(() => {
        if (!dialog?.isConnected && returnFocus.current?.isConnected) returnFocus.current.focus();
      });
    };
  }, []);
  return <dialog ref={ref} className={`ops-dialog ${className}`} aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose(); }} onClose={onClose} onKeyDown={event => {
    if (event.key !== "Tab") return;
    const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]')].filter(el => el.getClientRects().length > 0);
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }}>
    <header><h2 id={titleId}>{icon && <Icon name={icon} />}{title}</h2><button type="button" aria-label="Cerrar ventana" onClick={onClose}><Icon name="close" /></button></header>
    <div className="ops-dialog-body" onSubmitCapture={() => setError("")}>{error && <p className="ops-message error" role="alert">{error}</p>}{children}</div>
  </dialog>;
}
