import PropTypes from 'prop-types';
import { forwardRef } from 'react';

import { BUSINESS } from 'constants/app';
import useCompany from 'hooks/useCompany';
import formatCurrency from 'utils/formatCurrency';

const PAYMENT_LABELS = { EFECTIVO: 'Efectivo', TARJETA: 'Tarjeta', TRANSFERENCIA: 'Transferencia' };
const formatDateTime = (value) => new Date(value).toLocaleString('es-AR');
const folio = (id) => `V-${String(id).padStart(4, '0')}`;

const styles = {
  // 72mm de contenido para papel de 80mm (deja un margen imprimible seguro).
  ticket: {
    width: '72mm',
    margin: '0 auto',
    padding: '0 4px',
    fontFamily: "'Courier New', monospace",
    fontSize: '13px',
    color: '#000',
    lineHeight: 1.3,
    WebkitPrintColorAdjust: 'exact',
    printColorAdjust: 'exact',
  },
  center: { textAlign: 'center' },
  bold: { fontWeight: 700 },
  hr: { border: 'none', borderTop: '1px dashed #000', margin: '5px 0' },
  // Fila etiqueta/valor: la etiqueta no se estruja, el valor se alinea a la derecha.
  row: { display: 'flex', justifyContent: 'space-between', gap: '8px', margin: '1px 0' },
  label: { whiteSpace: 'nowrap' },
  value: { textAlign: 'right', wordBreak: 'break-word' },
  // Cada ítem no se debe partir entre dos tiras al imprimir.
  item: { margin: '3px 0', breakInside: 'avoid', pageBreakInside: 'avoid' },
  itemName: { fontWeight: 700, wordBreak: 'break-word' },
  itemLine: { display: 'flex', justifyContent: 'space-between', gap: '8px', paddingLeft: '6px' },
  muted: { fontSize: '12px' },
  // Zona de corte: ~3cm de papel en blanco después del "gracias".
  cutZone: { height: '30mm' },
};

// Fila etiqueta izquierda / valor a la derecha.
function Row({ label, value, strong }) {
  return (
    <div style={styles.row}>
      <span style={styles.label}>{label}</span>
      <span style={{ ...styles.value, ...(strong ? styles.bold : null) }}>{value}</span>
    </div>
  );
}
Row.propTypes = { label: PropTypes.node, value: PropTypes.node, strong: PropTypes.bool };

const Ticket = forwardRef(function Ticket({ sale }, ref) {
  const { company } = useCompany();

  if (!sale) return null;

  // Datos de la empresa desde la config; si aún no cargó, usa el placeholder.
  const biz = {
    name: company?.name ?? BUSINESS.name,
    address: company?.address ?? BUSINESS.address,
    phone: company?.phone ?? BUSINESS.phone,
    taxId: company?.taxId ?? BUSINESS.taxId,
    footer: company?.ticketFooter ?? BUSINESS.footer,
  };

  return (
    <div ref={ref} style={styles.ticket}>
      {/* Encabezado */}
      <div style={{ ...styles.center, marginTop: '4px' }}>
        <div style={{ ...styles.bold, fontSize: '16px' }}>{biz.name}</div>
        {biz.address && <div style={styles.muted}>{biz.address}</div>}
        {biz.phone && <div style={styles.muted}>Tel: {biz.phone}</div>}
        {biz.taxId && <div style={styles.muted}>CUIT: {biz.taxId}</div>}
      </div>

      <hr style={styles.hr} />

      {/* Datos de la venta */}
      <Row label="Comprobante" value={folio(sale.id)} strong />
      <Row label="Fecha" value={formatDateTime(sale.createdAt)} />
      <Row label="Cliente" value={sale.customer?.name ?? 'Consumidor final'} />
      <Row label="Vendedor" value={sale.user?.name ?? '—'} />
      <Row label="Pago" value={PAYMENT_LABELS[sale.paymentMethod] ?? sale.paymentMethod} />

      <hr style={styles.hr} />

      {/* Detalle de productos */}
      {sale.items.map((item) => (
        <div key={item.id ?? item.productId} style={styles.item}>
          <div style={styles.itemName}>{item.product?.name ?? `#${item.productId}`}</div>
          <div style={styles.itemLine}>
            <span>
              {item.quantity} x {formatCurrency(item.price)}
            </span>
            <span>{formatCurrency(item.subtotal)}</span>
          </div>
        </div>
      ))}

      <hr style={styles.hr} />

      {/* Totales */}
      <Row label="Subtotal" value={formatCurrency(sale.subtotal)} />
      <Row label="Descuento" value={`- ${formatCurrency(sale.discount)}`} />
      <div style={{ ...styles.row, ...styles.bold, fontSize: '16px', marginTop: '3px' }}>
        <span>TOTAL</span>
        <span>{formatCurrency(sale.total)}</span>
      </div>

      {sale.status === 'CANCELLED' && (
        <div style={{ ...styles.center, ...styles.bold, marginTop: '6px' }}>*** VENTA ANULADA ***</div>
      )}

      <hr style={styles.hr} />

      {/* Pie */}
      <div style={{ ...styles.center, ...styles.bold, marginTop: '4px' }}>¡Gracias por su compra!</div>
      {biz.footer && <div style={{ ...styles.center, ...styles.muted, marginTop: '2px' }}>{biz.footer}</div>}

      {/* Margen de corte (~3cm de papel en blanco) */}
      <div style={styles.cutZone} />
    </div>
  );
});

Ticket.propTypes = {
  sale: PropTypes.object,
};

export default Ticket;
