import type { SVGProps } from "react";
import {
  Icon as BaseIcon,
  type IconName as BaseIconName,
} from "../../components/Icon";
import type { Order } from "./operationsStore";
export type IconName =
  | BaseIconName
  | "chef"
  | "bell"
  | "chart"
  | "box"
  | "settings"
  | "calendar"
  | "scooter"
  | "serve"
  | "bank"
  | "coins"
  | "plus"
  | "save"
  | "edit"
  | "copy"
  | "download"
  | "print"
  | "send"
  | "power"
  | "trophy"
  | "filter"
  | "list"
  | "clipboard"
  | "bag"
  | "circle-plus"
  | "inventory"
  | "link"
  | "info"
  | "funnel"
  | "dining"
  | "flag"
  | "clipboard-list"
  | "user-edit"
  | "world"
  | "external-link"
  | "chef-hat"
  | "dining-table"
  | "cash-register"
  | "moped"
  | "logout"
  | "chevron-right";
const linePaths: Partial<Record<IconName, string[]>> = {
  dining: ["M6 8a6 4 0 1 0 12 0 6 4 0 1 0-12 0", "M7 11v9M17 11v9M2 8v8h3M22 8v8h-3M3 16v4M21 16v4"],
  flag: ["M5 22V3", "M5 4c5-5 9 5 15 0v11c-6 5-10-5-15 0"],
  receipt: ["M5 2h9l5 5v15H5Z", "M14 2v6h5", "M8 12h8M8 16h8M8 19h5"],
  info: ["M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z", "M12 11v6M12 7v1"],
  funnel: ["M3 3h18l-7 9v7l-4 2V12Z"],
  link: [
    "m10 13 4-4",
    "M8 15l-2 2a4 4 0 0 1-5-5l5-5a4 4 0 0 1 6 0",
    "M16 9l2-2a4 4 0 0 1 5 5l-5 5a4 4 0 0 1-6 0",
  ],
  inventory: [
    "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 1.13-1.8l7.95-3.98a2 2 0 0 1 1.84 0l7.95 3.98A2 2 0 0 1 22 8Z",
    "M18 21V10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v11",
    "M6 13h12",
    "M6 17h12",
  ],
  "clipboard-list": [
    "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",
    "M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z",
    "M9 12h6",
    "M9 16h6",
  ],
  "user-edit": [
    "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    "M3 21v-2a6 6 0 0 1 9-5.2",
    "m19 11 2 2-7 7h-2v-2l7-7Z",
  ],
  world: [
    "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z",
    "M2 12h20",
    "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z",
  ],
  "external-link": [
    "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",
    "M15 3h6v6",
    "M10 14 21 3",
  ],
  "chef-hat": [
    "M6 13.8a4 4 0 0 1 1.4-7.8 5 5 0 0 1 9.2 0 4 4 0 0 1 1.4 7.8V20H6Z",
    "M6 17h12",
  ],
  "dining-table": [
    "M4 7v13",
    "M4 14h3",
    "M20 7v13",
    "M17 14h3",
    "M7 11h10",
    "M12 11v9",
    "M9 20h6",
  ],
  "cash-register": [
    "M8 4h8v3H8Z",
    "M12 7v2",
    "M5 9h14l-1 6H6Z",
    "M4 15h16v5H4Z",
    "M10 18h4",
  ],
  moped: [
    "M6 17a3 3 0 1 0 6 0 3 3 0 1 0-6 0Z",
    "M15 17a3 3 0 1 0 6 0 3 3 0 1 0-6 0Z",
    "M9 17h3l3-7h3",
    "M7 11h4",
    "M17 10h3",
  ],
  logout: [
    "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",
    "m16 17 5-5-5-5",
    "M21 12H9",
  ],
  "chevron-right": ["m9 18 6-6-6-6"],
  table: [
    "M4 7v13",
    "M4 14h3",
    "M20 7v13",
    "M17 14h3",
    "M7 11h10",
    "M12 11v9",
    "M9 20h6",
  ],
  home: ["m3 10 9-8 9 8v12h-6v-8H9v8H3Z"],
  filter: ["M4 6h16M4 12h16M4 18h16", "M8 3v6M16 9v6M10 15v6"],

  "circle-plus": [
    "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
    "M12 7v10",
    "M7 12h10",
  ],
  percent: [
    "m5 19 14-14",
    "M9 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
    "M21 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  ],
  chef: [
    "M7 16v-5a4 4 0 1 1 1-7 5 5 0 0 1 8 0 4 4 0 1 1 1 7v5Z",
    "M7 16h10v5H7Z",
  ],
  bell: ["M5 17h14l-2-3V9a5 5 0 0 0-10 0v5Z", "M10 21h4M12 2v2"],
  chart: ["M4 20V12h3v8ZM11 20V8h3v12ZM18 20V3h3v17Z"],
  serve: ["M3 17a9 9 0 0 1 18 0ZM2 21h20M12 8V4M10 4h4"],
  bank: ["M3 9 12 3l9 6ZM3 21h18M5 12v6M10 12v6M15 12v6M20 12v6"],

  bag: ["M4 7h16l1 15H3Z", "M8 8V5a4 4 0 0 1 8 0v3"],
  box: [
    "m2 7 10-5 10 5-10 5Z",
    "M2 7v11l10 5 10-5V7",
    "M12 12v11",
    "m7 4 10 5",
  ],
  settings: [
    "m9 2-1 3-3 1-3-1-1 5 3 2v3l-2 2 3 4 3-1 3 2 1 2 5-1v-3l3-2 3 1 1-5-3-2v-3l2-2-3-4-3 1-3-2Z",
    "M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  ],
  calendar: [
    "M3 5h18v17H3Z",
    "M3 10h18",
    "M7 2v5",
    "M17 2v5",
    "M7 14h2m3 0h2m3 0h1M7 18h2m3 0h2",
  ],
  scooter: [
    "M8 18H5a4 4 0 1 1 0-8h3l3 8h5l-3-12h5",
    "M18 14a4 4 0 1 0 0 8 4 4 0 0 0 0-8",
    "M4 6h7",
    "M13 3h5",
    "m8 10 7-3",
  ],
  coins: [
    "M3 6c0-5 18-5 18 0s-18 5-18 0Z",
    "M3 6v4c0 5 18 5 18 0V6",
    "M3 10v5c0 5 18 5 18 0v-5",
    "M3 15v5c0 5 18 5 18 0v-5",
  ],
  plus: ["M12 3v18", "M3 12h18"],
  save: ["M3 2h15l4 4v16H3Z", "M7 2v7h10V2", "M7 22v-9h10v9"],
  edit: ["m4 16 12-12 4 4-12 12-5 1Z", "m14 6 4 4"],
  copy: ["M8 7h13v15H8Z", "M16 7V2H3v15h5"],
  download: ["M12 2v14", "m6 10 6 6 6-6", "M3 16v6h18v-6"],
  print: ["M6 8V2h12v6", "M6 18H2V8h20v10h-4", "M6 14h12v8H6Z", "M17 11h2"],
  send: ["M2 3 23 12 2 21l4-9Z", "M6 12h17"],
  power: ["M12 1v11", "M6 4a10 10 0 1 0 12 0"],
  trophy: [
    "M6 2h12v7c0 10-12 10-12 0Z",
    "M6 4H2v4c0 5 4 5 5 5",
    "M18 4h4v4c0 5-4 5-5 5",
    "M12 16v6",
    "M7 23h10",
  ],

  list: ["M8 5h14M8 12h14M8 19h14", "M2 5h2M2 12h2M2 19h2"],
  clipboard: ["M8 3H4v19h16V3h-4", "M8 1h8v5H8Z", "M8 10h8M8 15h8"],
};
export function Icon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: IconName }) {
  const filled: Partial<Record<IconName, string>> = {
    user: "M12 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10ZM3 22v-3a9 7 0 0 1 18 0v3Z",
    eye: "M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Zm6 0a5 5 0 1 0 10 0 5 5 0 0 0-10 0Zm3 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z",
    chicken:
      "M16 2c-1-2-3-1-3 1-2-1-3 1-1 3l1 1c-1 2-2 4-5 4-3 0-4-2-5-5-3 4-2 9 2 11 2 1 4 2 7 1l-1 3H8v2h5l2-6c3-2 4-5 3-8l3-1-2-2c0-3-1-4-3-4Z",
  };
  if (filled[name])
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        {...props}
      >
        <path d={filled[name]} fillRule="evenodd" />
      </svg>
    );
  if (linePaths[name])
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
      >
        {linePaths[name]!.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    );
  return <BaseIcon name={name as BaseIconName} {...props} />;
}
export function ProductSummary({ order }: { order: Order }) {
  const first = order.items[0];
  if (!first) return null;
  return (
    <div className="ops-product-summary">
      <img src={first.product.image} alt="" loading="lazy" />
      <div>
        <strong>
          {first.count} {first.product.name}
        </strong>
        <small>
          {order.items.length > 1
            ? `+ ${order.items.length - 1} productos`
            : first.product.description}
        </small>
      </div>
    </div>
  );
}
export function UserSummary({
  name,
  detail,
}: {
  name: string;
  detail?: string;
}) {
  return (
    <div className="ops-person">
      <span className="ops-avatar">
        <Icon name="user" />
      </span>
      <div>
        <strong>{name}</strong>
        {detail && <small>{detail}</small>}
      </div>
    </div>
  );
}
export function PaymentMark({ name }: { name: string }) {
  return name === "Yape" || name === "Plin" ? (
    <img
      className="ops-wallet-mark"
      src={`/images/checkout/${name.toLowerCase()}.webp`}
      alt=""
    />
  ) : (
    <Icon
      name={
        name === "Efectivo"
          ? "cash"
          : name === "Transferencia"
            ? "bank"
            : "card"
      }
    />
  );
}

export function IngredientPhoto({ name }: { name: string }) {
  const kind = /pollo/i.test(name)
    ? "chicken"
    : /papa/i.test(name)
      ? "potatoes"
      : /carbón|carbon/i.test(name)
        ? "charcoal"
        : /bbq|salsa/i.test(name)
          ? "sauce"
          : null;
  return kind ? (
    <span className={`ops-ingredient-photo ${kind}`} aria-hidden="true" />
  ) : /inca/i.test(name) ? (
    <img
      className="ops-supply-photo"
      src="/images/carta/products/bebidas-01.webp"
      alt=""
    />
  ) : (
    <span className="ops-supply-placeholder">
      <Icon name="box" />
    </span>
  );
}
export function SupplySummary({
  name,
  detail,
}: {
  name: string;
  detail?: string;
}) {
  return (
    <div className="ops-supply-summary">
      <IngredientPhoto name={name} />
      <div>
        <strong>{name}</strong>
        {detail && <small>{detail}</small>}
      </div>
    </div>
  );
}
