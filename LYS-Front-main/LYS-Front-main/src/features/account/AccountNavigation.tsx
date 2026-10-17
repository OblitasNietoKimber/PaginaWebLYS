import { Icon } from "../../components/Icon";
import { displayFirstName } from "../../services/displayName";
import { useAccount } from "./accountStore";
import { accountSections, accountPath } from "./accountSections";
export function AccountAvatar() {
  const { profile } = useAccount();
  return (
    <span className="account-avatar">
      {profile.photo ? (
        <img src={profile.photo} alt="Foto de perfil" />
      ) : (
        <Icon name="user" />
      )}
    </span>
  );
}
export function AccountNavigation({
  slug,
  onNavigate,
  onLogout,
}: {
  slug: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}) {
  const { profile } = useAccount();
  const selected =
    accountSections.find((s) => s.slug === slug) || accountSections[0];
  const navigate = (value: string) =>
    value === "cerrar-sesion" ? onLogout() : onNavigate(accountPath(value));
  return (
    <>
      <aside className="account-sidebar info-card">
        <div className="account-identity">
          <AccountAvatar />
          <div>
            <strong>{displayFirstName(profile.name)}</strong>
            <span>{profile.email}</span>
          </div>
        </div>
        <nav aria-label="Secciones de mi cuenta">
          {accountSections.map((s) => (
            <button
              type="button"
              key={s.slug}
              className={s.slug === "cerrar-sesion" ? "account-exit" : ""}
              aria-current={s.slug === slug ? "page" : undefined}
              onClick={() => navigate(s.slug)}
            >
              <Icon name={s.icon} />
              <span>{s.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <label className="account-mobile-select">
        <Icon name={selected.icon} />
        <span className="sr-only">Sección de mi cuenta</span>
        <select
          aria-label="Sección de mi cuenta"
          value={slug}
          onChange={(e) => navigate(e.target.value)}
        >
          {accountSections.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.label}
            </option>
          ))}
        </select>
        <Icon name="chevron" />
      </label>
    </>
  );
}
