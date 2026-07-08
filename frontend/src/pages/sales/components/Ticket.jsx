import PropTypes from 'prop-types';
import { forwardRef } from 'react';

import { BUSINESS } from 'constants/app';
import formatCurrency from 'utils/formatCurrency';

const PAYMENT_LABELS = { EFECTIVO: 'Efectivo', TARJETA: 'Tarjeta', TRANSFERENCIA: 'Transferencia' };
const formatDateTime = (value) => new Date(value).toLocaleString('es-AR');
const folio = (id) => `V-${String(id).padStart(4, '0')}`;

const styles = {
  ticket: { width: '72mm', margin: '0 auto', padding: '4px', fontFamily: "'Courier New', monospace", fontSize: '12px', color: '#000', lineHeight: 1.35 },
  center: { textAlign: 'center' },
  bold: { fontWeight: 700 },
  hr: { border: 'none', borderTop: '1px dashed #000', margin: '6px 0' },
  row: { display: 'flex', justifyContent: 'space-between', gap: '8px' },
  itemName: { wordBreak: 'break-word' },
  muted: { fontSize: '11px' },
};

const Ticket = forwardRef(function Ticket({ sale }, ref) {
  if (!sale) return null;

  return (
    <div ref={ref} style={styles.ticket}>
      <div style={styles.center}>
        <div style={{ ...styles.bold, fontSize: '14px' }}>{BUSINESS.name}</div>
        <div style={styles.muted}>{BUSINESS.address}</div>
        <div style={styles.muted}>Tel: {BUSINESS.phone}</div>
        <div style={styles.muted}>CUIT: {BUSINESS.taxId}</div>
      </div>

      <hr style={styles.hr} />

      <div style={styles.row}><span>Comprobante:</span><span style={styles.bold}>{folio(sale.id)}</span></div>
      <div style={styles.row}><span>Fecha:</span><span>{formatDateTime(sale.createdAt)}</span></div>
      <div style={styles.row}><span>Cliente:</span><span>{sale.customer?.name ?? 'Consumidor final'}</span></div>
      <div style={styles.row}><span>Vendedor:</span><span>{sale.user?.name ?? '—'}</span></div>
      <div style={styles.row}><span>Pago:</span><span>{PAYMENT_LABELS[sale.paymentMethod] ?? sale.paymentMethod}</span></div>

      <hr style={styles.hr} />

      {sale.items.map((item) => (
        <div key={item.id ?? item.productId} style={{ marginBottom: '4px' }}>
          <div style={styles.itemName}>{item.product?.name ?? `#${item.productId}`}</div>
          <div style={styles.row}>
            <span>{item.quantity} x {formatCurrency(item.price)}</span>
            <span>{formatCurrency(item.subtotal)}</span>
          </div>
        </div>
      ))}

      <hr style={styles.hr} />

      <div style={styles.row}><span>Subtotal:</span><span>{formatCurrency(sale.subtotal)}</span></div>
      <div style={styles.row}><span>Descuento:</span><span>- {formatCurrency(sale.discount)}</span></div>
      <div style={{ ...styles.row, ...styles.bold, fontSize: '14px', marginTop: '2px' }}>
        <span>TOTAL:</span><span>{formatCurrency(sale.total)}</span>
      </div>

      {sale.status === 'CANCELLED' && (
        <div style={{ ...styles.center, ...styles.bold, marginTop: '6px' }}>*** VENTA ANULADA ***</div>
      )}

      <hr style={styles.hr} />

      <div style={{ ...styles.center, ...styles.muted }}>{BUSINESS.footer}</div>
    </div>
  );
});

Ticket.propTypes = {
  sale: PropTypes.object,
};

export default Ticket;
