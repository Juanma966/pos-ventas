import { useState } from 'react';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

import MainCard from 'components/cards/MainCard';
import useSuppliers from 'hooks/useSuppliers';
import { supplierService } from 'services/supplierService';
import SupplierTable from './components/SupplierTable';
import SupplierFormModal from './components/SupplierFormModal';

export default function SuppliersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [deleteDialog, setDeleteDialog] = useState({ open: false, supplier: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const { suppliers, total, isLoading, mutate } = useSuppliers({
    search,
    page: page + 1,
    limit: rowsPerPage,
  });

  const handleOpenCreate = () => {
    setSelectedSupplier(null);
    setSubmitError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setSubmitError('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setModalOpen(false);
    setSelectedSupplier(null);
  };

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      if (selectedSupplier) {
        await supplierService.update(selectedSupplier.id, data);
      } else {
        await supplierService.create(data);
      }
      await mutate();
      setModalOpen(false);
      setSelectedSupplier(null);
    } catch (err) {
      setSubmitError(err.response?.data?.message ?? 'Ocurrió un error, intentá de nuevo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.supplier) return;
    setIsDeleting(true);
    try {
      await supplierService.remove(deleteDialog.supplier.id);
      await mutate();
      setDeleteDialog({ open: false, supplier: null });
    } catch {
      // snackbar de error en mejora futura
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <MainCard>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h3">Proveedores</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            Nuevo proveedor
          </Button>
        </Stack>

        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent sx={{ pb: '12px !important' }}>
            <TextField
              placeholder="Buscar por nombre, email, documento o contacto..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              size="small"
              sx={{ width: { xs: '100%', sm: 360 } }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
              }}
            />
          </CardContent>
        </Card>

        <SupplierTable
          suppliers={suppliers}
          total={total}
          page={page}
          rowsPerPage={rowsPerPage}
          isLoading={isLoading}
          onEdit={handleOpenEdit}
          onDelete={(supplier) => setDeleteDialog({ open: true, supplier })}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </MainCard>

      <SupplierFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        supplier={selectedSupplier}
        isSubmitting={isSubmitting}
        error={submitError}
      />

      <Dialog open={deleteDialog.open} onClose={() => !isDeleting && setDeleteDialog({ open: false, supplier: null })}>
        <DialogTitle>Eliminar proveedor</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro que querés eliminar a <strong>{deleteDialog.supplier?.name}</strong>? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, supplier: null })} disabled={isDeleting}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={isDeleting}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
