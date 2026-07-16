import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(80),
  description: z.string().max(300).optional().or(z.literal('')),
  active: z.boolean()
});

// Formulario reutilizable para entidades simples del catálogo (categorías, marcas).
export default function CatalogFormModal({ open, onClose, onSubmit, entity, singular, isSubmitting, error }) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', active: true }
  });

  useEffect(() => {
    if (entity) {
      reset({ name: entity.name, description: entity.description ?? '', active: entity.active });
    } else {
      reset({ name: '', description: '', active: true });
    }
  }, [entity, reset]);

  const isEditing = Boolean(entity);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle>{isEditing ? `Editar ${singular}` : `Nueva ${singular}`}</DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Nombre *" fullWidth autoFocus error={!!errors.name} helperText={errors.name?.message} />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Descripción"
                  fullWidth
                  multiline
                  rows={2}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label="Activa"
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
          >
            {isEditing ? 'Guardar cambios' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

CatalogFormModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  entity: PropTypes.object,
  singular: PropTypes.string.isRequired,
  isSubmitting: PropTypes.bool,
  error: PropTypes.string
};
