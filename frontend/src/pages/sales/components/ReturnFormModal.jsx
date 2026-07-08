import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import formatCurrency from 'utils/formatCurrency';

// Suma lo ya devuelto por cada saleItemId a partir de las devoluciones previas de la venta.
function computeReturned(sale) {
  const map = {};
  for (const ret of sale.returns ?? []) {
    for (const ri of ret.items ?? []) {
      map[ri.saleItemId] = (map[ri.saleItemId] || 0) + ri.quantity;
    }
  }
  return map;
}

export default function ReturnFormModal({ open, sale, onClose, onSubmit, isSubmitting, error }) {
  const [quantities, setQuantities] = useState({});
  const [reason, setReason] = useState('');

  const rows = useMemo(() => {
    if (!sale) return [];
    const returned = computeReturned(sale);
    return sale.items.map((item) => ({
      item,
      returnable: item.quantity - (returned[item.id] || 0),
    }));
  }, [sale]);

  useEffect(() => {
    if (open) {
      setQuantities({});
      setReason('');
    }
  }, [open, sale]);

  const setQty = (saleItemId, value, max) => {
    const capped = Math.max(0, Math.min(Number(value) || 0, max));
    setQuantities((prev) => ({ ...prev, [saleItemId]: capped }));
  };

  const total = rows.reduce(
    (acc, { item }) => acc + (quantities[item.id] || 0) * Number(item.price),
    0
  );
  const hasSelection = Object.values(quantities).some((q) => q > 0);

  const handleSubmit = () => {
    const items = rows
      .filter(({ item }) => (quantities[item.id] || 0) > 0)
      .map(({ item }) => ({ saleItemId: item.id, quantity: quantities[item.id] }));
    onSubmit({ reason: reason.trim() || undefined, items });
  };

  if (!sale) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Devolución de mercadería</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell align="center">Devolvible</TableCell>
              <TableCell align="center">A devolver</TableCell>
              <TableCell align="right">Subtotal</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(({ item, returnable }) => (
              <TableRow key={item.id}>
                <TableCell>{item.product?.name ?? `#${item.productId}`}</TableCell>
                <TableCell align="center">{returnable} / {item.quantity}</TableCell>
                <TableCell align="center">
                  {returnable === 0 ? (
                    <Typography variant="caption" color="text.secondary">Devuelto</Typography>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      <IconButton size="small" onClick={() => setQty(item.id, (quantities[item.id] || 0) - 1, returnable)} disabled={(quantities[item.id] || 0) <= 0}>
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <TextField
                        value={quantities[item.id] || 0}
                        onChange={(e) => setQty(item.id, e.target.value, returnable)}
                        size="small"
                        type="number"
                        inputProps={{ min: 0, max: returnable, style: { textAlign: 'center', width: 40 } }}
                        sx={{ '& .MuiInputBase-root': { height: 32 } }}
                      />
                      <IconButton size="small" onClick={() => setQty(item.id, (quantities[item.id] || 0) + 1, returnable)} disabled={(quantities[item.id] || 0) >= returnable}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency((quantities[item.id] || 0) * Number(item.price))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TextField
          label="Motivo (opcional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          fullWidth
          multiline
          rows={2}
          sx={{ mt: 2 }}
        />

        <Divider sx={{ my: 2 }} />
        <Stack direction="row" justifyContent="flex-end">
          <Typography variant="h4">A reintegrar: {formatCurrency(total)}</Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
        <Button
          variant="contained"
          color="warning"
          onClick={handleSubmit}
          disabled={!hasSelection || isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
        >
          Confirmar devolución
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ReturnFormModal.propTypes = {
  open: PropTypes.bool.isRequired,
  sale: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  error: PropTypes.string,
};
