import PropTypes from 'prop-types';
import React from 'react';

import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid2';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import ApexCharts from 'apexcharts';
import Chart from 'react-apexcharts';

import useConfig from 'hooks/useConfig';
import SkeletonTotalGrowthBarChart from 'components/cards/Skeleton/TotalGrowthBarChart';
import MainCard from 'components/cards/MainCard';
import { gridSpacing } from 'constants/store';

import chartData from './chart-data/total-growth-bar-chart';

const periodos = [
  { value: 'anio', label: 'Este año' },
  { value: 'semestre', label: 'Último semestre' },
  { value: 'trimestre', label: 'Último trimestre' }
];

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);

export default function TotalGrowthBarChart({ isLoading, ventasMensuales }) {
  const [periodo, setPeriodo] = React.useState('anio');
  const theme = useTheme();
  const { mode } = useConfig();

  const { primary } = theme.palette.text;
  const darkLight = theme.palette.dark.light;
  const divider = theme.palette.divider;
  const grey500 = theme.palette.grey[500];
  const primary200 = theme.palette.primary[200];
  const primaryDark = theme.palette.primary.dark;
  const secondaryMain = theme.palette.secondary.main;

  React.useEffect(() => {
    const newChartData = {
      ...chartData.options,
      colors: [primaryDark, primary200],
      xaxis: { labels: { style: { colors: Array(12).fill(primary) } } },
      yaxis: { labels: { style: { colors: [primary] } } },
      grid: { borderColor: divider },
      tooltip: { theme: mode },
      legend: { labels: { colors: grey500 } }
    };
    if (!isLoading) ApexCharts.exec('bar-chart', 'updateOptions', newChartData);
  }, [mode, primary200, primaryDark, secondaryMain, primary, darkLight, divider, isLoading, grey500]);

  // Total del año actual (suma de todos los meses)
  const totalAnio = ventasMensuales?.esteAnio?.reduce((acc, v) => acc + v, 0) ?? 0;

  return (
    <>
      {isLoading ? (
        <SkeletonTotalGrowthBarChart />
      ) : (
        <MainCard>
          <Grid container spacing={gridSpacing}>
            <Grid size={12}>
              <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Grid>
                  <Grid container direction="column" spacing={1}>
                    <Grid>
                      <Typography variant="subtitle2">Ventas del año</Typography>
                    </Grid>
                    <Grid>
                      <Typography variant="h3">{formatCurrency(totalAnio)}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid>
                  <TextField select value={periodo} onChange={(e) => setPeriodo(e.target.value)} size="small">
                    {periodos.map((op) => (
                      <MenuItem key={op.value} value={op.value}>
                        {op.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Grid>
            <Grid
              size={12}
              sx={{
                '& .apexcharts-menu': { bgcolor: 'background.paper' },
                '.apexcharts-theme-light .apexcharts-menu-item:hover': { bgcolor: 'dark.main' }
              }}
            >
              <Chart {...chartData} />
            </Grid>
          </Grid>
        </MainCard>
      )}
    </>
  );
}

TotalGrowthBarChart.propTypes = {
  isLoading: PropTypes.bool,
  ventasMensuales: PropTypes.shape({
    esteAnio: PropTypes.arrayOf(PropTypes.number),
    anioAnterior: PropTypes.arrayOf(PropTypes.number)
  })
};
