import { useState } from "react";
import { Icon } from "../../components/Icon";
import { soles, categories, type Product } from "../carta/catalog";
import { AccountEmpty } from "./AccountShared";
export type FavoriteActions = {
  products: Product[];
  onFavorite: (id: string) => void;
  onAdd: (id: string) => void;
  onDetail: (product: Product) => void;
};
export function AccountProduct({
  product,
  onFavorite,
  onAdd,
  onDetail,
}: { product: Product } & Omit<FavoriteActions, "products">) {
  return (
    <article className="account-product">
      <div className="account-product-photo">
        <button
          type="button"
          onClick={() => onDetail(product)}
          aria-label={`Ver ${product.name}`}
        >
          <img
            src={product.image}
            alt={product.name}
            width="640"
            height="480"
            loading="lazy"
          />
        </button>
        <button
          type="button"
          className="account-heart"
          aria-label={`Quitar ${product.name} de favoritos`}
          onClick={() => onFavorite(product.id)}
        >
          <Icon name="heart" />
        </button>
      </div>
      <h3>{product.name}</h3>
      <strong>{soles(product.price)}</strong>
      <div className="account-product-actions">
        <button
          className="primary-button"
          type="button"
          onClick={() => onAdd(product.id)}
          aria-label={`Agregar ${product.name}`}
        >
          <Icon name="cart" />
          Agregar
        </button>
        <button
          className="info-button"
          type="button"
          onClick={() => onDetail(product)}
        >
          <Icon name="eye" />
          Ver detalle
        </button>
      </div>
    </article>
  );
}
export function AccountFavorites(
  props: FavoriteActions & { onNavigate: (path: string) => void },
) {
  const [filter, setFilter] = useState("all");
  const options = categories.filter((c) =>
    props.products.some((p) => p.category === c.id),
  );
  const shown = props.products.filter(
    (p) => filter === "all" || p.category === filter,
  );
  return (
    <>
      <div
        className="account-filter-tabs favorite-tabs"
        aria-label="Categorías de favoritos"
      >
        <button
          aria-pressed={filter === "all"}
          onClick={() => setFilter("all")}
        >
          Todas ({props.products.length})
        </button>
        {options.map((c) => (
          <button
            key={c.id}
            aria-pressed={filter === c.id}
            onClick={() => setFilter(c.id)}
          >
            {c.name} ({props.products.filter((p) => p.category === c.id).length}
            )
          </button>
        ))}
      </div>
      {shown.length ? (
        <div className="account-favorites">
          {shown.map((product) => (
            <AccountProduct key={product.id} product={product} {...props} />
          ))}
        </div>
      ) : (
        <AccountEmpty
          title="Aquí van tus favoritos"
          description="Toca el corazón de un producto de la carta para guardarlo y encontrarlo aquí."
          action="Explorar la carta"
          onAction={() => props.onNavigate("/carta")}
        />
      )}
    </>
  );
}
