import { useState } from 'react';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

import MainCard from 'components/cards/MainCard';
import useProducts from 'hooks/useProducts';
import { productService } from 'services/productService';
import ProductTable from './components/ProductTable';
import ProductFormModal from './components/ProductFormModal';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const { products, total, isLoading, mutate } = useProducts({
    search,
    page: page + 1,
    limit: rowsPerPage,
  });

  const handleOpenCreate = () => {
    setSelectedProduct(null);
    setSubmitError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setSubmitError('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      if (selectedProduct) {
        await productService.update(selectedProduct.id, data);
      } else {
        await productService.create(data);
      }
      await mutate();
      setModalOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      setSubmitError(err.response?.data?.message ?? 'Ocurrió un error, intentá de nuevo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.product) return;
    setIsDeleting(true);
    try {
      await productService.remove(deleteDialog.product.id);
      await mutate();
      setDeleteDialog({ open: false, product: null });
    } catch {
      // el error se puede mostrar en un snackbar futuro
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <MainCard>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h3">Productos</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            Nuevo producto
          </Button>
        </Stack>

        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent sx={{ pb: '12px !important' }}>
            <TextField
              placeholder="Buscar por nombre o código de barras..."
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

        <ProductTable
          products={products}
          total={total}
          page={page}
          rowsPerPage={rowsPerPage}
          isLoading={isLoading}
          onEdit={handleOpenEdit}
          onDelete={(product) => setDeleteDialog({ open: true, product })}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </MainCard>

      <ProductFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        product={selectedProduct}
        isSubmitting={isSubmitting}
        error={submitError}
      />

      <Dialog open={deleteDialog.open} onClose={() => !isDeleting && setDeleteDialog({ open: false, product: null })}>
        <DialogTitle>Eliminar producto</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro que querés eliminar <strong>{deleteDialog.product?.name}</strong>? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, product: null })} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={isDeleting}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
