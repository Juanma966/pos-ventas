import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import formatCurrency from 'utils/formatCurrency';
import SaleStatusChip from 'pages/sales/components/SaleStatusChip';

const PAYMENT_LABELS = { EFECTIVO: 'Efectivo', TARJETA: 'Tarjeta', TRANSFERENCIA: 'Transferencia' };
const formatDate = (value) => new Date(value).toLocaleDateString('es-AR');
const folio = (id) => `V-${String(id).padStart(4, '0')}`;

function Kpi({ label, value }) {
  return (
    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'grey.50', textAlign: 'center', height: '100%' }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h4">{value}</Typography>
    </Box>
  );
}

Kpi.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.node.isRequired };

// Detalle de un cliente: estadísticas + historial de compras recientes.
export default function CustomerDetailModal({ open, customer, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{customer ? customer.name : 'Cliente'}</DialogTitle>
      <DialogContent dividers>
        {!customer ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2}>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Kpi label="Total gastado" value={formatCurrency(customer.stats.totalSpent)} />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Kpi label="Compras" value={customer.stats.salesCount} />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Kpi label="Ticket promedio" value={formatCurrency(customer.stats.avgTicket)} />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Kpi label="Última compra" value={customer.stats.lastSaleAt ? formatDate(customer.stats.lastSaleAt) : '—'} />
              </Grid>
            </Grid>

            <Box>
              <Typography variant="h5" sx={{ mb: 1 }}>
                Historial de compras
              </Typography>
              {customer.recentSales.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Este cliente todavía no tiene compras
                  </Typography>
                </Box>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Comprobante</TableCell>
                      <TableCell align="center">Estado</TableCell>
                      <TableCell>Método</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customer.recentSales.map((sale) => (
                      <TableRow key={sale.id} hover>
                        <TableCell>{formatDate(sale.createdAt)}</TableCell>
                        <TableCell>{folio(sale.id)}</TableCell>
                        <TableCell align="center">
                          <SaleStatusChip status={sale.status} />
                        </TableCell>
                        <TableCell>{PAYMENT_LABELS[sale.paymentMethod] ?? sale.paymentMethod}</TableCell>
                        <TableCell align="right">{formatCurrency(sale.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {customer.recentSales.length === 20 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Se muestran las últimas 20 compras. El historial completo está en Ventas.
                </Typography>
              )}
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}

CustomerDetailModal.propTypes = {
  open: PropTypes.bool.isRequired,
  customer: PropTypes.object,
  onClose: PropTypes.func.isRequired
};
