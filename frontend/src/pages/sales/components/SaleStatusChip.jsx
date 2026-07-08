import PropTypes from 'prop-types';
import Chip from '@mui/material/Chip';

const STATUS_MAP = {
  COMPLETED: { label: 'Completada', color: 'success' },
  CANCELLED: { label: 'Anulada', color: 'default' },
  PARTIALLY_RETURNED: { label: 'Devuelta parcial', color: 'warning' },
  RETURNED: { label: 'Devuelta', color: 'error' },
};

export default function SaleStatusChip({ status }) {
  const { label, color } = STATUS_MAP[status] ?? { label: status, color: 'default' };
  return <Chip label={label} color={color} size="small" />;
}

SaleStatusChip.propTypes = {
  status: PropTypes.oneOf(['COMPLETED', 'CANCELLED', 'PARTIALLY_RETURNED', 'RETURNED']).isRequired,
};
