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
import useCustomers from 'hooks/useCustomers';
import { customerService } from 'services/customerService';
import CustomerTable from './components/CustomerTable';
import CustomerFormModal from './components/CustomerFormModal';

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [deleteDialog, setDeleteDialog] = useState({ open: false, customer: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const { customers, total, isLoading, mutate } = useCustomers({
    search,
    page: page + 1,
    limit: rowsPerPage,
  });

  const handleOpenCreate = () => {
    setSelectedCustomer(null);
    setSubmitError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (customer) => {
    setSelectedCustomer(customer);
    setSubmitError('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      if (selectedCustomer) {
        await customerService.update(selectedCustomer.id, data);
      } else {
        await customerService.create(data);
      }
      await mutate();
      setModalOpen(false);
      setSelectedCustomer(null);
    } catch (err) {
      setSubmitError(err.response?.data?.message ?? 'Ocurrió un error, intentá de nuevo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.customer) return;
    setIsDeleting(true);
    try {
      await customerService.remove(deleteDialog.customer.id);
      await mutate();
      setDeleteDialog({ open: false, customer: null });
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
          <Typography variant="h3">Clientes</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            Nuevo cliente
          </Button>
        </Stack>

        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent sx={{ pb: '12px !important' }}>
            <TextField
              placeholder="Buscar por nombre, email o documento..."
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

        <CustomerTable
          customers={customers}
          total={total}
          page={page}
          rowsPerPage={rowsPerPage}
          isLoading={isLoading}
          onEdit={handleOpenEdit}
          onDelete={(customer) => setDeleteDialog({ open: true, customer })}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </MainCard>

      <CustomerFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        customer={selectedCustomer}
        isSubmitting={isSubmitting}
        error={submitError}
      />

      <Dialog open={deleteDialog.open} onClose={() => !isDeleting && setDeleteDialog({ open: false, customer: null })}>
        <DialogTitle>Eliminar cliente</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro que querés eliminar a <strong>{deleteDialog.customer?.name}</strong>? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, customer: null })} disabled={isDeleting}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={isDeleting}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
