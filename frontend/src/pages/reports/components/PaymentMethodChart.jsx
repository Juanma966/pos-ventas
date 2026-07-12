import PropTypes from 'prop-types';
import Chart from 'react-apexcharts';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

const LABELS = { EFECTIVO: 'Efectivo', TARJETA: 'Tarjeta', TRANSFERENCIA: 'Transferencia' };

export default function PaymentMethodChart({ byPaymentMethod }) {
  const theme = useTheme();

  if (!byPaymentMethod.length) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">Sin datos en el período</Typography>
      </Box>
    );
  }

  const options = {
    chart: { fontFamily: theme.typography.fontFamily },
    labels: byPaymentMethod.map((m) => LABELS[m.method] ?? m.method),
    colors: [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.success.main],
    legend: { position: 'bottom' },
    dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(0)}%` },
    tooltip: { y: { formatter: (v) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(v) } },
  };

  const series = byPaymentMethod.map((m) => m.total);

  return <Chart options={options} series={series} type="donut" height={320} />;
}

PaymentMethodChart.propTypes = {
  byPaymentMethod: PropTypes.array.isRequired,
};
