import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import PointOfSaleIcon from '@mui/icons-material/PointOfSale';

import formatCurrency from 'utils/formatCurrency';

const PAYMENT_METHODS = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TARJETA', label: 'Tarjeta' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
];

function Line({ label, value, strong }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography variant={strong ? 'h4' : 'body2'} color={strong ? 'text.primary' : 'text.secondary'}>{label}</Typography>
      <Typography variant={strong ? 'h4' : 'body2'} fontWeight={strong ? 700 : 500}>{value}</Typography>
    </Box>
  );
}

Line.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.node.isRequired, strong: PropTypes.bool };

export default function CheckoutPanel({
  subtotal, discount, onDiscountChange, paymentMethod, onPaymentMethodChange,
  customerId, onCustomerChange, customers, onConfirm, isSubmitting, disabled,
}) {
  const discountNum = Math.min(Number(discount) || 0, subtotal);
  const total = subtotal - discountNum;

  return (
    <Stack spacing={2}>
      <TextField
        select
        label="Cliente (opcional)"
        value={customerId}
        onChange={(e) => onCustomerChange(e.target.value)}
        size="small"
        fullWidth
      >
        <MenuItem value="">Consumidor final</MenuItem>
        {customers.map((c) => (
          <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Método de pago"
        value={paymentMethod}
        onChange={(e) => onPaymentMethodChange(e.target.value)}
        size="small"
        fullWidth
      >
        {PAYMENT_METHODS.map((m) => (
          <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
        ))}
      </TextField>

      <TextField
        label="Descuento"
        value={discount}
        onChange={(e) => onDiscountChange(e.target.value)}
        size="small"
        type="number"
        fullWidth
        inputProps={{ min: 0, step: 50 }}
      />

      <Divider />

      <Stack spacing={1}>
        <Line label="Subtotal" value={formatCurrency(subtotal)} />
        <Line label="Descuento" value={`- ${formatCurrency(discountNum)}`} />
        <Line label="Total" value={formatCurrency(total)} strong />
      </Stack>

      <Button
        variant="contained"
        size="large"
        startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <PointOfSaleIcon />}
        onClick={onConfirm}
        disabled={disabled || isSubmitting}
      >
        Confirmar venta
      </Button>
    </Stack>
  );
}

CheckoutPanel.propTypes = {
  subtotal: PropTypes.number.isRequired,
  discount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onDiscountChange: PropTypes.func.isRequired,
  paymentMethod: PropTypes.string.isRequired,
  onPaymentMethodChange: PropTypes.func.isRequired,
  customerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onCustomerChange: PropTypes.func.isRequired,
  customers: PropTypes.array.isRequired,
  onConfirm: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  disabled: PropTypes.bool,
};
