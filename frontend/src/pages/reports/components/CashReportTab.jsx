import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';

import MainCard from 'components/cards/MainCard';
import useCashReport from 'hooks/useCashReport';
import formatCurrency from 'utils/formatCurrency';
import KpiCard from './KpiCard';
import CashSessionsTable from './CashSessionsTable';

export default function CashReportTab({ from, to }) {
  const { report, isLoading } = useCashReport({ from, to });

  if (isLoading || !report) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  const t = report.totalsByType;

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 4 }}><KpiCard label="Cierres de caja" value={report.sessionsCount} /></Grid>
        <Grid size={{ xs: 6, md: 4 }}><KpiCard label="Ventas en efectivo" value={formatCurrency(t.SALE)} /></Grid>
        <Grid size={{ xs: 6, md: 4 }}><KpiCard label="Diferencia acumulada" value={formatCurrency(report.totalDifference)} /></Grid>
        <Grid size={{ xs: 6, md: 4 }}><KpiCard label="Ingresos manuales" value={formatCurrency(t.INCOME)} /></Grid>
        <Grid size={{ xs: 6, md: 4 }}><KpiCard label="Egresos manuales" value={formatCurrency(t.EXPENSE)} /></Grid>
        <Grid size={{ xs: 6, md: 4 }}><KpiCard label="Devoluciones/anulaciones" value={formatCurrency(t.RETURN)} /></Grid>
      </Grid>

      <MainCard title="Cierres de caja" sx={{ mt: 2 }}>
        <CashSessionsTable sessions={report.sessions} />
      </MainCard>
    </>
  );
}

CashReportTab.propTypes = {
  from: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
};
