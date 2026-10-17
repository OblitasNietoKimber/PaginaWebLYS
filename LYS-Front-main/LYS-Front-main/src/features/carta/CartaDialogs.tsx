import { useEffect, useRef, useState } from "react";
import { Icon } from "../../components/Icon";
import { soles, type Product } from "./catalog";
import { useOperations } from "../operations/operationsStore";
import { setPersonalization, usePersonalization } from "./cartPersonalization";
import "../../styles/prototype-customer.css";

function ProductOptions({
  product,
  onAdd,
  onClose,
}: {
  product: Product;
  onAdd: (id: string, count?: number) => void;
  onClose: () => void;
}) {
  const { products } = useOperations();
  const saved = usePersonalization()[product.id];
  const [count, setCount] = useState(1);
  const [sides, setSides] = useState<string[]>(saved?.sides || []);
  const [notes, setNotes] = useState(saved?.notes || "");
  const [photo, setPhoto] = useState(0);
  const gallery = [
    ...new Set([
      product.image,
      ...(products.find((p) => p.id === product.id)?.gallery || []),
    ]),
  ];
  const views =
    gallery.length > 1
      ? gallery.map((src, index) => ({
          src,
          label: `Foto ${index + 1}`,
          zoom: 1,
        }))
      : [
          { src: product.image, label: "Vista completa", zoom: 1 },
          { src: product.image, label: "Acercamiento", zoom: 1.35 },
          { src: product.image, label: "Detalle", zoom: 1.7 },
        ];
  const customSides = ["pollo", "parrillas", "combos", "saltados"].includes(
    product.category,
  );
  return (
    <div className="prototype-product-layout">
      <div className="prototype-product-gallery">
        <div className="prototype-product-image">
          <img
            src={views[photo].src}
            alt={`${product.name}: ${views[photo].label}`}
            style={{ transform: `scale(${views[photo].zoom})` }}
          />
        </div>
        <div
          className="prototype-product-thumbnails"
          aria-label="Imágenes del producto"
        >
          {views.map((view, index) => (
            <button
              key={index}
              type="button"
              aria-label={view.label}
              aria-pressed={photo === index}
              onClick={() => setPhoto(index)}
            >
              <img
                src={view.src}
                alt=""
                style={{ transform: `scale(${view.zoom})` }}
              />
            </button>
          ))}
        </div>
      </div>
      <form
        className="prototype-product-options"
        onSubmit={(event) => {
          event.preventDefault();
          setPersonalization(product.id, { sides, notes: notes.trim() });
          onAdd(product.id, count);
          onClose();
        }}
      >
        <span className="prototype-eyebrow">Preparado a tu gusto</span>
        <h2 id="product-detail-title">{product.name}</h2>
        <strong className="prototype-product-price">
          {soles(product.price)}
        </strong>
        <p>{product.description}</p>
        {customSides && (
          <fieldset>
            <legend>Personaliza tu pedido</legend>
            <span className="prototype-field-hint">
              Guarniciones · sin costo adicional
            </span>
            <div className="prototype-side-options">
              {["Papas fritas", "Ensalada", "Arroz"].map((side) => (
                <label key={side}>
                  <input
                    type="checkbox"
                    checked={sides.includes(side)}
                    onChange={() =>
                      setSides((previous) =>
                        previous.includes(side)
                          ? previous.filter((item) => item !== side)
                          : [...previous, side],
                      )
                    }
                  />
                  {side}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <label className="prototype-notes">
          Observaciones <small>(opcional)</small>
          <textarea
            rows={3}
            maxLength={240}
            value={notes}
            placeholder="Ej. sin ají, cremas aparte…"
            onChange={(event) => setNotes(event.target.value)}
          />
          <small>{notes.length}/240</small>
        </label>
        <div className="prototype-product-purchase">
          <div
            className="prototype-quantity"
            role="group"
            aria-label="Cantidad"
          >
            <button
              type="button"
              aria-label="Reducir cantidad"
              disabled={count === 1}
              onClick={() => setCount(count - 1)}
            >
              −
            </button>
            <output aria-live="polite">{count}</output>
            <button
              type="button"
              aria-label="Aumentar cantidad"
              disabled={count === 99}
              onClick={() => setCount(count + 1)}
            >
              +
            </button>
          </div>
          <button type="submit" className="primary-button">
            Agregar al carrito · {soles(product.price * count)}
          </button>
        </div>
      </form>
    </div>
  );
}
export function ProductDetail({
  product,
  onClose,
  onAdd,
}: {
  product: Product | null;
  onClose: () => void;
  onAdd: (id: string, count?: number) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (product) ref.current?.showModal();
    else ref.current?.close();
  }, [product]);
  useEffect(() => {
    if (!product) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [product]);
  return (
    <dialog
      ref={ref}
      className="carta-dialog product-detail prototype-product-detail"
      aria-labelledby="product-detail-title"
      onClose={onClose}
    >
      <button
        type="button"
        className="dialog-close"
        aria-label="Cerrar detalle"
        onClick={onClose}
      >
        <Icon name="close" />
      </button>
      {product && (
        <ProductOptions
          key={product.id}
          product={product}
          onAdd={onAdd}
          onClose={onClose}
        />
      )}
    </dialog>
  );
}
