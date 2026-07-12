import { useState } from 'react';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import TuneIcon from '@mui/icons-material/Tune';

import MainCard from 'components/cards/MainCard';
import useInventory from 'hooks/useInventory';
import useProducts from 'hooks/useProducts';
import { inventoryService } from 'services/inventoryService';
import MovementsTable from './components/MovementsTable';
import AdjustmentModal from './components/AdjustmentModal';

const TYPE_OPTIONS = [
  { value: '', label: 'Todos los tipos' },
  { value: 'PURCHASE', label: 'Compras' },
  { value: 'SALE', label: 'Ventas' },
  { value: 'SALE_CANCEL', label: 'Anulaciones' },
  { value: 'RETURN', label: 'Devoluciones' },
  { value: 'ADJUSTMENT', label: 'Ajustes' },
];

export default function InventoryPage() {
  const [productId, setProductId] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { products } = useProducts({ active: 'true', limit: 1000 });
  const { movements, total, isLoading, mutate } = useInventory({
    productId: productId || undefined,
    type: type || undefined,
    page: page + 1,
    limit: rowsPerPage,
  });

  const handleAdjust = async (payload) => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await inventoryService.createAdjustment(payload);
      await mutate();
      setModalOpen(false);
    } catch (err) {
      setSubmitError(err.response?.data?.message ?? 'No se pudo registrar el ajuste');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainCard>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h3">Inventario</Typography>
        <Button variant="contained" startIcon={<TuneIcon />} onClick={() => { setSubmitError(''); setModalOpen(true); }}>
          Ajustar stock
        </Button>
      </Stack>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent sx={{ pb: '12px !important' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              label="Producto"
              value={productId}
              onChange={(e) => { setProductId(e.target.value); setPage(0); }}
              size="small"
              sx={{ width: { xs: '100%', sm: 300 } }}
            >
              <MenuItem value="">Todos los productos</MenuItem>
              {products.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Tipo"
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(0); }}
              size="small"
              sx={{ width: { xs: '100%', sm: 200 } }}
            >
              {TYPE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      <MovementsTable
        movements={movements}
        total={total}
        page={page}
        rowsPerPage={rowsPerPage}
        isLoading={isLoading}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
      />

      <AdjustmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAdjust}
        isSubmitting={isSubmitting}
        error={submitError}
      />
    </MainCard>
  );
}
