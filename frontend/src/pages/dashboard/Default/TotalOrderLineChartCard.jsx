import PropTypes from 'prop-types';
import React from 'react';

import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import Chart from 'react-apexcharts';

import ChartDataSemana from './chart-data/total-order-month-line-chart';
import ChartDataMes from './chart-data/total-order-year-line-chart';
import MainCard from 'components/cards/MainCard';
import SkeletonTotalOrderCard from 'components/cards/Skeleton/EarningCard';

import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function TotalOrderLineChartCard({ isLoading, cantidad = 0, variacion = 0 }) {
  const theme = useTheme();
  const [verSemana, setVerSemana] = React.useState(true);
  const esPositivo = variacion >= 0;

  return (
    <>
      {isLoading ? (
        <SkeletonTotalOrderCard />
      ) : (
        <MainCard
          border={false}
          content={false}
          sx={{
            bgcolor: 'primary.dark',
            color: '#fff',
            overflow: 'hidden',
            position: 'relative',
            '&>div': { position: 'relative', zIndex: 5 },
            '&:after': {
              content: '""',
              position: 'absolute',
              width: 210,
              height: 210,
              background: theme.palette.primary[800],
              borderRadius: '50%',
              top: { xs: -85 },
              right: { xs: -95 }
            },
            '&:before': {
              content: '""',
              position: 'absolute',
              width: 210,
              height: 210,
              background: theme.palette.primary[800],
              borderRadius: '50%',
              top: { xs: -125 },
              right: { xs: -15 },
              opacity: 0.5
            }
          }}
        >
          <Box sx={{ p: 2.25 }}>
            <Grid container direction="column">
              <Grid>
                <Grid container sx={{ justifyContent: 'space-between' }}>
                  <Grid>
                    <Avatar
                      variant="rounded"
                      sx={{
                        ...theme.typography.commonAvatar,
                        ...theme.typography.largeAvatar,
                        bgcolor: 'primary.800',
                        color: '#fff',
                        mt: 1
                      }}
                    >
                      <ReceiptLongOutlinedIcon fontSize="inherit" />
                    </Avatar>
                  </Grid>
                  <Grid>
                    <Button
                      disableElevation
                      variant={verSemana ? 'contained' : 'text'}
                      size="small"
                      sx={{ color: 'inherit' }}
                      onClick={() => setVerSemana(true)}
                    >
                      Semana
                    </Button>
                    <Button
                      disableElevation
                      variant={!verSemana ? 'contained' : 'text'}
                      size="small"
                      sx={{ color: 'inherit' }}
                      onClick={() => setVerSemana(false)}
                    >
                      Mes
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              <Grid sx={{ mb: 0.75 }}>
                <Grid container sx={{ alignItems: 'center' }}>
                  <Grid size={6}>
                    <Grid container sx={{ alignItems: 'center' }}>
                      <Grid>
                        <Typography sx={{ fontSize: '2.125rem', fontWeight: 500, mr: 1, mt: 1.75, mb: 0.75 }}>
                          {cantidad}
                        </Typography>
                      </Grid>
                      <Grid>
                        <Avatar
                          sx={{
                            ...theme.typography.smallAvatar,
                            cursor: 'pointer',
                            bgcolor: esPositivo ? 'success.dark' : 'error.dark',
                            color: '#fff'
                          }}
                        >
                          <TrendingUpIcon fontSize="inherit" />
                        </Avatar>
                      </Grid>
                      <Grid size={12}>
                        <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: 'primary.200' }}>
                          Transacciones hoy
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    size={6}
                    sx={{
                      '.apexcharts-tooltip.apexcharts-theme-light': {
                        color: theme.palette.text.primary,
                        background: theme.palette.background.default
                      }
                    }}
                  >
                    {verSemana ? <Chart {...ChartDataSemana} /> : <Chart {...ChartDataMes} />}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </MainCard>
      )}
    </>
  );
}

TotalOrderLineChartCard.propTypes = {
  isLoading: PropTypes.bool,
  cantidad: PropTypes.number,
  variacion: PropTypes.number
};
