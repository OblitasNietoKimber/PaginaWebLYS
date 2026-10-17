import { useState } from "react";
import { categories } from "../carta/catalog";
import { OperationsDialog } from "./OperationsDialog";
import { Badge, Empty } from "./OperationsUI";
import { Icon } from "./OperationsVisuals";
import { money, type MenuProduct } from "./operationsStore";
import { dateText } from "./operationsFiles";
import { productSku, categoryIcon } from "./productHelpers";

export function ProductDetails({product:p, onClose, onEdit, onDeactivate}: {
  product:MenuProduct; onClose:()=>void; onEdit:()=>void; onDeactivate?:()=>void;
}) {
  const [tab,setTab] = useState("Ingredientes");
  const images = [...new Set([p.image,...(p.gallery || [])])];
  const [image,setImage] = useState(p.image);
  return <OperationsDialog title="Detalle del producto" icon="box" className="ops-product-dialog ops-product-detail-dialog" onClose={onClose}>
    <div className="ops-product-overview">
      <img src={p.image} alt={p.name}/>
      <section><div className="ops-product-title"><div><h3>{p.name}</h3><p>{p.description}</p></div><Badge value={p.active ? "Activo":"Inactivo"}/></div>
        <dl className="ops-product-facts">{[["Precio",money(p.price),"tag"],["Stock",`${p.stock ?? 0} unidades`,"box"],["Categoría",categories.find(c=>c.id===p.category)?.name || p.category,categoryIcon(p.category)],["SKU",productSku(p),"receipt"]].map(([label,value,icon])=><div key={label}><Icon name={icon as Parameters<typeof Icon>[0]["name"]}/><div><dt>{label}</dt><dd>{value}</dd></div></div>)}</dl>
      </section>
    </div>
    <div className="ops-product-detail-layout">
      <nav aria-label="Información del producto">{["Descripción","Ingredientes","Información comercial","Historial"].map((label,i)=><button key={label} aria-pressed={tab===label} onClick={()=>setTab(label)}><Icon name={i===1 ? "cutlery":i===3 ? "clock":"receipt"}/>{label}</button>)}</nav>
      <section className="ops-product-detail-content">
        <h3>{tab === "Ingredientes" ? "Ingredientes y acompañamientos":tab}</h3>{tab === "Ingredientes" && <p className="ops-detail-subtitle">Todo lo que incluye y detalles de preparación de este producto.</p>}
        {tab === "Descripción" && <><p>{p.description || "Sin descripción registrada."}</p><h4>Preparación y observaciones</h4><p className="ops-preserve-lines">{p.observations || "Sin observaciones registradas."}</p></>}
        {tab === "Ingredientes" && <div className="ops-product-ingredients"><div><section className="ops-detail-block"><h4>Incluye</h4>{p.ingredients?.length ? <ul>{p.ingredients.map((s,i)=><li key={i}>{s}</li>)}</ul>:<Empty>Sin ingredientes registrados.</Empty>}</section><section className="ops-detail-block"><h4>Preparación y observaciones</h4><div className="ops-preparation-notes">{(p.observations || "Sin observaciones registradas.").split("\n").filter(Boolean).map((line,i)=><p key={i}><Icon name={i===0 ? "chef":i===1 ? "serve":"users"}/>{line}</p>)}{p.preparationMinutes && <p><Icon name="clock"/>Tiempo estimado de preparación: {p.preparationMinutes} min.</p>}</div></section></div><section className="ops-detail-block"><h4>Galería de imágenes</h4><img className="ops-detail-photo" src={image} alt={p.name}/><div className="ops-product-thumbnails">{images.map((src,i)=><button key={src} aria-label={`Ver imagen ${i+1}`} aria-pressed={src===image} onClick={()=>setImage(src)}><img src={src} alt=""/></button>)}</div></section></div>}
        {tab === "Información comercial" && <dl className="ops-product-commercial"><dt>Sucursal</dt><dd>{p.branch || "Principal"}</dd><dt>Canales de venta</dt><dd>{(p.channels || ["Salón","Recojo","Delivery"]).join(", ") || "Ninguno seleccionado"}</dd><dt>Tiempo estimado</dt><dd>{p.preparationMinutes ? `${p.preparationMinutes} min`:"Sin registrar"}</dd><dt>En promoción</dt><dd>{p.promo ? "Sí":"No"}</dd></dl>}
        {tab === "Historial" && <p>{p.updatedAt ? `Última actualización: ${dateText(p.updatedAt)}`:"Este producto todavía no tiene actualizaciones registradas."}</p>}
      </section>
    </div>
    <footer className="ops-dialog-footer"><button onClick={onClose}>Cerrar</button><button className="ops-primary" onClick={onEdit}><Icon name="edit"/>Editar producto</button>{onDeactivate && p.active && <button className="ops-danger-outline" onClick={onDeactivate}><Icon name="trash"/>Desactivar</button>}</footer>
  </OperationsDialog>;
}

export function ProductDeactivate({products, onClose, onConfirm}: {products:MenuProduct[];onClose:()=>void;onConfirm:()=>void}) {
  return <OperationsDialog title="Desactivar producto" icon="trash" onClose={onClose} className="ops-confirm-dialog">
    <div className="ops-confirm-intro"><span><Icon name="trash"/></span><div><h3>¿Deseas desactivar {products.length===1 ? "este producto":"estos productos"}?</h3><p>Dejarán de estar disponibles para nuevos pedidos. Podrás activarlos nuevamente desde esta lista.</p></div></div>
    <div className="ops-confirm-products">{products.map(p=><div className="ops-confirm-product" key={p.id}><img src={p.image} alt=""/><section><h3>{p.name}</h3><p>{p.description}</p><dl>{[["SKU",productSku(p)],["Categoría",categories.find(c=>c.id===p.category)?.name || p.category],["Stock",`${p.stock ?? 0} unidades`]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}<div><dt>Estado</dt><dd><Badge value={p.active ? "Activo":"Inactivo"}/></dd></div></dl></section></div>)}</div>
    <div className="ops-confirm-note"><Icon name="shield"/><div><strong>Ten en cuenta que:</strong><ul><li>El producto dejará de estar disponible para nuevos pedidos.</li><li>Podrás reactivarlo. Los pedidos y cobros anteriores conservarán su información.</li></ul></div></div>
    <footer className="ops-dialog-footer"><button autoFocus onClick={onClose}>Cancelar</button><button className="ops-primary" onClick={onConfirm}><Icon name="trash"/>Desactivar {products.length===1 ? "producto":"productos"}</button></footer>
  </OperationsDialog>;
}
