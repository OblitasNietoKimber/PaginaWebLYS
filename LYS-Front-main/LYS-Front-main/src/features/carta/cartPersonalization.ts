import { useSyncExternalStore } from "react";

export type Personalization = { sides: string[]; notes: string };
// Presentation draft only; it does not change prices, stock or order permissions.
let selections: Record<string, Personalization> = {};
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
export function setPersonalization(id: string, value: Personalization) {
  selections = { ...selections, [id]: value };
  listeners.forEach((listener) => listener());
}
export function clearPersonalization(id?: string) {
  if (id) {
    selections = { ...selections };
    delete selections[id];
  } else selections = {};
  listeners.forEach((listener) => listener());
}
export function usePersonalization() {
  return useSyncExternalStore(subscribe, () => selections);
}
