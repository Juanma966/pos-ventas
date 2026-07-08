import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';

import formatCurrency from 'utils/formatCurrency';

const formatDateTime = (value) => new Date(value).toLocaleString('es-AR');

function sumByType(movements, type) {
  return movements.filter((m) => m.type === type).reduce((acc, m) => acc + Number(m.amount), 0);
}

function Stat({ label, value, color }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="h4" color={color} sx={{ mt: 0.5 }}>{value}</Typography>
      </CardContent>
    </Card>
  );
}

Stat.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.node.isRequired, color: PropTypes.string };

export default function SessionSummary({ session }) {
  const { movements } = session;
  const sales = sumByType(movements, 'SALE');
  const income = sumByType(movements, 'INCOME');
  const returns = sumByType(movements, 'RETURN');
  const expenses = sumByType(movements, 'EXPENSE');

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Typography variant="body2" color="text.secondary">
          Abierta por <strong>{session.user?.name ?? '—'}</strong> el {formatDateTime(session.openedAt)}
        </Typography>
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}><Stat label="Apertura" value={formatCurrency(session.openingAmount)} /></Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}><Stat label="Ventas efectivo" value={formatCurrency(sales)} color="success.main" /></Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}><Stat label="Ingresos" value={formatCurrency(income)} color="success.main" /></Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}><Stat label="Devoluciones" value={formatCurrency(returns)} color="error.main" /></Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}><Stat label="Egresos" value={formatCurrency(expenses)} color="error.main" /></Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}><Stat label="Efectivo en caja" value={formatCurrency(session.balance)} color="primary.main" /></Grid>
    </Grid>
  );
}

SessionSummary.propTypes = {
  session: PropTypes.object.isRequired,
};
