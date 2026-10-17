import { useState } from "react";
import { categories } from "../carta/catalog";
import { OperationsDialog } from "./OperationsDialog";
import { ProductDetails } from "./ProductDetails";
import { Icon } from "./OperationsVisuals";
import { readUpload } from "./imageUpload";
import { saveProduct, type MenuProduct } from "./operationsStore";
import { dateText } from "./operationsFiles";
import { productSku } from "./productHelpers";

export function ProductEditor({initial,exists,notify,onClose}: {initial:MenuProduct;exists:boolean;notify:(task:()=>void)=>void;onClose:()=>void}) {
  const [product,setProduct]=useState<MenuProduct>({...initial,sku:productSku(initial),ingredients:[...(initial.ingredients || [])],channels:initial.channels || ["Salón","Recojo","Delivery"]});
  const [error,setError]=useState("");
  const [preview,setPreview]=useState(false);
  const patch=(value:Partial<MenuProduct>)=>setProduct(p=>({...p,...value}));
  const images=[...new Set([product.image,...(product.gallery || [])])];
  return <><OperationsDialog title={exists ? "Editar producto":"Nuevo producto"} icon="box" onClose={onClose} className="ops-product-dialog ops-product-edit-dialog">
    <form className="ops-product-form" onSubmit={e=>{e.preventDefault();notify(()=>{saveProduct(product);onClose();});}}>
      <div className="ops-product-editor-layout">
        <section className="ops-product-media"><h3>Imágenes del producto</h3><p>Imagen principal y galería de fotos</p>
          <img className="ops-editor-photo" src={product.image} alt="Vista previa del producto"/>
          <div className="ops-product-thumbnails">{images.map((src,i)=><button key={src} type="button" aria-label={`Usar imagen ${i+1} como principal`} aria-pressed={src===product.image} onClick={()=>patch({image:src,gallery:images.filter(s=>s!==src)})}><img src={src} alt=""/></button>)}</div>
          <div className="ops-product-upload-row"><label className="ops-product-upload"><Icon name="grid"/><span>Cambiar imagen<span className="ops-upload-instruction">Arrastra una imagen aquí o haz clic para seleccionar</span><small>JPG, PNG o WebP · Máx. 5 MB</small></span><input aria-label="Imagen del producto" type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const file=e.target.files?.[0];if(file) void readUpload(file).then(image=>{setProduct(p=>({...p,image,gallery:[...new Set([...(p.gallery || []),p.image])].filter(s=>s!=="/images/logo.webp")}));setError("");}).catch(err=>setError(err.message));}}/></label><button type="button" className="ops-image-remove" disabled={product.image==="/images/logo.webp"} onClick={()=>{const remaining=images.filter(src=>src!==product.image);patch({image:remaining[0] || "/images/logo.webp",gallery:remaining.slice(1)});}}><Icon name="trash"/>Eliminar</button></div>
          {error && <p role="alert">{error}</p>}
          <section className="ops-product-publication"><h3>Estado y publicación</h3><p>Controla la visibilidad del producto</p><div className="ops-product-status-control"><button type="button" className={`ops-switch ${product.active ? "on":""}`} role="switch" aria-label="Producto disponible" aria-checked={Boolean(product.active)} onClick={()=>patch({active:!product.active})}/><div><strong>{product.active ? "Activo":"Inactivo"}</strong><small>{product.active ? "El producto está disponible en el sistema":"El producto no está disponible"}</small></div></div><h4>Canales de venta</h4><p>Selecciona los canales de venta del producto</p><div className="ops-product-channels">{["Salón","Recojo","Delivery"].map(channel=><label className="ops-check" key={channel}><input type="checkbox" checked={product.channels?.includes(channel)} onChange={e=>patch({channels:e.target.checked ? [...(product.channels || []),channel]:(product.channels || []).filter(c=>c!==channel)})}/>{channel}</label>)}</div></section>
        </section>
        <div className="ops-product-fields">
          <div className="ops-field-grid"><label><span>Nombre del producto <b className="ops-required" aria-hidden="true">*</b></span><input aria-label="Nombre del producto" required value={product.name} onChange={e=>patch({name:e.target.value})}/></label><label><span>Categoría <b className="ops-required" aria-hidden="true">*</b></span><select aria-label="Categoría" value={product.category} onChange={e=>patch({category:e.target.value})}>{categories.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label></div>
          <div className="ops-field-grid three"><label><span>Precio (S/) <b className="ops-required" aria-hidden="true">*</b></span><span className="ops-input-affix"><span aria-hidden="true">S/</span><input aria-label="Precio (S/)" type="number" required min="0.01" step="0.01" value={product.price} onChange={e=>patch({price:Number(e.target.value)})}/></span></label><label><span>Stock <b className="ops-required" aria-hidden="true">*</b></span><input aria-label="Stock" type="number" required min="0" step="1" value={product.stock ?? 0} onChange={e=>patch({stock:Number(e.target.value)})}/></label><label>SKU<input value={product.sku || ""} placeholder="Código interno" onChange={e=>patch({sku:e.target.value})}/></label></div>
          <div className="ops-field-grid"><label>Sucursal<input value={product.branch || "Principal"} onChange={e=>patch({branch:e.target.value})}/></label><label>Tiempo estimado (min)<span className="ops-input-affix"><span aria-hidden="true"><Icon name="clock"/></span><input aria-label="Tiempo estimado (min)" type="number" min="1" step="1" value={product.preparationMinutes ?? ""} onChange={e=>patch({preparationMinutes:e.target.value ? Number(e.target.value):undefined})}/></span></label></div>
          <label>Descripción<textarea rows={3} value={product.description} onChange={e=>patch({description:e.target.value})}/></label>
          <section className="ops-ingredient-editor"><h3>Ingredientes y acompañamientos</h3><p>Agrega lo que incluye este producto</p>{product.ingredients?.map((ingredient,i)=><div key={i}><span className="ops-ingredient-grip" aria-hidden="true">⠿</span><input aria-label={`Ingrediente ${i+1}`} value={ingredient} required onChange={e=>patch({ingredients:product.ingredients?.map((s,index)=>index===i ? e.target.value:s)})}/><button type="button" aria-label={`Eliminar ingrediente ${i+1}`} onClick={()=>patch({ingredients:product.ingredients?.filter((_,index)=>i!==index)})}><Icon name="trash"/></button></div>)}<button type="button" onClick={()=>patch({ingredients:[...(product.ingredients || []),""]})}><Icon name="plus"/>Agregar ingrediente</button></section>
          <label>Observaciones<small>Información adicional de preparación, presentación, etc.</small><textarea aria-label="Observaciones" rows={3} value={product.observations || ""} onChange={e=>patch({observations:e.target.value})}/></label>
        </div>
      </div>
      <footer className="ops-dialog-footer">{initial.updatedAt && <span className="ops-edit-timestamp"><Icon name="clock"/>Última edición: {dateText(initial.updatedAt)}</span>}<button type="button" onClick={onClose}>Cancelar</button><button type="button" onClick={()=>setPreview(true)}><Icon name="eye"/>Vista previa</button><button className="ops-primary"><Icon name="save"/>{exists ? "Guardar cambios":"Guardar producto"}</button></footer>
    </form>
  </OperationsDialog>{preview && <ProductDetails product={product} onClose={()=>setPreview(false)} onEdit={()=>setPreview(false)}/>}</>;
}
