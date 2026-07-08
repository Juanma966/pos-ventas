import PropTypes from 'prop-types';
import { useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';

import formatCurrency from 'utils/formatCurrency';
import usePrintTicket from 'hooks/usePrintTicket';
import Ticket from './Ticket';

const PAYMENT_LABELS = { EFECTIVO: 'Efectivo', TARJETA: 'Tarjeta', TRANSFERENCIA: 'Transferencia' };
const formatDateTime = (value) => new Date(value).toLocaleString('es-AR');
const folio = (id) => `V-${String(id).padStart(4, '0')}`;

function Field({ label, children }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body1">{children}</Typography>
    </Stack>
  );
}

Field.propTypes = { label: PropTypes.string.isRequired, children: PropTypes.node };

export default function SaleDetailModal({ open, sale, onClose, onCancelSale, isCancelling }) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const { ticketRef, printTicket } = usePrintTicket();

  const handleClose = () => {
    setConfirmCancel(false);
    onClose();
  };

  if (!sale) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <span>Venta {folio(sale.id)}</span>
          <Chip
            label={sale.status === 'COMPLETED' ? 'Completada' : 'Anulada'}
            color={sale.status === 'COMPLETED' ? 'success' : 'default'}
            size="small"
          />
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={6}><Field label="Fecha">{formatDateTime(sale.createdAt)}</Field></Grid>
          <Grid size={6}><Field label="Cliente">{sale.customer?.name ?? 'Consumidor final'}</Field></Grid>
          <Grid size={6}><Field label="Vendedor">{sale.user?.name ?? '—'}</Field></Grid>
          <Grid size={6}><Field label="Método de pago">{PAYMENT_LABELS[sale.paymentMethod] ?? sale.paymentMethod}</Field></Grid>
        </Grid>

        <Divider sx={{ mb: 1 }} />

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell align="right">Cant.</TableCell>
              <TableCell align="right">Precio</TableCell>
              <TableCell align="right">Subtotal</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sale.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.product?.name ?? `#${item.productId}`}</TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                <TableCell align="right">{formatCurrency(item.subtotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Stack spacing={0.5} sx={{ mt: 2, ml: 'auto', maxWidth: 240 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Subtotal</Typography>
            <Typography variant="body2">{formatCurrency(sale.subtotal)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Descuento</Typography>
            <Typography variant="body2">- {formatCurrency(sale.discount)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h4">Total</Typography>
            <Typography variant="h4">{formatCurrency(sale.total)}</Typography>
          </Box>
        </Stack>

        {confirmCancel && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Al anular la venta se repondrá el stock de los productos. ¿Confirmás?
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={isCancelling}>Cerrar</Button>
        <Button startIcon={<PrintOutlinedIcon />} onClick={printTicket}>Imprimir ticket</Button>
        {sale.status === 'COMPLETED' && (
          confirmCancel ? (
            <Button color="error" variant="contained" onClick={() => onCancelSale(sale.id)} disabled={isCancelling}>
              Confirmar anulación
            </Button>
          ) : (
            <Button color="error" onClick={() => setConfirmCancel(true)} disabled={isCancelling}>
              Anular venta
            </Button>
          )
        )}
      </DialogActions>

      {/* Ticket oculto en pantalla; react-to-print lo copia a un iframe aislado para imprimir */}
      <Box sx={{ display: 'none' }}>
        <Ticket ref={ticketRef} sale={sale} />
      </Box>
    </Dialog>
  );
}

SaleDetailModal.propTypes = {
  open: PropTypes.bool.isRequired,
  sale: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onCancelSale: PropTypes.func.isRequired,
  isCancelling: PropTypes.bool,
};
