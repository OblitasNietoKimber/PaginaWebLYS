import { Icon } from "./OperationsVisuals";

export function OperationsPagination({
  count,
  page,
  onChange,
  label,
  size = 10,
}: {
  count: number;
  page: number;
  onChange: (page: number) => void;
  label: string;
  size?: number;
}) {
  const last = Math.max(1, Math.ceil(count / size));
  const current = Math.min(page, last);
  return (
    <nav className="ops-pagination" aria-label={`Páginas de ${label}`}>
      <span>
        Mostrando {count ? (current - 1) * size + 1 : 0} a{" "}
        {Math.min(current * size, count)} de {count} {label}
      </span>
      <button
        disabled={current <= 1}
        aria-label="Página anterior"
        onClick={() => onChange(current - 1)}
      >
        <Icon name="chevron" />
      </button>
      <span aria-current="page">{current}</span>
      <button
        disabled={current >= last}
        aria-label="Página siguiente"
        onClick={() => onChange(current + 1)}
      >
        <Icon name="chevron" />
      </button>
    </nav>
  );
}
