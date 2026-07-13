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
  position: z.string().max(80).optional().or(z.literal('')),
  salary: z.coerce.number().min(0, 'El sueldo no puede ser negativo'),
  active: z.boolean(),
});

const defaultValues = { name: '', position: '', salary: 0, active: true };

export default function EmployeeFormModal({ open, onClose, onSubmit, employee, isSubmitting, error }) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    reset(employee
      ? { name: employee.name, position: employee.position ?? '', salary: Number(employee.salary), active: employee.active }
      : defaultValues
    );
  }, [employee, reset, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle>{employee ? 'Editar empleado' : 'Nuevo empleado'}</DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12, sm: 7 }}>
              <Controller name="name" control={control} render={({ field }) => (
                <TextField {...field} label="Nombre *" fullWidth error={!!errors.name} helperText={errors.name?.message} />
              )} />
            </Grid>
            <Grid size={{ xs: 12, sm: 5 }}>
              <Controller name="position" control={control} render={({ field }) => (
                <TextField {...field} label="Puesto" fullWidth error={!!errors.position} helperText={errors.position?.message} placeholder="Ej: Cajero" />
              )} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller name="salary" control={control} render={({ field }) => (
                <TextField {...field} label="Sueldo mensual" type="number" fullWidth inputProps={{ min: 0, step: 1000 }} error={!!errors.salary} helperText={errors.salary?.message} />
              )} />
            </Grid>
            <Grid size={12}>
              <Controller name="active" control={control} render={({ field }) => (
                <FormControlLabel control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Empleado activo" />
              )} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={16} /> : null}>
            {employee ? 'Guardar cambios' : 'Crear empleado'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

EmployeeFormModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  employee: PropTypes.object,
  isSubmitting: PropTypes.bool,
  error: PropTypes.string,
};
