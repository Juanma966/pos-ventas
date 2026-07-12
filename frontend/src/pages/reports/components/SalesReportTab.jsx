import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';

import MainCard from 'components/cards/MainCard';
import useSalesReport from 'hooks/useSalesReport';
import formatCurrency from 'utils/formatCurrency';
import KpiCard from './KpiCard';
import DailyTotalChart from './DailyTotalChart';
import PaymentMethodChart from './PaymentMethodChart';
import TopProductsTable from './TopProductsTable';

export default function SalesReportTab({ from, to }) {
  const { report, isLoading } = useSalesReport({ from, to });

  if (isLoading || !report) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Ventas" value={report.salesCount} /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Facturación bruta" value={formatCurrency(report.grossRevenue)} /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Neto (− devoluciones)" value={formatCurrency(report.netRevenue)} /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Ticket promedio" value={formatCurrency(report.avgTicket)} /></Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 0 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <MainCard title="Ventas por día"><DailyTotalChart daily={report.daily} seriesName="Ventas" /></MainCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <MainCard title="Por método de pago"><PaymentMethodChart byPaymentMethod={report.byPaymentMethod} /></MainCard>
        </Grid>
      </Grid>

      <MainCard title="Productos más vendidos" sx={{ mt: 2 }}>
        <TopProductsTable products={report.topProducts} />
      </MainCard>
    </>
  );
}

SalesReportTab.propTypes = {
  from: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
};
