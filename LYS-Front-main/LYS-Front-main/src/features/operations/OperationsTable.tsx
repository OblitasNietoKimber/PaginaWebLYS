import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  type ReactNode,
  type ReactElement,
} from "react";

type ElementProps = {
  children?: ReactNode;
  "data-label"?: string;
  role?: string;
};
const elements = (node: ReactNode) =>
  Children.toArray(node).filter(isValidElement) as ReactElement<ElementProps>[];
function textOf(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) =>
      isValidElement<ElementProps>(child)
        ? textOf(child.props.children)
        : String(child),
    )
    .join("");
}

// Labels follow the actual table headings, including when columns change by role.
export function OperationsTable({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLTableElement>(null);
  useEffect(() => {
    const table = ref.current;
    const region = table?.closest<HTMLElement>(".ops-table-wrap");
    if (!table || !region) return;
    const update = () => {
      const scrollable = region.scrollWidth > region.clientWidth + 1;
      region.toggleAttribute("data-scrollable", scrollable);
      if (scrollable) {
        region.tabIndex = 0;
        region.setAttribute("role", "region");
        const title = region.closest("section")?.querySelector("h2")?.textContent;
        region.setAttribute("aria-label", `${title || "Tabla de datos"}. Desplazamiento horizontal disponible`);
      } else {
        region.removeAttribute("tabindex");
        region.removeAttribute("role");
        region.removeAttribute("aria-label");
      }
    };
    const observer = new ResizeObserver(update);
    observer.observe(region);
    observer.observe(table);
    update();
    return () => observer.disconnect();
  }, []);
  const sections = elements(children);
  const head = sections.find((section) => section.type === "thead");
  const headings = elements(
    elements(head?.props.children)[0]?.props.children,
  ).map((cell) => textOf(cell.props.children));
  return (
    <table
      ref={ref}
      className="ops-responsive-table"
      role="table"
      data-wide={headings.length > 9}
      data-catalog={
        headings[0] === "Producto" && headings.includes("Disponibilidad")
      }
    >
      {sections.map((section) =>
        cloneElement(
          section,
          { role: "rowgroup" },
          elements(section.props.children).map((row) =>
            cloneElement(
              row,
              { role: "row" },
              elements(row.props.children).map((cell, index) =>
                cloneElement(cell, {
                  role: section.type === "thead" ? "columnheader" : "cell",
                  "data-label": headings[index] || "Detalle",
                }),
              ),
            ),
          ),
        ),
      )}
    </table>
  );
}
