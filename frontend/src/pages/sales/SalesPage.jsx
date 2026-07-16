import { useState } from 'react';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import SearchIcon from '@mui/icons-material/Search';

import MainCard from 'components/cards/MainCard';
import { useSales } from 'hooks/useSales';
import useNotification from 'hooks/useNotification';
import { saleService } from 'services/saleService';
import SalesTable from './components/SalesTable';
import SaleDetailModal from './components/SaleDetailModal';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'COMPLETED', label: 'Completadas' },
  { value: 'CANCELLED', label: 'Anuladas' }
];

export default function SalesPage() {
  const { notify } = useNotification();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [selectedSale, setSelectedSale] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [returnError, setReturnError] = useState('');

  const { sales, total, isLoading, mutate } = useSales({
    search,
    status: status || undefined,
    page: page + 1,
    limit: rowsPerPage
  });

  const handleView = async (sale) => {
    setModalOpen(true);
    setSelectedSale(null);
    try {
      const full = await saleService.getById(sale.id);
      setSelectedSale(full);
    } catch (err) {
      setModalOpen(false);
      notify.error(err.response?.data?.message ?? 'No se pudo cargar el detalle de la venta');
    }
  };

  const handleCancelSale = async (id) => {
    setIsCancelling(true);
    try {
      await saleService.cancel(id);
      await mutate();
      setModalOpen(false);
      setSelectedSale(null);
      notify.success('Venta anulada; el stock fue repuesto');
    } catch (err) {
      // el modal permanece abierto
      notify.error(err.response?.data?.message ?? 'No se pudo anular la venta');
    } finally {
      setIsCancelling(false);
    }
  };

  // Devuelve true si la devolución se registró (para que el modal se cierre).
  const handleReturn = async (id, payload) => {
    setIsReturning(true);
    setReturnError('');
    try {
      const updated = await saleService.createReturn(id, payload);
      setSelectedSale(updated);
      await mutate();
      notify.success('Devolución registrada');
      return true;
    } catch (err) {
      setReturnError(err.response?.data?.message ?? 'No se pudo registrar la devolución');
      return false;
    } finally {
      setIsReturning(false);
    }
  };

  return (
    <MainCard>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h3">Ventas</Typography>
      </Stack>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent sx={{ pb: '12px !important' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              placeholder="Buscar por cliente..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              size="small"
              sx={{ width: { xs: '100%', sm: 320 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              select
              label="Estado"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
              }}
              size="small"
              sx={{ width: { xs: '100%', sm: 200 } }}
            >
              {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      <SalesTable
        sales={sales}
        total={total}
        page={page}
        rowsPerPage={rowsPerPage}
        isLoading={isLoading}
        onView={handleView}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />

      <SaleDetailModal
        open={modalOpen}
        sale={selectedSale}
        onClose={() => {
          setModalOpen(false);
          setSelectedSale(null);
          setReturnError('');
        }}
        onCancelSale={handleCancelSale}
        isCancelling={isCancelling}
        onReturn={handleReturn}
        isReturning={isReturning}
        returnError={returnError}
      />
    </MainCard>
  );
}
