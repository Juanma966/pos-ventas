import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid2';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';

const ROLE_LABELS = { admin: 'Administrador', cajero: 'Cajero', vendedor: 'Vendedor' };

// La contraseña es requerida al crear; al editar es opcional (se deja vacía para no cambiarla).
const makeSchema = (isEdit) => z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  email: z.string().email('Email inválido'),
  password: isEdit
    ? z.string().max(100).optional().or(z.literal(''))
    : z.string().min(6, 'Mínimo 6 caracteres'),
  roleId: z.coerce.number({ invalid_type_error: 'Seleccioná un rol' }).int().positive('Seleccioná un rol'),
  active: z.boolean(),
});

const defaultValues = { name: '', email: '', password: '', roleId: '', active: true };

export default function UserFormModal({ open, onClose, onSubmit, user, roles, isSubmitting, error }) {
  const isEdit = !!user;
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(makeSchema(isEdit)),
    defaultValues,
  });

  useEffect(() => {
    reset(user
      ? { name: user.name, email: user.email, password: '', roleId: user.role.id, active: user.active }
      : defaultValues
    );
  }, [user, reset, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle>{isEdit ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={12}>
              <Controller name="name" control={control} render={({ field }) => (
                <TextField {...field} label="Nombre *" fullWidth error={!!errors.name} helperText={errors.name?.message} />
              )} />
            </Grid>
            <Grid size={{ xs: 12, sm: 7 }}>
              <Controller name="email" control={control} render={({ field }) => (
                <TextField {...field} label="Email *" type="email" fullWidth error={!!errors.email} helperText={errors.email?.message} />
              )} />
            </Grid>
            <Grid size={{ xs: 12, sm: 5 }}>
              <Controller name="roleId" control={control} render={({ field }) => (
                <TextField {...field} select label="Rol *" fullWidth error={!!errors.roleId} helperText={errors.roleId?.message}>
                  {roles.map((r) => (
                    <MenuItem key={r.id} value={r.id}>{ROLE_LABELS[r.name] ?? r.name}</MenuItem>
                  ))}
                </TextField>
              )} />
            </Grid>
            <Grid size={12}>
              <Controller name="password" control={control} render={({ field }) => (
                <TextField
                  {...field}
                  label={isEdit ? 'Nueva contraseña' : 'Contraseña *'}
                  type="password"
                  fullWidth
                  error={!!errors.password}
                  helperText={errors.password?.message ?? (isEdit ? 'Dejar vacío para no cambiarla' : 'Mínimo 6 caracteres')}
                />
              )} />
            </Grid>
            <Grid size={12}>
              <Controller name="active" control={control} render={({ field }) => (
                <FormControlLabel control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Usuario activo" />
              )} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={16} /> : null}>
            {isEdit ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

UserFormModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  user: PropTypes.object,
  roles: PropTypes.array.isRequired,
  isSubmitting: PropTypes.bool,
  error: PropTypes.string,
};
