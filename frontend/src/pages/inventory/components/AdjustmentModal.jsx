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
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

import useProducts from 'hooks/useProducts';

const MODES = [
  { value: 'ENTRADA', label: 'Entrada' },
  { value: 'SALIDA', label: 'Salida' },
  { value: 'CONTEO', label: 'Conteo' },
];

export default function AdjustmentModal({ open, onClose, onSubmit, isSubmitting, error }) {
  const { products } = useProducts({ active: 'true', limit: 1000 });

  const [productId, setProductId] = useState('');
  const [mode, setMode] = useState('ENTRADA');
  const [quantity, setQuantity] = useState('');
  const [countedStock, setCountedStock] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) {
      setProductId('');
      setMode('ENTRADA');
      setQuantity('');
      setCountedStock('');
      setReason('');
    }
  }, [open]);

  const product = useMemo(() => products.find((p) => p.id === productId), [products, productId]);

  const resultingStock = useMemo(() => {
    if (!product) return null;
    if (mode === 'ENTRADA') return product.stock + (Number(quantity) || 0);
    if (mode === 'SALIDA') return product.stock - (Number(quantity) || 0);
    return Number(countedStock) || 0;
  }, [product, mode, quantity, countedStock]);

  const invalid =
    !productId ||
    (mode !== 'CONTEO' && (!quantity || Number(quantity) <= 0)) ||
    (mode === 'CONTEO' && countedStock === '') ||
    (resultingStock !== null && resultingStock < 0);

  const handleSubmit = () => {
    const base = { productId, mode, reason: reason.trim() || undefined };
    const payload = mode === 'CONTEO'
      ? { ...base, countedStock: Number(countedStock) }
      : { ...base, quantity: Number(quantity) };
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ajustar stock</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            select
            label="Producto *"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            fullWidth
          >
            {products.map((p) => (
              <MenuItem key={p.id} value={p.id}>{p.name} (stock: {p.stock})</MenuItem>
            ))}
          </TextField>

          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, v) => v && setMode(v)}
            fullWidth
            size="small"
          >
            {MODES.map((m) => (
              <ToggleButton key={m.value} value={m.value}>{m.label}</ToggleButton>
            ))}
          </ToggleButtonGroup>

          {mode === 'CONTEO' ? (
            <TextField
              label="Stock contado *"
              value={countedStock}
              onChange={(e) => setCountedStock(e.target.value)}
              type="number"
              fullWidth
              inputProps={{ min: 0, step: 1 }}
            />
          ) : (
            <TextField
              label="Cantidad *"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              type="number"
              fullWidth
              inputProps={{ min: 1, step: 1 }}
            />
          )}

          <TextField
            label="Motivo"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
            multiline
            rows={2}
            placeholder="Ej: rotura, merma, recuento físico..."
          />

          {product && resultingStock !== null && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }}>
              <Typography variant="body2" color="text.secondary">Stock: {product.stock} → </Typography>
              <Typography variant="body2" fontWeight={600} color={resultingStock < 0 ? 'error.main' : 'text.primary'}>
                {resultingStock}
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={invalid || isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
        >
          Registrar ajuste
        </Button>
      </DialogActions>
    </Dialog>
  );
}

AdjustmentModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  error: PropTypes.string,
};
