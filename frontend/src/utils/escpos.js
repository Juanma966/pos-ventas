// Genera los bytes ESC/POS de un ticket para impresoras térmicas (80mm).
// El navegador no puede mandar esto al USB: se envía al print-agent local
// (ver services/printService.js y la carpeta print-agent/).
import formatCurrency from './formatCurrency';

const ESC = 0x1b;
const GS = 0x1d;
const WIDTH = 48; // caracteres por línea en 80mm, fuente A

const PAYMENT_LABELS = { EFECTIVO: 'Efectivo', TARJETA: 'Tarjeta', TRANSFERENCIA: 'Transferencia' };
const folio = (id) => `V-${String(id).padStart(4, '0')}`;
const formatDateTime = (value) => new Date(value).toLocaleString('es-AR');

// Mapa de caracteres Unicode → byte en CP437 (la code page por defecto de la
// mayoría de las térmicas). Cubre los caracteres del español.
const CP437 = {
  Ç: 128,
  ü: 129,
  é: 130,
  â: 131,
  ä: 132,
  à: 133,
  å: 134,
  ç: 135,
  ê: 136,
  ë: 137,
  è: 138,
  ï: 139,
  î: 140,
  ì: 141,
  Ä: 142,
  Å: 143,
  É: 144,
  æ: 145,
  Æ: 146,
  ô: 147,
  ö: 148,
  ò: 149,
  û: 150,
  ù: 151,
  ÿ: 152,
  Ö: 153,
  Ü: 154,
  á: 160,
  í: 161,
  ó: 162,
  ú: 163,
  ñ: 164,
  Ñ: 165,
  ª: 166,
  º: 167,
  '¿': 168,
  '¡': 173,
  '°': 248
};

// Convierte un texto a bytes CP437 (reemplaza espacios duros y lo que no mapea).
function encode(str) {
  const out = [];
  for (const ch of String(str)) {
    const code = ch.charCodeAt(0);
    if (code === 0x00a0)
      out.push(0x20); // espacio duro (NBSP) -> espacio normal
    else if (code < 128) out.push(code);
    else if (CP437[ch] != null) out.push(CP437[ch]);
    else out.push(0x3f); // '?'
  }
  return out;
}

// Construye la secuencia de bytes con una API encadenable.
class TicketBuilder {
  constructor() {
    this.bytes = [];
  }
  raw(...b) {
    this.bytes.push(...b);
    return this;
  }
  init() {
    return this.raw(ESC, 0x40).raw(ESC, 0x74, 0x00); // reset + code page CP437
  }
  align(n) {
    return this.raw(ESC, 0x61, n); // 0 izq, 1 centro, 2 der
  }
  bold(on) {
    return this.raw(ESC, 0x45, on ? 1 : 0);
  }
  big(on) {
    return this.raw(GS, 0x21, on ? 0x11 : 0x00); // doble alto y ancho
  }
  text(s) {
    this.bytes.push(...encode(s));
    return this;
  }
  line(s = '') {
    return this.text(s).raw(0x0a);
  }
  // Línea de dos columnas: etiqueta a la izquierda, valor a la derecha.
  twoCol(left, right) {
    const l = String(left);
    const r = String(right);
    const gap = Math.max(1, WIDTH - l.length - r.length);
    return this.line(l + ' '.repeat(gap) + r);
  }
  rule() {
    return this.line('-'.repeat(WIDTH));
  }
  feed(n = 1) {
    for (let i = 0; i < n; i++) this.raw(0x0a);
    return this;
  }
  cut() {
    // Avanza ~2cm antes de cortar, para dejar margen debajo del texto.
    return this.feed(5).raw(GS, 0x56, 0x42, 0x00); // corte parcial con avance al cortador
  }
  build() {
    return new Uint8Array(this.bytes);
  }
}

// Ticket de una venta. `company` son los datos del negocio (puede ser null).
export function buildSaleTicket(sale, company) {
  const biz = {
    name: company?.name ?? 'Comercio',
    address: company?.address ?? '',
    phone: company?.phone ?? '',
    taxId: company?.taxId ?? '',
    footer: company?.ticketFooter ?? ''
  };

  const t = new TicketBuilder().init();

  // Encabezado
  t.align(1).big(true).line(biz.name).big(false);
  if (biz.address) t.line(biz.address);
  if (biz.phone) t.line(`Tel: ${biz.phone}`);
  if (biz.taxId) t.line(`CUIT: ${biz.taxId}`);

  t.align(0).rule();

  // Datos de la venta
  t.twoCol('Comprobante:', folio(sale.id));
  t.twoCol('Fecha:', formatDateTime(sale.createdAt));
  t.twoCol('Cliente:', sale.customer?.name ?? 'Consumidor final');
  t.twoCol('Vendedor:', sale.user?.name ?? '-');
  t.twoCol('Pago:', PAYMENT_LABELS[sale.paymentMethod] ?? sale.paymentMethod);

  t.rule();

  // Productos: nombre en una línea, cantidad x precio ... subtotal en la siguiente
  for (const item of sale.items) {
    t.line(item.product?.name ?? `#${item.productId}`);
    t.twoCol(`  ${item.quantity} x ${formatCurrency(item.price)}`, formatCurrency(item.subtotal));
  }

  t.rule();

  // Totales
  t.twoCol('Subtotal:', formatCurrency(sale.subtotal));
  t.twoCol('Descuento:', `- ${formatCurrency(sale.discount)}`);
  t.bold(true).twoCol('TOTAL:', formatCurrency(sale.total)).bold(false);

  if (sale.status === 'CANCELLED') {
    t.feed(1).align(1).bold(true).line('*** VENTA ANULADA ***').bold(false).align(0);
  }

  // Pie
  t.rule();
  t.align(1).bold(true).line('¡Gracias por su compra!').bold(false);
  if (biz.footer) t.line(biz.footer);

  return t.cut().build();
}

// Ticket de prueba (botón "Probar impresora").
export function buildTestTicket(company) {
  const t = new TicketBuilder().init();
  t.align(1)
    .big(true)
    .line(company?.name ?? 'Prueba')
    .big(false);
  t.line('Prueba de impresora').align(0).rule();
  t.line('Si leés esto con acentos:');
  t.line('áéíóú ñ Ñ ¿? ¡! °');
  t.line('el ticket sale del largo');
  t.line('justo y corta solo.');
  return t.cut().build();
}
