import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import MainCard from 'components/cards/MainCard';
import useSuppliers from 'hooks/useSuppliers';
import useProducts from 'hooks/useProducts';
import { usePurchase } from 'hooks/usePurchases';
import { purchaseService } from 'services/purchaseService';
import formatCurrency from 'utils/formatCurrency';
import PurchaseItemsEditor from './components/PurchaseItemsEditor';
import PurchaseDetailView from './components/PurchaseDetailView';

const schema = z.object({
  supplierId: z.coerce.number({ invalid_type_error: 'Seleccioná un proveedor' }).int().positive('Seleccioná un proveedor'),
  notes: z.string().max(500).optional().or(z.literal('')),
  items: z.array(z.object({
    productId: z.coerce.number({ invalid_type_error: 'Seleccioná un producto' }).int().positive('Seleccioná un producto'),
    quantity: z.coerce.number().int('Cantidad inválida').positive('Debe ser mayor a 0'),
    cost: z.coerce.number().min(0, 'No puede ser negativo'),
  })).min(1, 'Agregá al menos un producto'),
});

const emptyItem = { productId: '', quantity: 1, cost: 0 };
const defaultValues = { supplierId: '', notes: '', items: [emptyItem] };

const folio = (id) => `OC-${String(id).padStart(4, '0')}`;

export default function PurchaseFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const { purchase, isLoading, mutate } = usePurchase(isNew ? null : id);
  const { suppliers } = useSuppliers({ limit: 1000 });
  const { products } = useProducts({ active: 'true', limit: 1000 });

  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirm, setConfirm] = useState(null); // { title, message, action }
  const [actionLoading, setActionLoading] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const itemsWatch = useWatch({ control, name: 'items' });
  const total = (itemsWatch ?? []).reduce(
    (acc, i) => acc + (Number(i?.quantity) || 0) * (Number(i?.cost) || 0),
    0
  );

  const editable = isNew || purchase?.status === 'PENDING';

  useEffect(() => {
    if (purchase) {
      reset({
        supplierId: purchase.supplierId,
        notes: purchase.notes ?? '',
        items: purchase.items.map((i) => ({ productId: i.productId, quantity: i.quantity, cost: Number(i.cost) })),
      });
    }
  }, [purchase, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      if (isNew) {
        await purchaseService.create(data);
      } else {
        await purchaseService.update(id, data);
      }
      navigate('/compras');
    } catch (err) {
      setSubmitError(err.response?.data?.message ?? 'Ocurrió un error, intentá de nuevo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const runAction = async (fn, redirectToList = false) => {
    setActionLoading(true);
    setSubmitError('');
    try {
      await fn();
      if (redirectToList) {
        navigate('/compras');
      } else {
        await mutate();
      }
      setConfirm(null);
    } catch (err) {
      setSubmitError(err.response?.data?.message ?? 'Ocurrió un error, intentá de nuevo');
      setConfirm(null);
    } finally {
      setActionLoading(false);
    }
  };

  const title = isNew ? 'Nueva compra' : folio(Number(id));

  if (!isNew && isLoading) {
    return (
      <MainCard>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      </MainCard>
    );
  }

  return (
    <MainCard>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/compras')}>Volver</Button>
          <Typography variant="h3">{title}</Typography>
        </Stack>
      </Stack>

      {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

      {/* Vista de solo lectura para órdenes recibidas o canceladas */}
      {!editable && purchase && (
        <PurchaseDetailView purchase={purchase} />
      )}

      {/* Formulario editable: alta o edición de orden pendiente */}
      {editable && (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="supplierId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Proveedor *"
                    fullWidth
                    error={!!errors.supplierId}
                    helperText={errors.supplierId?.message}
                  >
                    {suppliers.map((s) => (
                      <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Notas" fullWidth error={!!errors.notes} helperText={errors.notes?.message} />
                )}
              />
            </Grid>
          </Grid>

          <PurchaseItemsEditor
            control={control}
            fields={fields}
            append={append}
            remove={remove}
            products={products}
            errors={errors}
          />

          <Divider sx={{ my: 3 }} />

          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
            <Typography variant="h4">Total: {formatCurrency(total)}</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {!isNew && (
                <>
                  <Button
                    color="error"
                    onClick={() => setConfirm({
                      title: 'Eliminar compra',
                      message: '¿Eliminar esta orden de compra? Esta acción no se puede deshacer.',
                      action: () => runAction(() => purchaseService.remove(id), true),
                    })}
                    disabled={isSubmitting || actionLoading}
                  >
                    Eliminar
                  </Button>
                  <Button
                    onClick={() => setConfirm({
                      title: 'Cancelar compra',
                      message: '¿Cancelar esta orden? Quedará registrada como cancelada.',
                      action: () => runAction(() => purchaseService.cancel(id)),
                    })}
                    disabled={isSubmitting || actionLoading}
                  >
                    Cancelar orden
                  </Button>
                  <Button
                    color="success"
                    variant="outlined"
                    onClick={() => setConfirm({
                      title: 'Recibir mercadería',
                      message: 'Al recibir se sumará el stock de cada producto y se actualizará su costo. Esta acción no se puede deshacer.',
                      action: () => runAction(() => purchaseService.receive(id)),
                    })}
                    disabled={isSubmitting || actionLoading}
                  >
                    Recibir mercadería
                  </Button>
                </>
              )}
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting || actionLoading}
                startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
              >
                {isNew ? 'Crear compra' : 'Guardar cambios'}
              </Button>
            </Stack>
          </Stack>
        </form>
      )}

      <Dialog open={!!confirm} onClose={() => !actionLoading && setConfirm(null)}>
        <DialogTitle>{confirm?.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirm?.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)} disabled={actionLoading}>Volver</Button>
          <Button onClick={() => confirm?.action()} variant="contained" disabled={actionLoading}>Confirmar</Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
