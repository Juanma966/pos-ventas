import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import MainCard from 'components/cards/MainCard';
import useSalesReport from 'hooks/useSalesReport';
import formatCurrency from 'utils/formatCurrency';
import DailySalesChart from './components/DailySalesChart';
import PaymentMethodChart from './components/PaymentMethodChart';
import TopProductsTable from './components/TopProductsTable';

const ymd = (d) => d.toISOString().slice(0, 10);
const today = new Date();
const defaultFrom = ymd(new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000));
const defaultTo = ymd(today);

function Kpi({ label, value }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="h3" sx={{ mt: 0.5 }}>{value}</Typography>
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  const { report, isLoading } = useSalesReport({ from, to });

  return (
    <Stack spacing={2}>
      <MainCard>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
          <Typography variant="h3">Reporte de ventas</Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Desde"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Hasta"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </Stack>
      </MainCard>

      {isLoading || !report ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 3 }}><Kpi label="Ventas" value={report.salesCount} /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><Kpi label="Facturación bruta" value={formatCurrency(report.grossRevenue)} /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><Kpi label="Neto (− devoluciones)" value={formatCurrency(report.netRevenue)} /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><Kpi label="Ticket promedio" value={formatCurrency(report.avgTicket)} /></Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8 }}>
              <MainCard title="Ventas por día">
                <DailySalesChart daily={report.daily} />
              </MainCard>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <MainCard title="Por método de pago">
                <PaymentMethodChart byPaymentMethod={report.byPaymentMethod} />
              </MainCard>
            </Grid>
          </Grid>

          <MainCard title="Productos más vendidos">
            <TopProductsTable products={report.topProducts} />
          </MainCard>
        </>
      )}
    </Stack>
  );
}
