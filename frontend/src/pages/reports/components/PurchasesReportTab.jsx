import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import MainCard from 'components/cards/MainCard';
import usePurchasesReport from 'hooks/usePurchasesReport';
import formatCurrency from 'utils/formatCurrency';
import KpiCard from './KpiCard';
import DailyTotalChart from './DailyTotalChart';
import TopProductsTable from './TopProductsTable';

export default function PurchasesReportTab({ from, to }) {
  const { report, isLoading } = usePurchasesReport({ from, to });

  if (isLoading || !report) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 4 }}><KpiCard label="Compras recibidas" value={report.purchasesCount} /></Grid>
        <Grid size={{ xs: 6, md: 4 }}><KpiCard label="Total comprado" value={formatCurrency(report.totalPurchased)} /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><KpiCard label="Proveedores" value={report.topSuppliers.length} /></Grid>
      </Grid>

      <MainCard title="Compras por día" sx={{ mt: 2 }}>
        <DailyTotalChart daily={report.daily} seriesName="Compras" />
      </MainCard>

      <Grid container spacing={2} sx={{ mt: 0 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <MainCard title="Top proveedores">
            {report.topSuppliers.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">Sin compras en el período</Typography>
              </Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Proveedor</TableCell>
                    <TableCell align="right">Compras</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.topSuppliers.map((s) => (
                    <TableRow key={s.supplierId} hover>
                      <TableCell>{s.name}</TableCell>
                      <TableCell align="right">{s.count}</TableCell>
                      <TableCell align="right">{formatCurrency(s.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </MainCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <MainCard title="Productos más comprados">
            <TopProductsTable products={report.topProducts} />
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
}

PurchasesReportTab.propTypes = {
  from: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
};
