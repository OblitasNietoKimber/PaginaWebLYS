import { useContext, useState } from "react";
import { createPortal } from "react-dom";
import { categories, normalize } from "../carta/catalog";
import { OperationsTable } from "./OperationsTable";
import { Badge, Empty, Stats } from "./OperationsUI";
import { Icon } from "./OperationsVisuals";
import { ProductDetails, ProductDeactivate } from "./ProductDetails";
import { productSku, categoryIcon } from "./productHelpers";
import { OperationsPageActions } from "./operationsPageContext";
import { ProductEditor } from "./ProductEditor";
import { downloadExcel } from "./operationsFiles";
import { useOperations, saveProduct, deleteProduct, money, type MenuProduct } from "./operationsStore";

const blankProduct=():MenuProduct=>({id:crypto.randomUUID(),name:"",description:"",category:"pollo",price:0,stock:0,active:true,image:"/images/logo.webp",size:"Personal",popular:0,isNew:false,promo:false});
export function ProductManager({notify}:{notify:(task:()=>void)=>void}) {
  const data=useOperations();
  const [editor,setEditor]=useState<MenuProduct|null>(null);
  const [detail,setDetail]=useState<MenuProduct|null>(null);
  const [confirm,setConfirm]=useState<MenuProduct[]>([]);
  const [selected,setSelected]=useState<string[]>([]);
  const [search,setSearch]=useState("");
  const [category,setCategory]=useState("Todas");
  const [availability,setAvailability]=useState("Todas");
  const [branch,setBranch]=useState("Todas");
  const [page,setPage]=useState(1);

  const [more,setMore]=useState<string|null>(null);
  const [mobileFilters,setMobileFilters]=useState(false);
  const actionHost=useContext(OperationsPageActions);
  const rows=data.products.filter(p=>(category==="Todas" || p.category===category) && (branch==="Todas" || (p.branch || "Principal")===branch) && (availability==="Todas" || (availability==="Activos" ? p.active:availability==="Inactivos" ? !p.active:(p.stock ?? 0)===0)) && normalize(`${p.name} ${productSku(p)}`).includes(normalize(search)));
  const maxPage=Math.max(1,Math.ceil(rows.length/7));
  const currentPage=Math.min(page,maxPage);
  const visible=rows.slice((currentPage-1)*7,currentPage*7);
  const updateFilters=(task:()=>void)=>{task();setPage(1);setSelected([]);};
  const create=<button className="ops-primary" onClick={()=>setEditor(blankProduct())}><Icon name="circle-plus"/>Nuevo producto</button>;
  const selectedProducts=data.products.filter(p=>selected.includes(p.id));
  return <div className="ops-product-manager">
    {actionHost ? createPortal(create,actionHost):create}
    <Stats entries={[{label:"Productos activos",value:data.products.filter(p=>p.active).length,icon:"box",hint:"Disponibles en el menú"},{label:"Sin stock",value:data.products.filter(p=>(p.stock ?? 0)===0).length,icon:"box",tone:"gold",hint:"Requieren reposición"},{label:"Categorías",value:categories.length,icon:"tag",tone:"blue",hint:"Total de categorías"},{label:"Promociones",value:data.products.filter(p=>p.promo).length,icon:"percent",tone:"green",hint:"Productos en promoción"}]}/>
    <section className="ops-product-filters" aria-label="Filtros de productos" data-expanded={mobileFilters}>
      <label className="ops-product-search"><span>Buscar producto</span><Icon name="search"/><input aria-label="Buscar producto" placeholder="Buscar por nombre o SKU" value={search} onChange={e=>updateFilters(()=>setSearch(e.target.value))}/></label>
      <label>Categoría<select aria-label="Categoría de productos" value={category} onChange={e=>updateFilters(()=>setCategory(e.target.value))}><option value="Todas">Todas las categorías</option>{categories.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
      <label>Disponibilidad<select aria-label="Disponibilidad" value={availability} onChange={e=>updateFilters(()=>setAvailability(e.target.value))}>{["Todas","Activos","Inactivos","Sin stock"].map(s=><option key={s}>{s}</option>)}</select></label>
      <label>Sucursal<select aria-label="Sucursal" value={branch} onChange={e=>updateFilters(()=>setBranch(e.target.value))}><option>Todas</option>{[...new Set(data.products.map(p=>p.branch || "Principal"))].map(s=><option key={s}>{s}</option>)}</select></label>
      <div className="ops-mobile-export-row"><span className="ops-mobile-only">{rows.length} productos</span><button onClick={()=>downloadExcel("productos",["Producto","SKU","Categoría","Precio","Stock","Estado"],rows.filter(p=>!selected.length || selected.includes(p.id)).map(p=>[p.name,productSku(p),categories.find(c=>c.id===p.category)?.name || p.category,p.price,p.stock ?? 0,p.active ? "Activo":"Inactivo"]))}><Icon name="download" data-ops-action="export"/>Exportar</button></div>
      <button className="ops-mobile-only ops-mobile-filter-toggle" aria-expanded={mobileFilters} onClick={()=>setMobileFilters(!mobileFilters)}><Icon name="filter"/>Filtros</button><button className="ops-primary" disabled={!search && category==="Todas" && availability==="Todas" && branch==="Todas"} onClick={()=>updateFilters(()=>{setSearch("");setCategory("Todas");setAvailability("Todas");setBranch("Todas");})}><Icon name="filter"/>Eliminar filtros</button>
    </section>
    <section className="ops-product-list" aria-label="Lista de productos">
      <div className="ops-product-bulk"><label><input type="checkbox" aria-label="Seleccionar productos de esta página" checked={visible.length>0 && visible.every(p=>selected.includes(p.id))} onChange={e=>setSelected(e.target.checked ? [...new Set([...selected,...visible.map(p=>p.id)])]:selected.filter(id=>!visible.some(p=>p.id===id)))}/>{selected.length} seleccionados</label><select aria-label="Cambiar estado de productos seleccionados" disabled={!selected.length} value="" onChange={e=>{if(e.target.value==="activate")notify(()=>{selectedProducts.forEach(p=>saveProduct({...p,active:true}));setSelected([]);});else if(e.target.value==="deactivate")setConfirm(selectedProducts);}}><option value="" disabled>Cambiar estado</option><option value="activate">Activar</option><option value="deactivate">Desactivar</option></select></div>
      {rows.length ? <div className="ops-table-wrap"><OperationsTable><thead><tr>{["Selección","Producto","SKU","Categoría","Precio","Stock","Estado","Actualizado","Acciones"].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{visible.map(p=><tr key={p.id}>
        <td><input type="checkbox" aria-label={`Seleccionar ${p.name}`} checked={selected.includes(p.id)} onChange={e=>setSelected(e.target.checked ? [...selected,p.id]:selected.filter(id=>id!==p.id))}/></td>
        <td><div className="ops-product-cell"><img src={p.image} alt=""/><div><strong>{p.name}</strong><small title={p.description}>{p.description}</small></div></div></td><td className="ops-sku">{productSku(p)}</td><td><span className="ops-category-label" data-category={p.category}><Icon name={categoryIcon(p.category)}/>{categories.find(c=>c.id===p.category)?.name || p.category}</span></td><td>{money(p.price)}</td><td>{p.stock ?? 0}</td><td><Badge value={p.active ? "Activo":"Inactivo"}/></td><td>{p.updatedAt ? <time dateTime={p.updatedAt}>{new Date(p.updatedAt).toLocaleDateString("es-PE")}<small>{new Date(p.updatedAt).toLocaleTimeString("es-PE",{hour:"2-digit",minute:"2-digit",hour12:false})}</small></time>:"Sin registrar"}</td>
        <td><div className="ops-actions ops-product-actions" onKeyDown={e=>{if(e.key==="Escape"){setMore(null);e.currentTarget.querySelector<HTMLButtonElement>("button[aria-expanded]")?.focus();}}}><button title={`Ver ${p.name}`} aria-label={`Ver ${p.name}`} onClick={()=>setDetail(p)}><Icon name="eye"/></button><button title={`Editar ${p.name}`} aria-label={`Editar ${p.name}`} onClick={()=>setEditor({...p})}><Icon name="edit"/></button><button title={`Desactivar ${p.name}`} aria-label={`Desactivar ${p.name}`} disabled={!p.active} onClick={()=>setConfirm([p])}><Icon name="trash"/></button><button aria-label={`Más acciones de ${p.name}`} aria-expanded={more===p.id} onClick={()=>setMore(more===p.id ? null:p.id)}><span aria-hidden="true">⋮</span></button>{more===p.id && <div className="ops-product-more"><button onClick={()=>{setDetail(p);setMore(null);}}>Ver información</button><button onClick={()=>{notify(()=>saveProduct({...p,active:!p.active}));setMore(null);}}>{p.active ? "Pausar disponibilidad":"Activar producto"}</button><button onClick={()=>setMore(null)}>Cerrar opciones</button></div>}</div></td>
      </tr>)}</tbody></OperationsTable></div>:<Empty>No se encontraron productos. Prueba con otros filtros.</Empty>}
    <div className="ops-reference-product-cards">{visible.map(p=><article key={p.id}>
      <div className="ops-product-mobile-summary"><img src={p.image} alt=""/><div><strong>{p.name}</strong><small>{productSku(p)}</small><span className="ops-category-label" data-category={p.category}><Icon name={categoryIcon(p.category)}/>{categories.find(c=>c.id===p.category)?.name}</span></div><div><Badge value={p.active ? "Activo":"Inactivo"}/><b>{money(p.price)}</b><small>Stock: {p.stock ?? 0}</small></div></div>
      <footer><button aria-label={`Ver ${p.name}`} onClick={()=>setDetail(p)}><Icon name="eye"/>Ver</button><button aria-label={`Editar ${p.name}`} onClick={()=>setEditor({...p})}><Icon name="edit"/>Editar</button><button aria-label={`Desactivar ${p.name}`} disabled={!p.active} onClick={()=>setConfirm([p])}><Icon name="trash"/>Desactivar</button></footer>
    </article>)}</div></section>
    <div className="ops-pagination"><span>Mostrando {rows.length ? (currentPage-1)*7+1:0} a {Math.min(currentPage*7,rows.length)} de {rows.length} productos</span><button disabled={currentPage===1} onClick={()=>setPage(currentPage-1)} aria-label="Página anterior"><Icon name="chevron"/></button><span aria-current="page">{currentPage}</span><button disabled={currentPage===maxPage} onClick={()=>setPage(currentPage+1)} aria-label="Página siguiente"><Icon name="chevron"/></button></div>
    {editor && <ProductEditor initial={editor} exists={data.products.some(p=>p.id===editor.id)} onClose={()=>setEditor(null)} notify={notify}/>}
    {detail && <ProductDetails product={detail} onClose={()=>setDetail(null)} onEdit={()=>{setEditor({...detail});setDetail(null);}} onDeactivate={()=>{setConfirm([detail]);setDetail(null);}}/>}
    {confirm.length>0 && <ProductDeactivate products={confirm} onClose={()=>setConfirm([])} onConfirm={()=>notify(()=>{confirm.forEach(p=>deleteProduct(p.id));setConfirm([]);setSelected([]);})}/>}
  </div>;
}
