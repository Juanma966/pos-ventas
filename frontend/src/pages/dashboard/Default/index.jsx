import { useNavigate } from 'react-router-dom';

import Grid from '@mui/material/Grid2';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';

import EarningCard from './EarningCard';
import TotalOrderLineChartCard from './TotalOrderLineChartCard';
import TotalIncomeDarkCard from 'components/cards/TotalIncomeDarkCard';
import TotalIncomeLightCard from 'components/cards/TotalIncomeLightCard';
import TotalGrowthBarChart from './TotalGrowthBarChart';
import PopularCard from './PopularCard';
import FixedExpensesCard from './FixedExpensesCard';

import { gridSpacing } from 'constants/store';
import { useDashboard } from 'hooks/useDashboard';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    isLoading,
    ventasHoy,
    transaccionesHoy,
    productosBajoStock,
    clientesNuevosMes,
    ventasMensuales,
    ultimasVentas
  } = useDashboard();

  return (
    <Grid container spacing={gridSpacing}>
      <Grid size={12}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={2}
        >
          <Typography variant="h3">Dashboard</Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<AccountBalanceWalletOutlinedIcon />}
              onClick={() => navigate('/caja')}
            >
              Caja
            </Button>
            <Button
              variant="contained"
              startIcon={<PointOfSaleIcon />}
              onClick={() => navigate('/ventas')}
            >
              Nueva venta
            </Button>
          </Stack>
        </Stack>
      </Grid>
      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          <Grid size={{ lg: 4, md: 6, sm: 6, xs: 12 }}>
            <EarningCard
              isLoading={isLoading}
              monto={ventasHoy?.monto}
              variacion={ventasHoy?.variacion}
            />
          </Grid>
          <Grid size={{ lg: 4, md: 6, sm: 6, xs: 12 }}>
            <TotalOrderLineChartCard
              isLoading={isLoading}
              cantidad={transaccionesHoy?.cantidad}
              variacion={transaccionesHoy?.variacion}
            />
          </Grid>
          <Grid size={{ lg: 4, md: 12, sm: 12, xs: 12 }}>
            <Grid container spacing={gridSpacing}>
              <Grid size={{ sm: 6, xs: 12, md: 6, lg: 12 }}>
                <TotalIncomeDarkCard isLoading={isLoading} cantidad={productosBajoStock} />
              </Grid>
              <Grid size={{ sm: 6, xs: 12, md: 6, lg: 12 }}>
                <TotalIncomeLightCard
                  isLoading={isLoading}
                  total={clientesNuevosMes}
                  label="Clientes nuevos este mes"
                  icon={<PeopleAltOutlinedIcon fontSize="inherit" />}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          <Grid size={{ xs: 12, md: 8 }}>
            <TotalGrowthBarChart isLoading={isLoading} ventasMensuales={ventasMensuales} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <PopularCard isLoading={isLoading} ultimasVentas={ultimasVentas} />
          </Grid>
        </Grid>
      </Grid>
      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          <Grid size={{ xs: 12, md: 4 }}>
            <FixedExpensesCard />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
