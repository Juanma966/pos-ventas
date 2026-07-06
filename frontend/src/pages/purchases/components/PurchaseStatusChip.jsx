import PropTypes from 'prop-types';
import Chip from '@mui/material/Chip';

const STATUS_MAP = {
  PENDING: { label: 'Pendiente', color: 'warning' },
  RECEIVED: { label: 'Recibida', color: 'success' },
  CANCELLED: { label: 'Cancelada', color: 'default' },
};

export default function PurchaseStatusChip({ status }) {
  const { label, color } = STATUS_MAP[status] ?? { label: status, color: 'default' };
  return <Chip label={label} color={color} size="small" />;
}

PurchaseStatusChip.propTypes = {
  status: PropTypes.oneOf(['PENDING', 'RECEIVED', 'CANCELLED']).isRequired,
};
