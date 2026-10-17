import {
  createLocalUser,
  currentUser,
  readUsers,
} from "../../services/localAuth";
import {
  getOperations,
  refreshWorkspacePreview,
  seedWorkspacePreview,
} from "./operationsStore";

/** Only explicitly requested demonstration records are added; existing accounts stay intact. */
export async function loadWorkspacePreview() {
  if (currentUser()?.role !== "administrador")
    throw new Error("Solo administración puede cargar la muestra.");
  if (
    getOperations().suppliers.some((s) => s.id === "workspace-preview-supplier")
  )
    refreshWorkspacePreview();
  else seedWorkspacePreview();
  const names = [
    ...new Set(
      getOperations()
        .orders.filter(
          (o) =>
            o.customerId === "kitchen-preview" &&
            o.customer &&
            !o.customer.startsWith("Mesa "),
        )
        .map((o) => o.customer),
    ),
  ].slice(0, 8);
  for (const name of names) {
    const slug = name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    const email = `${slug}@preview.example`;
    if (readUsers().some((u) => u.email === email)) continue;
    await createLocalUser(
      { name, email, phone: "", role: "cliente", password: "Demo2026!" },
      true,
    );
  }
}
