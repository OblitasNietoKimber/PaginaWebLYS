import { useSyncExternalStore } from "react";
export type Role =
  "cliente" | "mesera" | "cocina" | "caja" | "administrador" | "delivery";
export type LocalUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  active: boolean;
  salt: string;
  hash: string;
  created: string;
};
export const roleNames: Record<Role, string> = {
  cliente: "Cliente",
  mesera: "Salón",
  cocina: "Cocina",
  caja: "Caja",
  administrador: "Administración",
  delivery: "Delivery",
};
export const roleHome = (role: Role) =>
  role === "cliente" ? "/mi-cuenta" : `/${role}`;
const usersKey = "lys-users-v1";
const sessionKey = "lys-session-v1";
const listeners = new Set<() => void>();
let cached: LocalUser | null | undefined;
export function readUsers(): LocalUser[] {
  try {
    const value = JSON.parse(localStorage.getItem(usersKey) || "[]");
    return Array.isArray(value)
      ? value.filter(
          (user) =>
            user &&
            typeof user.id === "string" &&
            typeof user.email === "string" &&
            user.role in roleNames &&
            typeof user.hash === "string",
        )
      : [];
  } catch {
    return [];
  }
}
function notify() {
  cached = undefined;
  listeners.forEach((listener) => listener());
  window.dispatchEvent(new Event("lys-auth"));
}
export function currentUser(): LocalUser | null {
  const id = localStorage.getItem(sessionKey);
  const found =
    readUsers().find((user) => user.id === id && user.active) || null;
  if (JSON.stringify(found) !== JSON.stringify(cached)) cached = found;
  return cached || null;
}
window.addEventListener("storage", (event) => {
  if ([usersKey, sessionKey, null].includes(event.key)) notify();
});
export function useSession() {
  return useSyncExternalStore((listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, currentUser);
}
function persist(users: LocalUser[]) {
  localStorage.setItem(usersKey, JSON.stringify(users));
  notify();
}
async function passwordHash(password: string, salt: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return Array.from(new Uint8Array(bits), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
export async function createLocalUser(
  values: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: Role;
  },
  staff = false,
) {
  if (staff && currentUser()?.role !== "administrador")
    throw new Error("Solo administración puede crear personal.");
  const email = values.email.trim().toLowerCase();
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    values.name.trim().length < 3 ||
    values.password.length < 8
  )
    throw new Error(
      "Revisa nombre, correo y contraseña (mínimo 8 caracteres).",
    );
  if (readUsers().some((user) => user.email === email))
    throw new Error("Ya existe una cuenta con ese correo.");
  const salt = crypto.randomUUID();
  const user: LocalUser = {
    id: crypto.randomUUID(),
    name: values.name.trim(),
    email,
    phone: values.phone,
    role: staff ? values.role || "cliente" : "cliente",
    active: true,
    salt,
    hash: await passwordHash(values.password, salt),
    created: new Date().toISOString(),
  };
  persist([...readUsers(), user]);
  return user;
}
export async function loginLocal(email: string, password: string) {
  if (
    /^(administrador|mesera|cocina|caja|delivery|cliente)@demo\.local$/i.test(
      email.trim(),
    )
  )
    await prepareDemoAccess();
  const user = readUsers().find(
    (item) => item.email === email.trim().toLowerCase() && item.active,
  );
  if (!user || (await passwordHash(password, user.salt)) !== user.hash)
    throw new Error("Correo o contraseña incorrectos.");
  localStorage.setItem(sessionKey, user.id);
  notify();
  return user;
}
export function logoutLocal() {
  localStorage.removeItem(sessionKey);
  notify();
}
export function editLocalUser(
  id: string,
  change: Partial<
    Pick<LocalUser, "name" | "email" | "phone" | "role" | "active">
  >,
) {
  if (change.email) {
    change.email = change.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(change.email))
      throw new Error("Correo inválido.");
  }
  if (change.name !== undefined && change.name.trim().length < 3)
    throw new Error("Ingresa un nombre válido.");
  const actor = currentUser();
  if (!actor || (actor.role !== "administrador" && actor.id !== id))
    throw new Error("No tienes permiso para editar esta cuenta.");
  if (
    actor.role !== "administrador" &&
    (change.role !== undefined || change.active !== undefined)
  )
    throw new Error("No puedes cambiar tu rol.");
  if (
    id === actor.id &&
    (change.active === false || (change.role && change.role !== actor.role))
  )
    throw new Error(
      "No puedes desactivar tu propio acceso ni cambiar tu propio rol.",
    );
  if (
    change.email &&
    readUsers().some(
      (user) =>
        user.id !== id && user.email === change.email!.trim().toLowerCase(),
    )
  )
    throw new Error("Ese correo ya está registrado.");
  persist(
    readUsers().map((user) => (user.id === id ? { ...user, ...change } : user)),
  );
}
export async function changeLocalPassword(previous: string, next: string) {
  const user = currentUser();
  if (!user || (await passwordHash(previous, user.salt)) !== user.hash)
    throw new Error("La contraseña actual no coincide.");
  if (next.length < 8)
    throw new Error("La nueva contraseña debe tener al menos 8 caracteres.");
  const salt = crypto.randomUUID();
  const hash = await passwordHash(next, salt);
  persist(
    readUsers().map((item) =>
      item.id === user.id ? { ...item, salt, hash } : item,
    ),
  );
}
// Cuentas de la simulación local, documentadas en README; nunca son credenciales del negocio.
export async function prepareDemoAccess() {
  const existing = readUsers();
  const added: LocalUser[] = [];
  for (const role of [
    "administrador",
    "mesera",
    "cocina",
    "caja",
    "delivery",
    "cliente",
  ] as Role[]) {
    const email = `${role}@demo.local`;
    if (existing.some((user) => user.email === email)) continue;
    const salt = crypto.randomUUID();
    added.push({
      id: crypto.randomUUID(),
      name: {
        administrador: "Admin Torres",
        mesera: "Lucía Salón",
        cocina: "Diego Cocina",
        caja: "Carlos Caja",
        delivery: "Luis Delivery",
        cliente: "Ana Torres",
      }[role],
      email,
      role,
      phone: "",
      active: true,
      salt,
      hash: await passwordHash("Demo2026!", salt),
      created: new Date().toISOString(),
    });
  }
  if (added.length) persist([...existing, ...added]);
}
