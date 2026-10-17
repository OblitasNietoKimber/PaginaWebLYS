import type { IconName } from "../../components/Icon";
export const accountSections: {
  slug: string;
  label: string;
  icon: IconName;
  description: string;
}[] = [
  {
    slug: "",
    label: "Inicio",
    icon: "home",
    description:
      "Bienvenido a tu cuenta. Aquí puedes gestionar tus pedidos, direcciones y más.",
  },
  {
    slug: "pedidos",
    label: "Mis pedidos",
    icon: "receipt",
    description:
      "Consulta el estado de tus pedidos y vuelve a pedir tus platos favoritos.",
  },
  {
    slug: "direcciones",
    label: "Mis direcciones",
    icon: "pin",
    description:
      "Administra tus direcciones de entrega para realizar pedidos más rápido.",
  },
  {
    slug: "datos",
    label: "Mis datos",
    icon: "user",
    description: "Actualiza tu información personal.",
  },
  {
    slug: "metodos-pago",
    label: "Métodos de pago",
    icon: "card",
    description:
      "Administra tus métodos de pago para realizar tus pedidos de forma más rápida.",
  },
  {
    slug: "notificaciones",
    label: "Notificaciones",
    icon: "bell",
    description:
      "Mantente al día con el estado de tus pedidos, promociones y novedades.",
  },
  {
    slug: "favoritos",
    label: "Favoritos",
    icon: "heart",
    description: "Tus productos favoritos, listos para pedir cuando quieras.",
  },
  {
    slug: "cerrar-sesion",
    label: "Cerrar sesión",
    icon: "logout",
    description:
      "Si cierras tu sesión, tendrás que volver a ingresar para acceder a tu cuenta.",
  },
];
export const accountPath = (slug: string) =>
  `/mi-cuenta${slug ? `/${slug}` : ""}`;
