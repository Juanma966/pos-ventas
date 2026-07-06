import PropTypes from 'prop-types';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';

import MainCard from 'components/cards/MainCard';
import SkeletonPopularCard from 'components/cards/Skeleton/PopularCard';
import { gridSpacing } from 'constants/store';

import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);

export default function PopularCard({ isLoading, ultimasVentas = [] }) {
  return (
    <>
      {isLoading ? (
        <SkeletonPopularCard />
      ) : (
        <MainCard content={false}>
          <CardContent>
            <Grid container spacing={gridSpacing}>
              <Grid size={12}>
                <Grid container sx={{ alignContent: 'center', justifyContent: 'space-between' }}>
                  <Grid>
                    <Typography variant="h4">Últimas ventas</Typography>
                  </Grid>
                  <Grid>
                    <Typography variant="subtitle2" color="text.secondary">
                      Hoy
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid size={12} sx={{ mt: -1 }}>
                {ultimasVentas.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    Sin ventas registradas hoy
                  </Typography>
                ) : (
                  ultimasVentas.map((venta, index) => (
                    <div key={venta.id}>
                      <Grid container direction="column">
                        <Grid>
                          <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                            <Grid>
                              <Grid container sx={{ alignItems: 'center', gap: 1 }}>
                                <Avatar
                                  variant="rounded"
                                  sx={{ width: 32, height: 32, bgcolor: 'primary.light', color: 'primary.dark' }}
                                >
                                  <ReceiptOutlinedIcon sx={{ fontSize: 16 }} />
                                </Avatar>
                                <Typography variant="subtitle1">{venta.cliente}</Typography>
                              </Grid>
                            </Grid>
                            <Grid>
                              <Grid container direction="column" sx={{ alignItems: 'flex-end' }}>
                                <Typography variant="subtitle1">{formatCurrency(venta.monto)}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {venta.items} {venta.items === 1 ? 'item' : 'items'} · {venta.hora}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                      {index < ultimasVentas.length - 1 && <Divider sx={{ my: 1.5 }} />}
                    </div>
                  ))
                )}
              </Grid>
            </Grid>
          </CardContent>
          <CardActions sx={{ p: 1.25, pt: 0, justifyContent: 'center' }}>
            <Button size="small" disableElevation endIcon={<ChevronRightOutlinedIcon />}>
              Ver todas las ventas
            </Button>
          </CardActions>
        </MainCard>
      )}
    </>
  );
}

PopularCard.propTypes = {
  isLoading: PropTypes.bool,
  ultimasVentas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      cliente: PropTypes.string,
      monto: PropTypes.number,
      items: PropTypes.number,
      hora: PropTypes.string
    })
  )
};
