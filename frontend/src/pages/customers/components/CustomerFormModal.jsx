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
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
  document: z.string().max(20).optional().or(z.literal('')),
  address: z.string().max(200).optional().or(z.literal('')),
  creditLimit: z.coerce.number().min(0, 'El límite no puede ser negativo'),
  notes: z.string().max(500).optional().or(z.literal('')),
  active: z.boolean(),
});

const defaultValues = { name: '', email: '', phone: '', document: '', address: '', creditLimit: 0, notes: '', active: true };

export default function CustomerFormModal({ open, onClose, onSubmit, customer, isSubmitting, error }) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    reset(customer
      ? { name: customer.name, email: customer.email ?? '', phone: customer.phone ?? '', document: customer.document ?? '', address: customer.address ?? '', creditLimit: Number(customer.creditLimit), notes: customer.notes ?? '', active: customer.active }
      : defaultValues
    );
  }, [customer, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle>{customer ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <Controller name="name" control={control} render={({ field }) => (
                <TextField {...field} label="Nombre completo *" fullWidth error={!!errors.name} helperText={errors.name?.message} />
              )} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller name="document" control={control} render={({ field }) => (
                <TextField {...field} label="DNI / CUIT" fullWidth error={!!errors.document} helperText={errors.document?.message} />
              )} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller name="email" control={control} render={({ field }) => (
                <TextField {...field} label="Email" type="email" fullWidth error={!!errors.email} helperText={errors.email?.message} />
              )} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller name="phone" control={control} render={({ field }) => (
                <TextField {...field} label="Teléfono" fullWidth error={!!errors.phone} helperText={errors.phone?.message} />
              )} />
            </Grid>
            <Grid size={12}>
              <Controller name="address" control={control} render={({ field }) => (
                <TextField {...field} label="Dirección" fullWidth error={!!errors.address} helperText={errors.address?.message} />
              )} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller name="creditLimit" control={control} render={({ field }) => (
                <TextField {...field} label="Límite de crédito" type="number" fullWidth inputProps={{ min: 0, step: 100 }} error={!!errors.creditLimit} helperText={errors.creditLimit?.message} />
              )} />
            </Grid>
            <Grid size={12}>
              <Controller name="notes" control={control} render={({ field }) => (
                <TextField {...field} label="Notas" fullWidth multiline rows={2} error={!!errors.notes} helperText={errors.notes?.message} />
              )} />
            </Grid>
            <Grid size={12}>
              <Controller name="active" control={control} render={({ field }) => (
                <FormControlLabel control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Cliente activo" />
              )} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={16} /> : null}>
            {customer ? 'Guardar cambios' : 'Crear cliente'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

CustomerFormModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  customer: PropTypes.object,
  isSubmitting: PropTypes.bool,
  error: PropTypes.string,
};
