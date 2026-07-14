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
import Grid from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';

import useCategories from 'hooks/useCategories';
import useBrands from 'hooks/useBrands';
import resizeImage from 'utils/resizeImage';

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  image: z.string().nullable().optional(),
  description: z.string().max(500).optional().or(z.literal('')),
  barcode: z.string().max(50).optional().or(z.literal('')),
  price: z.coerce.number({ invalid_type_error: 'Ingresá un precio válido' }).positive('El precio debe ser mayor a 0'),
  cost: z.coerce.number({ invalid_type_error: 'Ingresá un costo válido' }).min(0, 'El costo no puede ser negativo'),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo'),
  minStock: z.coerce.number().int().min(0, 'El stock mínimo no puede ser negativo'),
  categoryId: z.coerce.number({ invalid_type_error: 'Seleccioná una categoría' }).positive('Seleccioná una categoría'),
  brandId: z.coerce.number().optional().nullable(),
  active: z.boolean(),
});

export default function ProductFormModal({ open, onClose, onSubmit, product, isSubmitting, error }) {
  const { categories } = useCategories();
  const { brands } = useBrands();

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '', image: null, description: '', barcode: '', price: '', cost: '',
      stock: 0, minStock: 5, categoryId: '', brandId: null, active: true,
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        image: product.image ?? null,
        description: product.description ?? '',
        barcode: product.barcode ?? '',
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        minStock: product.minStock,
        categoryId: product.categoryId,
        brandId: product.brandId ?? null,
        active: product.active,
      });
    } else {
      reset({ name: '', image: null, description: '', barcode: '', price: '', cost: '', stock: 0, minStock: 5, categoryId: '', brandId: null, active: true });
    }
  }, [product, reset]);

  const isEditing = Boolean(product);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle>{isEditing ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={12}>
              <Controller name="image" control={control} render={({ field }) => (
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar variant="rounded" src={field.value || undefined} sx={{ width: 72, height: 72 }}>
                    <ImageOutlinedIcon />
                  </Avatar>
                  <Stack direction="row" spacing={1}>
                    <Button component="label" size="small" startIcon={<PhotoCameraOutlinedIcon />}>
                      {field.value ? 'Cambiar imagen' : 'Agregar imagen'}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            field.onChange(await resizeImage(file, 400));
                          } catch {
                            /* imagen inválida: se ignora */
                          }
                          e.target.value = '';
                        }}
                      />
                    </Button>
                    {field.value && (
                      <Button size="small" color="error" onClick={() => field.onChange(null)}>Quitar</Button>
                    )}
                  </Stack>
                </Stack>
              )} />
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }}>
              <Controller name="name" control={control} render={({ field }) => (
                <TextField {...field} label="Nombre *" fullWidth error={!!errors.name} helperText={errors.name?.message} />
              )} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller name="barcode" control={control} render={({ field }) => (
                <TextField {...field} label="Código de barras" fullWidth error={!!errors.barcode} helperText={errors.barcode?.message} />
              )} />
            </Grid>
            <Grid size={12}>
              <Controller name="description" control={control} render={({ field }) => (
                <TextField {...field} label="Descripción" fullWidth multiline rows={2} error={!!errors.description} helperText={errors.description?.message} />
              )} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller name="price" control={control} render={({ field }) => (
                <TextField {...field} label="Precio de venta *" type="number" fullWidth inputProps={{ min: 0, step: 0.01 }} error={!!errors.price} helperText={errors.price?.message} />
              )} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller name="cost" control={control} render={({ field }) => (
                <TextField {...field} label="Costo *" type="number" fullWidth inputProps={{ min: 0, step: 0.01 }} error={!!errors.cost} helperText={errors.cost?.message} />
              )} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller name="stock" control={control} render={({ field }) => (
                <TextField {...field} label="Stock actual *" type="number" fullWidth inputProps={{ min: 0 }} error={!!errors.stock} helperText={errors.stock?.message} />
              )} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller name="minStock" control={control} render={({ field }) => (
                <TextField {...field} label="Stock mínimo *" type="number" fullWidth inputProps={{ min: 0 }} error={!!errors.minStock} helperText={errors.minStock?.message} />
              )} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller name="categoryId" control={control} render={({ field }) => (
                <TextField {...field} select label="Categoría *" fullWidth error={!!errors.categoryId} helperText={errors.categoryId?.message}>
                  {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </TextField>
              )} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller name="brandId" control={control} render={({ field }) => (
                <TextField {...field} select label="Marca" fullWidth value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value || null)}>
                  <MenuItem value="">Sin marca</MenuItem>
                  {brands.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
                </TextField>
              )} />
            </Grid>
            <Grid size={12}>
              <Controller name="active" control={control} render={({ field }) => (
                <FormControlLabel control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Producto activo" />
              )} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={16} /> : null}>
            {isEditing ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

ProductFormModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  product: PropTypes.object,
  isSubmitting: PropTypes.bool,
  error: PropTypes.string,
};
