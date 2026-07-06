import PropTypes from 'prop-types';

import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import formatCurrency from 'utils/formatCurrency';
import PurchaseStatusChip from './PurchaseStatusChip';

const formatDateTime = (value) => (value ? new Date(value).toLocaleString('es-AR') : '—');

function Field({ label, children }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body1">{children}</Typography>
    </Stack>
  );
}

Field.propTypes = { label: PropTypes.string.isRequired, children: PropTypes.node };

export default function PurchaseDetailView({ purchase }) {
  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 3 }}><Field label="Proveedor">{purchase.supplier?.name ?? '—'}</Field></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Field label="Estado"><PurchaseStatusChip status={purchase.status} /></Field></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Field label="Registrada por">{purchase.user?.name ?? '—'}</Field></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Field label="Fecha">{formatDateTime(purchase.createdAt)}</Field></Grid>
        {purchase.receivedAt && (
          <Grid size={{ xs: 6, sm: 3 }}><Field label="Recibida el">{formatDateTime(purchase.receivedAt)}</Field></Grid>
        )}
      </Grid>

      <Divider />

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell align="right">Cantidad</TableCell>
              <TableCell align="right">Costo unit.</TableCell>
              <TableCell align="right">Subtotal</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchase.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.product?.name ?? `#${item.productId}`}</TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">{formatCurrency(item.cost)}</TableCell>
                <TableCell align="right">{formatCurrency(item.subtotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
        <Typography variant="h4">Total: {formatCurrency(purchase.total)}</Typography>
      </Stack>

      {purchase.notes && (
        <>
          <Divider />
          <Field label="Notas">{purchase.notes}</Field>
        </>
      )}
    </Stack>
  );
}

PurchaseDetailView.propTypes = {
  purchase: PropTypes.object.isRequired,
};
