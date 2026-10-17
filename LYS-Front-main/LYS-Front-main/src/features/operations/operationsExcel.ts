import ExcelJS from "exceljs";

export type ExportCell = string | number | boolean | Date;
const red = "FFCF001B";
const ink = "FF19202B";
const gray = "FFF2F4F7";
const currency = '"S/" #,##0.00;[Red]("S/" #,##0.00)';
const titles: Record<string, string> = { productos: "Inventario de productos", promociones: "Promociones", clientes: "Clientes", usuarios: "Usuarios", pedidos: "Pedidos", reporte: "Reporte de ventas", inventario: "Inventario de insumos", proveedores: "Proveedores", pagos: "Historial de pagos", comprobantes: "Comprobantes", "historial-cocina": "Historial de cocina", "resumen-caja": "Resumen de caja" };
const moneyColumn = (header: string) => /precio|costo|monto|importe|ingreso|gasto|^total$|valor stock|vuelto/i.test(header);
const excelDate = (date: Date) => new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));

function typed(value: ExportCell, header: string): ExportCell {
  if (value instanceof Date) return excelDate(value);
  if (typeof value !== "string") return value;
  if (/fecha|actualizado|recibido|^listo$/i.test(header) && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value))) return excelDate(new Date(value));
  if (moneyColumn(header) && /^S\/\s*-?\d+(\.\d+)?$/.test(value)) return Number(value.replace(/^S\/\s*/, ""));
  if (/^fecha$|^actualizado$/i.test(header)) {
    const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4}),?\s*(?:(\d{1,2}):(\d{2})\s*([ap])\.?.*m\.?)?$/i);
    if (match) {
      let hour = Number(match[4] || 0);
      if (match[6]) hour = hour % 12 + (match[6].toLowerCase() === "p" ? 12 : 0);
      return new Date(Date.UTC(Number(match[3]) < 100 ? 2000 + Number(match[3]) : Number(match[3]), Number(match[2]) - 1, Number(match[1]), hour, Number(match[5] || 0)));
    }
  }
  return value;
}

async function logoData() {
  const image = new Image(); image.src = "/images/logo.webp"; await image.decode();
  const canvas = document.createElement("canvas"); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
  canvas.getContext("2d")!.drawImage(image, 0, 0);
  return canvas.toDataURL("image/png");
}

function decorate(sheet: ExcelJS.Worksheet, title: string, columns: number, workbook: ExcelJS.Workbook, imageId: number) {
  sheet.views = [{ state: "frozen", xSplit: 2, ySplit: 8, topLeftCell: "C9", showGridLines: false }];
  sheet.properties.defaultRowHeight = 22;
  sheet.properties.tabColor = { argb: red };
  sheet.pageSetup = { orientation: "landscape", paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: "1:8", margins: { left: .25, right: .25, top: .4, bottom: .4, header: .15, footer: .15 } };
  sheet.headerFooter.oddFooter = "&LLeñas y Sabores&RPágina &P de &N";
  sheet.addImage(imageId, { tl: { col: .1, row: 1.05 }, br: { col: 1.9, row: 2.95 }, editAs: "oneCell" } as ExcelJS.ImageRange & { editAs: string });
  sheet.mergeCells(2, 3, 3, columns);
  sheet.getCell(2, 3).value = title.toUpperCase();
  sheet.getCell(2, 3).font = { name: "Aptos Display", size: 22, bold: true, color: { argb: ink } };
  sheet.getCell(2, 3).alignment = { vertical: "middle", horizontal: "left", wrapText: true };
  sheet.getRow(2).height = 28; sheet.getRow(3).height = 23;
  sheet.mergeCells(4, 1, 4, columns);
  const band = sheet.getCell(4, 1);
  band.value = `  EXPORTACIÓN · ${new Date().toLocaleDateString("es-PE")} · ${title.toUpperCase()}`;
  band.fill = { type: "pattern", pattern: "solid", fgColor: { argb: red } };
  band.font = { name: "Aptos", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
  band.alignment = { vertical: "middle" }; sheet.getRow(4).height = 25;
  workbook.calcProperties.fullCalcOnLoad = true;
}

export async function createOperationsWorkbook(name: string, headers: string[], source: ExportCell[][]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Leñas y Sabores"; workbook.created = new Date();
  const title = titles[name] || name;
  const product = name === "productos";
  const columns = ["N.º", ...headers, ...(product ? ["Valor stock (S/)"] : [])];
  const width = Math.max(8, columns.length);
  const sheet = workbook.addWorksheet((name === "productos" ? "Productos" : title).slice(0, 31));
  const imageId = workbook.addImage({ base64: await logoData(), extension: "png" });
  const rows = source.map((row, i) => {
    const values: ExcelJS.CellValue[] = [i + 1, ...row.map((value, c) => typed(value, headers[c]))];
    if (product) {
      const price = headers.indexOf("Precio") + 2; const stock = headers.indexOf("Stock") + 2;
      values.push({ formula: `${sheet.getColumn(price).letter}${i + 9}*${sheet.getColumn(stock).letter}${i + 9}`, result: Number(row[price - 2]) * Number(row[stock - 2]) });
    }
    return values;
  });
  const numeric = columns.map((header, c) => c > 0 && (rows.some(row => typeof row[c] === "number") || (product && c === columns.length - 1)) && !/teléfono|documento|ruc|sku/i.test(header));
  sheet.addTable({ name: "DatosExportados", ref: "A8", headerRow: true, totalsRow: true,
    style: { theme: "TableStyleMedium2", showRowStripes: false },
    columns: columns.map((header, c) => ({ name: header, filterButton: true, ...(c === 1 ? { totalsRowLabel: "Totales visibles" } : numeric[c] ? /^precio/i.test(header) ? { totalsRowFunction: "custom" as const, totalsRowFormula: `IF(SUBTOTAL(102,${sheet.getColumn(c + 1).letter}9:${sheet.getColumn(c + 1).letter}${8 + Math.max(1, rows.length)})=0,0,SUBTOTAL(101,${sheet.getColumn(c + 1).letter}9:${sheet.getColumn(c + 1).letter}${8 + Math.max(1, rows.length)}))` } : { totalsRowFunction: "sum" as const } : {}) })),
    rows: rows.length ? rows : [columns.map(() => null)],
  });
  for (let c = 1; c <= width; c++) {
    const header = columns[c - 1] || "";
    sheet.getColumn(c).width = c === 1 ? 8 : Math.min(42, Math.max(16, header.length + 4, ...source.slice(0, 150).map(row => String(row[c - 2] ?? "").length + 2)));
    if (/producto|promoción|insumo|nombre|cliente|concepto/i.test(header)) sheet.getColumn(c).width = 32;
    if (/sku/i.test(header)) sheet.getColumn(c).width = 20;
  }
  const lastData = 8 + Math.max(1, rows.length);
  sheet.eachRow(row => row.eachCell(cell => {
    if (row.number < 8) return;
    const c = Number(cell.col); const header = columns[c - 1] || "";
    cell.font = { name: /sku/i.test(header) ? "Consolas" : "Aptos", size: 10.5, bold: c === 2, color: { argb: "FF17212F" } };
    cell.alignment = { vertical: "middle", horizontal: typeof cell.value === "number" || cell.type === ExcelJS.ValueType.Formula ? "right" : "left", wrapText: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: row.number > 8 && row.number % 2 === 0 ? "FFF8F9FB" : "FFFFFFFF" } };
    cell.border = { bottom: { style: "hair", color: { argb: "FFE5E9EF" } } };
    if (moneyColumn(header)) cell.numFmt = currency;
    else if (cell.value instanceof Date) cell.numFmt = "dd/mm/yyyy hh:mm";
    else if (numeric[c - 1]) cell.numFmt = "#,##0.##;[Red](#,##0.##)";
  }));
  sheet.getRow(8).eachCell(cell => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: red } };
    cell.font = { name: "Aptos Display", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  }); sheet.getRow(8).height = 30;
  for (let r = 9; r <= lastData; r++) sheet.getRow(r).height = Math.max(26, ...source[r - 9]?.map((value, c) => Math.ceil(String(value).length / (sheet.getColumn(c + 2).width! - 2)) * 15 + 8) || [26]);
  const totals = sheet.getRow(lastData + 1); totals.height = 28;
  totals.eachCell(cell => { cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ink } }; cell.font = { name: "Aptos", size: 10, bold: true, color: { argb: "FFFFFFFF" } }; });
  const metrics: { label: string; formula?: string; value: number; format?: string }[] = [{ label: "REGISTROS VISIBLES", formula: `SUBTOTAL(103,B9:B${lastData})`, value: rows.length }];
  if (product) {
    metrics.push({ label: "UNIDADES VISIBLES", formula: `SUBTOTAL(109,F9:F${lastData})`, value: source.reduce((sum, row) => sum + Number(row[4]), 0) });
    metrics.push({ label: "VALOR DEL STOCK", formula: `SUBTOTAL(109,H9:H${lastData})`, value: source.reduce((sum, row) => sum + Number(row[3]) * Number(row[4]), 0), format: currency });
    metrics.push({ label: "CATEGORÍAS EXPORTADAS", value: new Set(source.map(row => row[2])).size });
  } else {
    columns.forEach((header, c) => {
      if (numeric[c] && metrics.length < 4) metrics.push({ label: `${/^precio/i.test(header) ? "PROMEDIO" : "TOTAL"} ${header.toUpperCase()}`, formula: `SUBTOTAL(${/^precio/i.test(header) ? 101 : 109},${sheet.getColumn(c + 1).letter}9:${sheet.getColumn(c + 1).letter}${lastData})`, value: source.reduce((sum, row) => sum + Number(typed(row[c - 1], header)), 0) / (/^precio/i.test(header) ? source.length || 1 : 1), format: moneyColumn(header) ? currency : undefined });
    });
  }
  metrics.forEach((metric, i) => {
    const col = i * 2 + 1; sheet.mergeCells(6, col, 6, col + 1);
    const cell = sheet.getCell(6, col); cell.value = metric.formula ? { formula: metric.formula, result: metric.value } : metric.value;
    cell.numFmt = `"${metric.label}: ${metric.format ? 'S/ ' : ''}"${metric.format ? '#,##0.00' : '#,##0.##'}`;
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: gray } }; cell.font = { name: "Aptos", size: 11, bold: true, color: { argb: ink } }; cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  }); sheet.getRow(6).height = 34;
  sheet.mergeCells(lastData + 3, 1, lastData + 3, width); const hint = sheet.getCell(lastData + 3, 1);
  hint.value = rows.length ? "Usa las flechas del encabezado para filtrar y ordenar. Los indicadores y totales se actualizan con las filas visibles." : "No hay registros que coincidan con los filtros de la aplicación.";
  hint.font = { name: "Aptos", size: 10, italic: true, color: { argb: "FF637084" } }; hint.alignment = { wrapText: true }; sheet.getRow(lastData + 3).height = 30;
  decorate(sheet, title, width, workbook, imageId);
  const stateColumn = columns.findIndex(header => /^estado$/i.test(header)) + 1;
  if (stateColumn && rows.length) {
    const letter = sheet.getColumn(stateColumn).letter;
    for (const [status, foreground, background] of [["Activo", "FF007B45", "FFE2F5E9"], ["Activa", "FF007B45", "FFE2F5E9"], ["Pagado", "FF007B45", "FFE2F5E9"], ["Emitido", "FF007B45", "FFE2F5E9"], ["Entregado", "FF007B45", "FFE2F5E9"], ["Cancelado", "FFCF001B", "FFFFE8EC"], ["Stock bajo", "FFCF001B", "FFFFE8EC"], ["Inactivo", "FF637084", "FFF2F4F7"], ["Inactiva", "FF637084", "FFF2F4F7"]]) {
      sheet.addConditionalFormatting({ ref: `${letter}9:${letter}${lastData}`, rules: [{ type: "cellIs", operator: "equal", formulae: [`"${status}"`], priority: 1, style: { font: { bold: true, color: { argb: foreground } }, fill: { type: "pattern", pattern: "solid", fgColor: { argb: background } } } }] });
    }
  }
  if (product) {
    const summary = workbook.addWorksheet("Resumen");
    for (let c = 1; c <= 8; c++) summary.getColumn(c).width = c === 1 ? 32 : 19;
    decorate(summary, "Resumen del catálogo", 8, workbook, imageId);
    summary.views = [{ showGridLines: false }];
    const categories = [...new Set(source.map(row => String(row[2])))];
    summary.addTable({ name: "ResumenCategorias", ref: "A8", headerRow: true, totalsRow: true, style: { theme: "TableStyleMedium2", showRowStripes: true }, columns: [{ name: "Categoría", totalsRowLabel: "Total exportado" }, { name: "Productos", totalsRowFunction: "sum" }, { name: "Unidades", totalsRowFunction: "sum" }, { name: "Valor stock (S/)", totalsRowFunction: "sum" }], rows: categories.length ? categories.map((category, i) => {
      const matches = source.filter(row => row[2] === category);
      return [category, { formula: `COUNTIF(Productos!D9:D${lastData},A${i + 9})`, result: matches.length }, { formula: `SUMIF(Productos!D9:D${lastData},A${i + 9},Productos!F9:F${lastData})`, result: matches.reduce((sum, row) => sum + Number(row[4]), 0) }, { formula: `SUMIF(Productos!D9:D${lastData},A${i + 9},Productos!H9:H${lastData})`, result: matches.reduce((sum, row) => sum + Number(row[3]) * Number(row[4]), 0) }];
    }) : [[null, null, null, null]] });
    summary.getColumn(4).numFmt = currency;
    summary.eachRow(row => row.eachCell(cell => { if (row.number >= 8) { cell.font = { name: "Aptos", size: 11, bold: row.number === 8 }; cell.alignment = { vertical: "middle", wrapText: true }; row.height = 28; } }));
    summary.getRow(8).eachCell(cell => { cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: red } }; cell.font = { name: "Aptos", size: 10, bold: true, color: { argb: "FFFFFFFF" } }; });
    summary.getCell("A6").value = "Resumen de los registros exportados. Los filtros de Productos no cambian este resumen por categoría.";
    summary.mergeCells("A6:H6"); summary.getCell("A6").alignment = { wrapText: true }; summary.getRow(6).height = 32;
  }
  return workbook;
}

export async function saveOperationsExcel(name: string, headers: string[], rows: ExportCell[][]) {
  const workbook = await createOperationsWorkbook(name, headers, rows);
  const buffer = await workbook.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
  const link = document.createElement("a"); link.href = url; link.download = `${name}.xlsx`; link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
