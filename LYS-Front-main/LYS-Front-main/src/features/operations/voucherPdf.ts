import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import type { OperationsState, Voucher } from "./operationsStore";

const red = "#d60020";
const amount = (value: number) => `S/ ${value.toFixed(2)}`;
const clean = (text: string) => [...text].map(character => character !== "\n" && (character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127) ? " " : character).join("");

async function logoImage(monochrome: boolean) {
  const image = new Image();
  image.src = "/images/logo.webp";
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d")!;
  context.drawImage(image, 0, 0);
  if (monochrome) {
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < pixels.data.length; i += 4) {
      const color = (pixels.data[i] + pixels.data[i + 1] + pixels.data[i + 2]) / 3 > 230 ? 255 : 0;
      pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = color;
    }
    context.putImageData(pixels, 0, 0);
  }
  return { data: canvas.toDataURL("image/png"), ratio: canvas.width / canvas.height };
}

export async function createVoucherPdf(voucher: Voucher, state: OperationsState) {
  const order = state.orders.find(item => item.id === voucher.orderId);
  if (!order) throw new Error("No se encontró el detalle del pedido del comprobante.");
  const invoice = voucher.type === "Factura";
  const settings = state.settings;
  const payments = state.payments.filter(payment => payment.orderId === order.id && !payment.refunded);
  const cashier = state.shifts.find(shift => shift.id === payments[0]?.shiftId)?.user || "Sin registrar";
  const methods = [...new Set(payments.map(payment => payment.method))].join(" / ") || order.method || "Sin registrar";
  const received = payments.reduce((sum, payment) => sum + payment.received, 0);
  const change = payments.reduce((sum, payment) => sum + payment.change, 0);
  const subtotal = order.items.reduce((sum, line) => sum + line.count * line.product.price, 0);
  const date = new Date(voucher.date);
  const logo = await logoImage(!invoice);
  const qr = await QRCode.toDataURL(JSON.stringify({ comprobante: voucher.id, pedido: order.id, total: voucher.total, fecha: voucher.date, origen: "Comprobante local sin valor tributario" }), { margin: 1, width: 240, errorCorrectionLevel: "M" });
  const barcode = document.createElement("canvas");
  JsBarcode(barcode, voucher.id.replace(/[^\x20-\x7e]/g, ""), { format: "CODE128", displayValue: false, margin: 0, height: 45, width: 2 });
  const title = invoice ? "FACTURA ELECTRÓNICA" : voucher.type === "Boleta" ? "BOLETA DE VENTA ELECTRÓNICA" : "NOTA DE VENTA";
  const doc = new jsPDF({ unit: "mm", format: invoice ? "a4" : [80, 297], compress: true });
  doc.setProperties({ title: `${voucher.type} ${voucher.id}`, subject: "Comprobante local sin valor tributario", author: settings.name });
  const font = (size = 9, bold = false) => { doc.setFont("courier", bold ? "bold" : "normal"); doc.setFontSize(size); doc.setTextColor("#111111"); };
  const text = (value: string, x: number, y: number, width: number, size = 9, bold = false) => {
    font(size, bold);
    const lines = doc.splitTextToSize(clean(value), width) as string[];
    doc.text(lines, x, y);
    return lines.length * size * .42;
  };
  const right = (value: string, x: number, y: number, size = 9, bold = false) => { font(size, bold); doc.text(value, x, y, { align: "right" }); };
  if (!invoice) {
    // Measure the content before choosing the thermal roll length.
    font(7);
    const measureLine = (value: string) => (doc.splitTextToSize(clean(value), 70) as string[]).length * 7 * .42 + 1;
    const itemHeight = order.items.reduce((height, line) => height + Math.max(3.4, (doc.splitTextToSize(clean(line.product.name), 29) as string[]).length * 7 * .42) + 2, 0);
    const metadata = [`RUC: ${settings.ruc || "No configurado"}`, `Dirección: ${settings.address}`, `Tel: ${settings.phone}`, `Fecha: ${date.toLocaleDateString("es-PE")}  Hora: ${date.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}`, `Cajera: ${cashier}`, `Cliente: ${voucher.customer}`, ...(voucher.document ? [`Doc: ${voucher.document}`] : []), `Pedido: ${order.id}`];
    const paymentLines = [`Método de pago: ${methods}`, `Recibido: ${amount(received)}`, `Vuelto: ${amount(change)}`];
    const metaHeight = [...metadata, ...paymentLines].reduce((height, value) => height + measureLine(value), 0);
    const height = Math.max(190, 139 + 62 / logo.ratio + itemHeight + metaHeight);
    if (height > 4500) throw new Error("El comprobante supera la longitud máxima del ticket PDF.");
    doc.deletePage(1);
    doc.addPage([80, height], "portrait");
    const width = 70;
    let y = 6;
    doc.addImage(logo.data, "PNG", 9, y, 62, 62 / logo.ratio); y += 62 / logo.ratio + 7;
    font(8, true); doc.text(title, 40, y, { align: "center" }); y += 5;
    font(11, true); doc.text(voucher.id, 40, y, { align: "center" }); y += 7;
    const line = (value: string, bold = false) => { y += text(value, 5, y, width, 7, bold) + 1; };
    line(`RUC: ${settings.ruc || "No configurado"}`);
    line(`Dirección: ${settings.address}`); line(`Tel: ${settings.phone}`); y += 3;
    line(`Fecha: ${date.toLocaleDateString("es-PE")}  Hora: ${date.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}`);
    line(`Cajera: ${cashier}`); line(`Cliente: ${voucher.customer}`);
    if (voucher.document) line(`Doc: ${voucher.document}`);
    line(`Pedido: ${order.id}`);
    const rule = () => { doc.setDrawColor("#333333"); doc.setLineDashPattern([1, .7], 0); doc.line(5, y, 75, y); doc.setLineDashPattern([], 0); y += 5; };
    rule(); font(6.5, true); doc.text("Cant  Descripción", 5, y); right("P.Unit", 60, y, 6.5, true); right("Importe", 75, y, 6.5, true); y += 3; rule();
    for (const item of order.items) {
      const row = text(item.product.name, 13, y, 29, 7);
      font(7); doc.text(String(item.count), 5, y); right(item.product.price.toFixed(2), 60, y, 7); right((item.product.price * item.count).toFixed(2), 75, y, 7);
      y += Math.max(3.4, row) + 2;
    }
    rule();
    for (const [label, value] of [["SUBTOTAL", subtotal], ["DESCUENTO", order.discount], ["ENVÍO", order.shipping]] as const) { font(8); doc.text(label, 5, y); right(amount(value), 75, y, 8); y += 5; }
    font(11, true); doc.text("TOTAL", 5, y); right(amount(voucher.total), 75, y, 11, true); y += 5; rule();
    line(`Método de pago: ${methods}`); line(`Recibido: ${amount(received)}`); line(`Vuelto: ${amount(change)}`); y += 1; rule();
    doc.addImage(qr, "PNG", 29, y, 22, 22); y += 27;
    font(6.5); doc.text("Representación del comprobante local", 40, y, { align: "center" }); y += 4;
    doc.text("Sin valor tributario", 40, y, { align: "center" }); y += 5;
    doc.text("Gracias por su compra", 40, y, { align: "center" }); y += 5;
    doc.addImage(barcode.toDataURL("image/png"), "PNG", 12, y, 56, 9); y += 13;
    font(7); doc.text(voucher.id, 40, y, { align: "center" });
  } else {
    const margin = 12;
    doc.addImage(logo.data, "PNG", margin, 12, 78, 78 / logo.ratio);
    text(settings.name.toUpperCase(), margin, 42, 98, 11, true);
    let companyY = 49;
    for (const value of [`RUC: ${settings.ruc || "No configurado"}`, settings.address, `Tel.: ${settings.phone}`, settings.email]) companyY += text(value, margin, companyY, 98, 8) + 1;
    doc.setDrawColor(red); doc.setLineWidth(.6); doc.roundedRect(118, 12, 80, 53, 2, 2);
    font(11, true); doc.text(title, 158, 21, { align: "center" });
    font(9, true); doc.text(`RUC: ${settings.ruc || "No configurado"}`, 158, 29, { align: "center" });
    font(15, true); doc.setTextColor(red); doc.text(voucher.id, 158, 39, { align: "center" });
    text(`Fecha: ${date.toLocaleDateString("es-PE")}\nHora: ${date.toLocaleTimeString("es-PE")}\nMoneda: SOLES (PEN)`, 122, 48, 72, 8);
    let y = Math.max(75, companyY + 8);
    const clientLines = [`Razón social: ${voucher.customer}`, `RUC: ${voucher.document}`, ...(order.address ? [`Dirección: ${order.address}`] : []), ...(order.email ? [`Correo: ${order.email}`] : [])];
    const operationLines = [`Operación: Venta interna`, `Método de pago: ${methods}`, `Pedido: ${order.id}`, `Canal: ${order.channel}${order.table ? ` - Mesa ${order.table}` : ""}`, `Cajera: ${cashier}`];
    font(8);
    const boxHeight = Math.max(...[clientLines, operationLines].map(lines => lines.reduce((h, value) => h + (doc.splitTextToSize(clean(value), 83) as string[]).length * 3.4 + 2, 15)));
    const box = (x: number, heading: string, lines: string[]) => {
      doc.setDrawColor("#dce1e8"); doc.setLineWidth(.2); doc.roundedRect(x, y, 91, boxHeight, 1, 1);
      doc.setFillColor(red); doc.rect(x, y, 91, 8, "F"); font(10, true); doc.setTextColor("#ffffff"); doc.text(heading, x + 3, y + 5.5);
      let cursor = y + 14; for (const value of lines) cursor += text(value, x + 3, cursor, 83, 8) + 2;
    };
    box(12, "DATOS DEL CLIENTE", clientLines); box(107, "DATOS DE LA OPERACIÓN", operationLines); y += boxHeight + 9;
    const header = () => {
      doc.setFillColor(red); doc.rect(12, y, 186, 8, "F"); font(8, true); doc.setTextColor("#ffffff");
      doc.text("#", 15, y + 5.5); doc.text("DESCRIPCIÓN", 24, y + 5.5); doc.text("CANT.", 116, y + 5.5); doc.text("P.UNIT.", 139, y + 5.5); doc.text("IMPORTE", 176, y + 5.5); y += 8;
    };
    header();
    order.items.forEach((item, index) => {
      font(8); const lines = doc.splitTextToSize(clean(item.product.name), 87) as string[];
      const rowHeight = Math.max(9, lines.length * 3.4 + 5);
      if (y + rowHeight > 265) { doc.addPage(); y = 16; header(); }
      if (index % 2 === 0) { doc.setFillColor("#f5f6f8"); doc.rect(12, y, 186, rowHeight, "F"); }
      font(8); doc.text(String(index + 1), 15, y + 6); doc.text(lines, 24, y + 6); right(String(item.count), 126, y + 6, 8); right(item.product.price.toFixed(2), 159, y + 6, 8); right((item.product.price * item.count).toFixed(2), 194, y + 6, 8); y += rowHeight;
    });
    if (y + 92 > 278) { doc.addPage(); y = 18; } else y += 8;
    const note = order.notes ? `Observación: ${order.notes}` : "Gracias por su compra.";
    const noteHeight = text(note, 15, y + 7, 86, 8);
    let totalY = y + 6;
    for (const [label, value] of [["SUBTOTAL", subtotal], ["DESCUENTO", order.discount], ["ENVÍO", order.shipping]] as const) { text(label, 115, totalY, 45, 9); right(amount(value), 194, totalY, 9); totalY += 7; }
    doc.setFillColor(red); doc.roundedRect(110, totalY, 88, 11, 1, 1, "F"); font(12, true); doc.setTextColor("#ffffff"); doc.text("TOTAL", 114, totalY + 7.5); doc.text(amount(voucher.total), 194, totalY + 7.5, { align: "right" });
    y = Math.max(totalY + 19, y + noteHeight + 14);
    doc.addImage(qr, "PNG", 12, y, 27, 27);
    text("Representación del comprobante local.\nSin valor tributario.\nGracias por su compra.", 43, y + 5, 64, 8);
    doc.addImage(barcode.toDataURL("image/png"), "PNG", 119, y + 3, 74, 13); font(8); doc.text(voucher.id, 156, y + 22, { align: "center" });
    for (let page = 1; page <= doc.getNumberOfPages(); page++) { doc.setPage(page); font(7); doc.setTextColor("#666666"); doc.text(`${settings.name} | ${page}/${doc.getNumberOfPages()}`, 105, 287, { align: "center" }); }
  }
  return doc;
}

export async function downloadVoucherPdf(voucher: Voucher, state: OperationsState) {
  const doc = await createVoucherPdf(voucher, state);
  doc.save(`${voucher.type.toLowerCase().replaceAll(" ", "-")}-${voucher.id}.pdf`);
}

export async function previewVoucherPdf(voucher: Voucher, state: OperationsState, popup: Window) {
  const doc = await createVoucherPdf(voucher, state);
  const url = URL.createObjectURL(doc.output("blob"));
  if (popup.closed) { URL.revokeObjectURL(url); return; }
  popup.location.replace(url);
  const cleanup = window.setInterval(() => {
    if (popup.closed) { URL.revokeObjectURL(url); window.clearInterval(cleanup); }
  }, 1000);
}
