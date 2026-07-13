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

import { EXPENSE_CATEGORIES } from 'constants/app';

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  category: z.enum(['ALQUILER', 'SERVICIO', 'CREDITO', 'OTRO']),
  amount: z.coerce.number().min(0, 'El monto no puede ser negativo'),
  active: z.boolean(),
});

const defaultValues = { name: '', category: 'ALQUILER', amount: 0, active: true };

export default function ExpenseFormModal({ open, onClose, onSubmit, expense, isSubmitting, error }) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    reset(expense
      ? { name: expense.name, category: expense.category, amount: Number(expense.amount), active: expense.active }
      : defaultValues
    );
  }, [expense, reset, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle>{expense ? 'Editar gasto fijo' : 'Nuevo gasto fijo'}</DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={12}>
              <Controller name="name" control={control} render={({ field }) => (
                <TextField {...field} label="Nombre *" fullWidth error={!!errors.name} helperText={errors.name?.message} placeholder="Ej: Alquiler local, Luz, Internet..." />
              )} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller name="category" control={control} render={({ field }) => (
                <TextField {...field} select label="Categoría *" fullWidth error={!!errors.category} helperText={errors.category?.message}>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                  ))}
                </TextField>
              )} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller name="amount" control={control} render={({ field }) => (
                <TextField {...field} label="Monto mensual *" type="number" fullWidth inputProps={{ min: 0, step: 1000 }} error={!!errors.amount} helperText={errors.amount?.message} />
              )} />
            </Grid>
            <Grid size={12}>
              <Controller name="active" control={control} render={({ field }) => (
                <FormControlLabel control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Activo (se suma al total mensual)" />
              )} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={16} /> : null}>
            {expense ? 'Guardar cambios' : 'Crear gasto'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

ExpenseFormModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  expense: PropTypes.object,
  isSubmitting: PropTypes.bool,
  error: PropTypes.string,
};
