import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { displayFirstName } from "../services/displayName";
import { useSession, roleHome } from "../services/localAuth";
import { Icon } from "./Icon";

const sections = [
  "Inicio",
  "Carta",
  "Promociones",
  "Nosotros",
  "Locales",
  "Contacto",
];

export function Header({
  onSection,
  carta,
  activeSection,
}: {
  onSection: (section: string) => void;
  activeSection?: string;
  carta?: {
    query: string;
    onSearch: (query: string) => void;
    count: number;
    onCart: () => void;
    searchHref?: string;
  };
}) {
  const user = useSession();
  const active = activeSection ?? "Carta";
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  function navigate(section: string) {
    setMenuOpen(false);
    onSection(section);
  }

  return (
    <header className="site-header carta-header">
      <a className="brand" href="/" aria-label="Leñas y Sabores, inicio">
        <img
          src="/images/logo.webp"
          alt="Leñas y Sabores — Pollos & Parrillas"
          width="2048"
          height="682"
        />
      </a>
      <nav className="desktop-nav" aria-label="Navegación principal">
        {sections.map((section) => (
          <button
            key={section}
            type="button"
            className={section === active ? "nav-link active" : "nav-link"}
            aria-current={section === active ? "page" : undefined}
            onClick={() => navigate(section)}
          >
            {section}
          </button>
        ))}
      </nav>
      <div className="header-actions">
        {carta && (
          <>
            <label className="carta-header-search">
              <Icon name="search" />
              <input
                type="search"
                aria-label="Buscar productos"
                placeholder="Buscar productos…"
                value={carta.query}
                onChange={(event) => carta.onSearch(event.target.value)}
              />
            </label>
            <a
              href={carta.searchHref || "#carta-search"}
              className="carta-search-toggle"
              aria-label="Buscar en la carta"
            >
              <Icon name="search" />
            </a>
            <button
              type="button"
              className="carta-cart-toggle"
              aria-label={`Ver pedido, ${carta.count} productos`}
              onClick={carta.onCart}
            >
              <Icon name="cart" />
              {carta.count > 0 && <span>{carta.count}</span>}
            </button>
          </>
        )}
        <a
          className="login-link"
          aria-label={user ? displayFirstName(user.name) : "Iniciar Session"}
          href={user ? roleHome(user.role) : "/iniciar-sesion"}
        >
          <Icon name="user" />
          {user ? displayFirstName(user.name) : "Iniciar Session"}
        </a>
        <span className="header-divider" aria-hidden="true" />
        <button
          type="button"
          className="order-button"
          aria-label="Pedir ahora"
          onClick={() => onSection("Pedir ahora")}
        >
          <span className="order-glare" aria-hidden="true" />
          <Icon name="cart" />
          <span>Pedir ahora</span>
        </button>
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Icon name={menuOpen ? "close" : "menu"} />
        </button>
      </div>
      <motion.nav
        animate={{ opacity: menuOpen ? 1 : 0, y: menuOpen ? 0 : -8 }}
        transition={{ duration: 0.18 }}
        id="mobile-navigation"
        className="mobile-nav"
        aria-label="Navegación móvil"
        hidden={!menuOpen}
      >
        {sections.map((section) => (
          <button type="button" key={section} onClick={() => navigate(section)}>
            {section}
          </button>
        ))}
        <a
          href={user ? roleHome(user.role) : "/iniciar-sesion"}
          onClick={() => setMenuOpen(false)}
        >
          {user ? displayFirstName(user.name) : "Iniciar Session"}
        </a>
      </motion.nav>
    </header>
  );
}
