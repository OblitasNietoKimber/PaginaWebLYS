import type { SVGProps } from "react";

export type IconName =
  | "bell"
  | "logout"
  | "edit"
  | "camera"
  | "target"
  | "phone"
  | "mail"
  | "lock"
  | "eye"
  | "eye-off"
  | "user"
  | "arrow"
  | "menu"
  | "close"
  | "check"
  | "cart"
  | "truck"
  | "store"
  | "table"
  | "card"
  | "gift"
  | "flame"
  | "leaf"
  | "clock"
  | "star"
  | "percent"
  | "mobile"
  | "cutlery"
  | "pin"
  | "search"
  | "heart"
  | "grid"
  | "chicken"
  | "grill"
  | "rice"
  | "fries"
  | "drink"
  | "bowl"
  | "home"
  | "tag"
  | "sort"
  | "chevron"
  | "users"
  | "pumpkin"
  | "trash"
  | "receipt"
  | "cash"
  | "shield";
const paths: Record<IconName, string[]> = {
  bell: ["M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9", "M10 21h4"],
  logout: ["M10 3H4v18h6", "M8 12h14", "m16 6 6 6-6 6"],
  edit: ["m16 3 5 5-12 12-6 1 1-6Z", "m14 5 5 5"],
  camera: ["M3 6h4l2-3h6l2 3h4v15H3Z", "M16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"],
  target: [
    "M12 2a10 10 0 1 0 10 10",
    "M12 6a6 6 0 1 0 6 6",
    "M12 10a2 2 0 1 0 2 2",
    "m12 12 9-9",
    "M17 2v5h5",
  ],
  trash: ["M3 6h18", "M8 6V3h8v3", "M5 6l1 16h12l1-16", "M10 10v8", "M14 10v8"],
  receipt: ["M5 2h14v20l-3-2-4 2-4-2-3 2Z", "M8 7h8", "M8 11h8", "M8 15h5"],
  cash: [
    "M2 5h20v14H2Z",
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
    "M5 9v6",
    "M19 9v6",
  ],
  shield: ["M12 2 3 6v6c0 6 9 10 9 10s9-4 9-10V6Z", "m8 12 3 3 5-6"],
  users: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  pumpkin: [
    "M12 5c-8-6-15 17-2 17h4c13 0 6-23-2-17Z",
    "M12 5V1l3 1",
    "m6 11 3-2 1 3Z",
    "m18 11-3-2-1 3Z",
    "m7 16 3 2 2-1 2 1 3-2",
  ],
  chevron: ["m6 9 6 6 6-6"],
  search: ["M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z", "m15 15 6 6"],
  heart: ["M12 21 3 12C-2 5 7 0 12 6c5-6 14-1 9 6Z"],
  grid: ["M3 3h7v7H3Z", "M14 3h7v7h-7Z", "M3 14h7v7H3Z", "M14 14h7v7h-7Z"],
  chicken: [
    "M5 17c-2-2-1-7 2-9 3-2 7-1 9 1 2 2 3 5 1 7",
    "M7 12c-2 0-3 3-1 5 2 2 5 1 6-1",
    "M14 12c-2 1-2 4 0 5 2 1 4 0 5-2l2-1",
    "M21 14c2 1 3-2 1-3-1-1-3 0-2 2",
    "M2 19c4 3 16 3 20 0",
    "M9 9c2-1 4 0 5 1",
  ],
  grill: [
    "M3 9h18c0 6-18 6-18 0Z",
    "M5 18h14",
    "m8 14-3 8",
    "m16 14 3 8",
    "M9 2c-2 2 2 3 0 5",
    "M15 2c-2 2 2 3 0 5",
  ],
  rice: [
    "M3 12h18c-1 11-17 11-18 0Z",
    "M5 12c0-7 14-7 14 0",
    "M8 8h1",
    "M12 6h1",
    "M15 9h1",
  ],
  fries: ["M5 10h14l-2 12H7Z", "M6 10V4h3v6", "M10 10V2h3v8", "M14 10V5h3v5"],
  drink: ["M5 5h14l-2 17H7Z", "M4 5h16", "m13 5 2-4h4"],
  bowl: ["M3 10h18c0 13-18 13-18 0Z", "M3 10c0-6 18-6 18 0", "M6 9h12"],
  home: ["m2 11 10-9 10 9", "M5 9v13h5v-8h4v8h5V9"],
  tag: ["M3 4h9l9 9-8 8-10-10Z", "M8 8h.01"],
  sort: ["M7 3v18", "m3 17 4 4 4-4", "M17 21V3", "m13 7 4-4 4 4"],
  truck: [
    "M1 6h13v12H1",
    "M14 10h5l4 5v3h-9",
    "M7 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
    "M21 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
    "M1 10h6",
    "M1 14h4",
  ],
  store: [
    "M4 10v11h16V10",
    "M2 10l3-7h14l3 7",
    "M2 10c0 4 5 4 5 0 0 4 5 4 5 0 0 4 5 4 5 0 0 4 5 4 5 0",
    "M9 21v-7h6v7",
  ],
  table: ["M4 7v13", "M4 14h3", "M20 7v13", "M17 14h3", "M7 11h10", "M12 11v9", "M9 20h6"],
  card: ["M3 4h18v16H3Z", "M3 9h18", "M6 15h5", "M16 15h2"],
  gift: [
    "M3 9h18v4H3Z",
    "M5 13v8h14v-8",
    "M12 9v12",
    "M12 9S3 8 5 4c2-4 7 5 7 5 0 0 5-9 7-5s-7 5-7 5Z",
  ],
  flame: [
    "M12 2c3 4-2 7 3 10 1-3 1-4 1-4 9 10 4 14-4 14S0 15 5 8c0 5 4 4 7-6Z",
  ],
  leaf: ["M3 21C4 8 10 3 22 2c0 15-8 20-17 15", "M5 17 16 8"],
  clock: [
    "M12 6a8 8 0 1 1-8 8 8 8 0 0 1 8-8Z",
    "M12 9v5l4 3",
    "M9 2h6",
    "m18 4 2 2",
  ],
  star: ["m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"],
  percent: [
    "m7 17 10-10",
    "M8 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z",
    "M18 17a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z",
    "m12 2 3 2 4 1 1 4 2 3-2 3-1 4-4 1-3 2-3-2-4-1-1-4-2-3 2-3 1-4 4-1Z",
  ],
  mobile: ["M6 2h12v20H6Z", "M6 5h12", "M11 19h2"],
  cutlery: ["M3 2v6c0 4 6 4 6 0V2", "M6 2v20", "M18 2c-4 4-4 10 0 10V2v20"],
  pin: [
    "M19 9c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 14 0Z",
    "M14 9a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
  ],
  phone: [
    "M6 3h3l2 5-2 2a14 14 0 0 0 5 5l2-2 5 2v3a3 3 0 0 1-3 3A18 18 0 0 1 3 6a3 3 0 0 1 3-3Z",
  ],
  cart: [
    "M3 3h2l2.5 12h11l2-8H6",
    "M9 20a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z",
    "M19 20a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z",
  ],
  mail: [
    "M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
    "m3 6 9 7 9-7",
  ],
  lock: [
    "M6 10h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z",
    "M8 10V6a4 4 0 0 1 8 0v4",
    "M12 14v3",
  ],
  eye: [
    "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z",
    "M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  ],
  "eye-off": [
    "m3 3 18 18",
    "M10.6 5.1 12 5c6.5 0 10 7 10 7a19 19 0 0 1-3.1 4",
    "M6.2 6.2A19 19 0 0 0 2 12s3.5 7 10 7c1.9 0 3.5-.5 4.9-1.3",
    "M9.9 9.9a3 3 0 0 0 4.2 4.2",
  ],
  user: ["M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z", "M4 21v-2a8 8 0 0 1 16 0v2"],
  arrow: ["M4 12h16", "m14 6 6 6-6 6"],
  menu: ["M3 5h18", "M3 12h18", "M3 19h18"],
  close: ["m5 5 14 14", "m5 19 14-14"],
  check: ["m4 12 5 5L20 6"],
};

export function Icon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: IconName }) {
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
      {paths[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export function GoogleIcon() {
  return (
    <svg className="google-icon" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M43.6 24.5c0-1.4-.1-2.7-.4-4H24v7.7h11a9.4 9.4 0 0 1-4.1 6.2v5h6.6c3.9-3.5 6.1-8.7 6.1-14.9Z"
      />
      <path
        fill="#34A853"
        d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5A12.3 12.3 0 0 1 12.6 28H5.8v5.2A20.3 20.3 0 0 0 24 44Z"
      />
      <path
        fill="#FBBC05"
        d="M12.6 28a12 12 0 0 1 0-8v-5.2H5.8a20 20 0 0 0 0 18.4l6.8-5.2Z"
      />
      <path
        fill="#EA4335"
        d="M24 12c3 0 5.7 1 7.9 3.1l5.9-5.9A20 20 0 0 0 5.8 14.8l6.8 5.2A12 12 0 0 1 24 12Z"
      />
    </svg>
  );
}
