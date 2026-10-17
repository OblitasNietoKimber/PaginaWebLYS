/** Compatibilidad con cuentas antiguas llamadas «Demo Administración». */
export function displayFirstName(name: string): string {
  return (
    name
      .trim()
      .replace(/^demo\s+/i, "")
      .split(/\s+/)[0] || "Mi cuenta"
  );
}
