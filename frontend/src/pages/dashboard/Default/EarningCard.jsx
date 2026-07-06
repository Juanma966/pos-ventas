import PropTypes from 'prop-types';

import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';

import MainCard from 'components/cards/MainCard';
import SkeletonEarningCard from 'components/cards/Skeleton/EarningCard';

import EarningIcon from 'assets/images/icons/earning.svg';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);

export default function EarningCard({ isLoading, monto = 0, variacion = 0 }) {
  const theme = useTheme();
  const esPositivo = variacion >= 0;

  return (
    <>
      {isLoading ? (
        <SkeletonEarningCard />
      ) : (
        <MainCard
          border={false}
          content={false}
          sx={{
            bgcolor: 'secondary.dark',
            color: '#fff',
            overflow: 'hidden',
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              width: 210,
              height: 210,
              background: theme.palette.secondary[800],
              borderRadius: '50%',
              top: { xs: -85 },
              right: { xs: -95 }
            },
            '&:before': {
              content: '""',
              position: 'absolute',
              width: 210,
              height: 210,
              background: theme.palette.secondary[800],
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
                <Avatar
                  variant="rounded"
                  sx={{
                    ...theme.typography.commonAvatar,
                    ...theme.typography.largeAvatar,
                    bgcolor: 'secondary.800',
                    mt: 1
                  }}
                >
                  <CardMedia sx={{ width: 24, height: 24 }} component="img" src={EarningIcon} alt="ventas" />
                </Avatar>
              </Grid>
              <Grid>
                <Typography sx={{ fontSize: '2.125rem', fontWeight: 500, mt: 1.75, mb: 0.75 }}>
                  {formatCurrency(monto)}
                </Typography>
              </Grid>
              <Grid sx={{ mb: 1.25 }}>
                <Grid container sx={{ alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: 'secondary.200' }}>
                    Ventas hoy
                  </Typography>
                  <Chip
                    size="small"
                    icon={esPositivo ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                    label={`${esPositivo ? '+' : ''}${variacion}%`}
                    sx={{
                      bgcolor: esPositivo ? 'success.dark' : 'error.dark',
                      color: '#fff',
                      '& .MuiChip-icon': { color: '#fff' },
                      fontSize: '0.75rem',
                      height: 20
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </MainCard>
      )}
    </>
  );
}

EarningCard.propTypes = { isLoading: PropTypes.bool, monto: PropTypes.number, variacion: PropTypes.number };
