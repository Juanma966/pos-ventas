import useMediaQuery from '@mui/material/useMediaQuery';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import AuthWrapper1 from './AuthWrapper1';
import AuthCardWrapper from './AuthCardWrapper';
import AuthLogin from '../auth-forms/AuthLogin';
import Logo from 'components/Logo';

export default function Login() {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));

  return (
    <AuthWrapper1>
      <Grid container direction="column" sx={{ justifyContent: 'flex-end', minHeight: '100vh' }}>
        <Grid size={12}>
          <Grid container sx={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <Grid sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
              <AuthCardWrapper>
                <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Grid sx={{ mb: 3 }}>
                    <Logo />
                  </Grid>
                  <Grid size={12}>
                    <Stack spacing={1} sx={{ alignItems: 'center' }}>
                      <Typography gutterBottom variant={downMD ? 'h3' : 'h2'} sx={{ color: 'secondary.main' }}>
                        Bienvenido
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '16px', textAlign: 'center' }}>
                        Ingresá tus credenciales para continuar
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid size={12}>
                    <AuthLogin />
                  </Grid>
                </Grid>
              </AuthCardWrapper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </AuthWrapper1>
  );
}
