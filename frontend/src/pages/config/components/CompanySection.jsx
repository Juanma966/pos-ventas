import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';

import MainCard from 'components/cards/MainCard';
import useCompany from 'hooks/useCompany';
import { settingsService } from 'services/settingsService';

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  address: z.string().max(200).optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
  taxId: z.string().max(20).optional().or(z.literal('')),
  ticketFooter: z.string().max(200).optional().or(z.literal('')),
});

const defaultValues = { name: '', address: '', phone: '', taxId: '', ticketFooter: '' };

export default function CompanySection() {
  const { company, isLoading, mutate } = useCompany();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    if (company) {
      reset({
        name: company.name ?? '',
        address: company.address ?? '',
        phone: company.phone ?? '',
        taxId: company.taxId ?? '',
        ticketFooter: company.ticketFooter ?? '',
      });
    }
  }, [company, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError('');
    try {
      await settingsService.updateCompany(data);
      await mutate();
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message ?? 'No se pudo guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>;
  }

  return (
    <MainCard title="Datos del negocio">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <Controller name="name" control={control} render={({ field }) => (
              <TextField {...field} label="Nombre / Razón social *" fullWidth error={!!errors.name} helperText={errors.name?.message} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller name="taxId" control={control} render={({ field }) => (
              <TextField {...field} label="CUIT" fullWidth error={!!errors.taxId} helperText={errors.taxId?.message} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 8 }}>
            <Controller name="address" control={control} render={({ field }) => (
              <TextField {...field} label="Dirección" fullWidth error={!!errors.address} helperText={errors.address?.message} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller name="phone" control={control} render={({ field }) => (
              <TextField {...field} label="Teléfono" fullWidth error={!!errors.phone} helperText={errors.phone?.message} />
            )} />
          </Grid>
          <Grid size={12}>
            <Controller name="ticketFooter" control={control} render={({ field }) => (
              <TextField {...field} label="Pie del ticket" fullWidth error={!!errors.ticketFooter} helperText={errors.ticketFooter?.message ?? 'Mensaje al final del comprobante'} />
            )} />
          </Grid>
        </Grid>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={16} /> : null}>
            Guardar cambios
          </Button>
        </Box>
      </form>

      <Snackbar open={saved} autoHideDuration={3000} onClose={() => setSaved(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" onClose={() => setSaved(false)}>Datos del negocio guardados</Alert>
      </Snackbar>
    </MainCard>
  );
}
