import { useState } from 'react';

import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import MainCard from 'components/cards/MainCard';
import SalesReportTab from './components/SalesReportTab';
import PurchasesReportTab from './components/PurchasesReportTab';
import CashReportTab from './components/CashReportTab';

const ymd = (d) => d.toISOString().slice(0, 10);
const today = new Date();
const defaultFrom = ymd(new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000));
const defaultTo = ymd(today);

export default function ReportsPage() {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [tab, setTab] = useState(0);

  return (
    <Stack spacing={2}>
      <MainCard>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={2}>
          <Typography variant="h3">Reportes</Typography>
          <Stack direction="row" spacing={2}>
            <TextField label="Desde" type="date" value={from} onChange={(e) => setFrom(e.target.value)} size="small" InputLabelProps={{ shrink: true }} />
            <TextField label="Hasta" type="date" value={to} onChange={(e) => setTo(e.target.value)} size="small" InputLabelProps={{ shrink: true }} />
          </Stack>
        </Stack>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 2 }}>
          <Tab label="Ventas" />
          <Tab label="Compras" />
          <Tab label="Caja" />
        </Tabs>
      </MainCard>

      {tab === 0 && <SalesReportTab from={from} to={to} />}
      {tab === 1 && <PurchasesReportTab from={from} to={to} />}
      {tab === 2 && <CashReportTab from={from} to={to} />}
    </Stack>
  );
}
