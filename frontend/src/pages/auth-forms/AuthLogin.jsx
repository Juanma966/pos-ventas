import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';

import { useTheme } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';

import AnimateButton from 'components/extended/AnimateButton';
import useAuth from 'hooks/useAuth';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const schema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres')
});

export default function AuthLogin() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await login(data.email, data.password);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Error al iniciar sesión');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {serverError}
        </Alert>
      )}

      <FormControl fullWidth error={!!errors.email} sx={{ ...theme.typography.customInput }}>
        <InputLabel htmlFor="email">Correo electrónico</InputLabel>
        <OutlinedInput id="email" type="email" {...register('email')} />
        {errors.email && <FormHelperText>{errors.email.message}</FormHelperText>}
      </FormControl>

      <FormControl fullWidth error={!!errors.password} sx={{ ...theme.typography.customInput }}>
        <InputLabel htmlFor="password">Contraseña</InputLabel>
        <OutlinedInput
          id="password"
          type={showPassword ? 'text' : 'password'}
          {...register('password')}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                onMouseDown={(e) => e.preventDefault()}
                edge="end"
                size="large"
              >
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          }
        />
        {errors.password && <FormHelperText>{errors.password.message}</FormHelperText>}
      </FormControl>

      <Box sx={{ mt: 2 }}>
        <AnimateButton>
          <Button color="secondary" disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained">
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </AnimateButton>
      </Box>
    </form>
  );
}
