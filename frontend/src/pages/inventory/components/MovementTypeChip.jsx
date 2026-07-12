import PropTypes from 'prop-types';
import Chip from '@mui/material/Chip';

const TYPE_MAP = {
  PURCHASE: { label: 'Compra', color: 'success' },
  SALE: { label: 'Venta', color: 'primary' },
  SALE_CANCEL: { label: 'Anulación', color: 'default' },
  RETURN: { label: 'Devolución', color: 'warning' },
  ADJUSTMENT: { label: 'Ajuste', color: 'info' },
};

export default function MovementTypeChip({ type }) {
  const { label, color } = TYPE_MAP[type] ?? { label: type, color: 'default' };
  return <Chip label={label} color={color} size="small" variant="outlined" />;
}

MovementTypeChip.propTypes = {
  type: PropTypes.oneOf(['PURCHASE', 'SALE', 'SALE_CANCEL', 'RETURN', 'ADJUSTMENT']).isRequired,
};
