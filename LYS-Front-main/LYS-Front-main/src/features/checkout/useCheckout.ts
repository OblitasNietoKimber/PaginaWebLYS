import { useOperations } from "../operations/operationsStore";
import { currentUser } from "../../services/localAuth";
import { useEffect, useRef, useState } from "react";
import { getAccount } from "../account/accountStore";
import { savedReceipt, saveReceipt } from "./receiptStorage";
import type { DeliveryPoint } from "./location";
import type { Product } from "../carta/catalog";

export type PaymentMethod = "card" | "yape" | "plin" | "cash";
export type DeliveryDraft = {
  mode: "delivery" | "pickup";
  address: string;
  district: string;
  label: string;
  reference: string;
  instructions: string;
  name: string;
  phone: string;
  email: string;
  store: string;
  location?: DeliveryPoint | null;
};
export type CartItem = { product: Product; count: number };
export type Receipt = {
  couponCode?: string;
  code: string;
  date: string;
  items: CartItem[];
  delivery: DeliveryDraft;
  method: PaymentMethod;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
};
export const paymentNames: Record<PaymentMethod, string> = {
  card: "Tarjeta de crédito/débito",
  yape: "Yape",
  plin: "Plin",
  cash: "Efectivo al recibir",
};
const draftKey = () => "lys-checkout-draft-" + (currentUser()?.id || "guest");
const emptyDelivery: DeliveryDraft = {
  mode: "delivery",
  address: "",
  district: "",
  label: "Casa",
  reference: "",
  instructions: "",
  name: "",
  phone: "",
  email: "",
  store: "Local principal",
};
export function useCheckout(items: CartItem[]) {
  const state = useOperations();
  const [delivery, setDelivery] = useState<DeliveryDraft>(() => {
    let stored: Partial<DeliveryDraft> = {};
    try {
      stored = JSON.parse(localStorage.getItem(draftKey()) || "{}");
    } catch {
      /* Recupera los datos del perfil si el borrador es inválido. */
    }
    const account = getAccount();
    const address =
      account.addresses.find((item) => item.primary) || account.addresses[0];
    return {
      ...emptyDelivery,
      name: account.profile.name,
      phone: account.profile.phone,
      email: account.profile.email,
      instructions: account.profile.notes,
      ...(address
        ? {
            address: address.street,
            district: address.district,
            label: address.label,
            reference: address.reference,
            location: address.point,
          }
        : {}),
      ...stored,
    };
  });
  useEffect(() => {
    localStorage.setItem(draftKey(), JSON.stringify(delivery));
  }, [delivery]);
  const [method, setMethod] = useState<PaymentMethod>(
    () => (getAccount().preferredPayment || "card") as PaymentMethod,
  );
  const [paymentReady, setPaymentReady] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [appliedCode, setAppliedCode] = useState("");
  const activeOffer = state.offers.find(
    (o) =>
      o.type === "Cupón" &&
      o.active &&
      o.code === appliedCode &&
      o.start <= new Date().toISOString().slice(0, 10) &&
      o.end >= new Date().toISOString().slice(0, 10) &&
      o.used < o.limit,
  );
  const couponApplied = !!activeOffer;
  const [couponMessage, setCouponMessage] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(savedReceipt);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  useEffect(() => {
    if (!items.length) submitting.current = false;
  }, [items.length]);
  const subtotalCents = items.reduce(
    (sum, item) => sum + Math.round(item.product.price * 100) * item.count,
    0,
  );
  const shippingCents = items.length && delivery.mode === "delivery" ? 700 : 0;
  const discountCents = couponApplied
    ? Math.round(
        (items
          .filter(
            (l) =>
              !activeOffer?.productId || l.product.id === activeOffer.productId,
          )
          .reduce(
            (s, l) => s + Math.round(l.product.price * 100) * l.count,
            0,
          ) *
          (activeOffer?.percent || 0)) /
          100,
      )
    : 0;
  const totals = {
    subtotal: subtotalCents / 100,
    shipping: shippingCents / 100,
    discount: discountCents / 100,
    total: (subtotalCents + shippingCents - discountCents) / 100,
  };
  const deliveryReady =
    delivery.name.trim().length >= 3 &&
    /^9\d{8}$/.test(delivery.phone) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(delivery.email) &&
    (delivery.mode === "pickup" ||
      (delivery.address.trim().length >= 5 &&
        delivery.district.trim().length >= 2 &&
        delivery.reference.trim().length >= 3));
  function applyCoupon() {
    const code = coupon.trim().toUpperCase();
    const offer = state.offers.find(
      (o) =>
        o.type === "Cupón" &&
        o.code === code &&
        o.active &&
        o.start <= new Date().toISOString().slice(0, 10) &&
        o.end >= new Date().toISOString().slice(0, 10) &&
        o.used < o.limit,
    );
    setAppliedCode(offer ? code : "");
    setCouponMessage(
      offer
        ? "Cupón aplicado: " + offer.percent + "% de descuento."
        : "Código inválido, vencido o sin disponibilidad.",
    );
  }
  function selectPayment(value: PaymentMethod) {
    setMethod(value);
    setPaymentReady(false);
  }
  function finish(clearCart: () => void) {
    if (!state.settings.open) {
      setCouponMessage(
        "El local está cerrado. Inténtalo durante el horario de atención.",
      );
      return false;
    }
    if (
      !state.settings.methods.includes(
        { card: "Tarjeta", yape: "Yape", plin: "Plin", cash: "Efectivo" }[
          method
        ],
      )
    ) {
      setCouponMessage(
        "El método de pago ya no está disponible. Selecciona otro.",
      );
      return false;
    }
    if (
      submitting.current ||
      busy ||
      !items.length ||
      !deliveryReady ||
      !paymentReady
    )
      return false;
    submitting.current = true;
    setBusy(true);
    const order: Receipt = {
      code: `LYS-DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      date: new Date().toISOString(),
      items: items.map((item) => ({ ...item })),
      delivery: { ...delivery },
      method,
      couponCode: appliedCode,
      ...totals,
    };
    if (!currentUser()) {
      submitting.current = false;
      setBusy(false);
      setCouponMessage("Inicia sesión para confirmar tu pedido.");
      return false;
    }
    try {
      saveReceipt(order);
    } catch (error) {
      submitting.current = false;
      setBusy(false);
      setCouponMessage(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el pedido.",
      );
      return false;
    }
    setReceipt(order);
    localStorage.removeItem(draftKey());
    clearCart();
    setBusy(false);
    return true;
  }
  return {
    delivery,
    setDelivery,
    method,
    selectPayment,
    paymentReady,
    setPaymentReady,
    deliveryReady,
    coupon,
    setCoupon,
    couponApplied,
    couponMessage,
    applyCoupon,
    receipt,
    busy,
    finish,
    ...totals,
  };
}
export type Checkout = ReturnType<typeof useCheckout>;
