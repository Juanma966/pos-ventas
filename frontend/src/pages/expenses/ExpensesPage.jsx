import { useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import AddIcon from '@mui/icons-material/Add';

import MainCard from 'components/cards/MainCard';
import { useFixedExpenses } from 'hooks/useFixedExpenses';
import useNotification from 'hooks/useNotification';
import { fixedExpenseService } from 'services/fixedExpenseService';
import formatCurrency from 'utils/formatCurrency';
import ExpenseTable from './components/ExpenseTable';
import ExpenseFormModal from './components/ExpenseFormModal';

export default function ExpensesPage() {
  const { expenses, isLoading, mutate } = useFixedExpenses();
  const { notify } = useNotification();

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, expense: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const totalActivo = expenses.filter((e) => e.active).reduce((acc, e) => acc + Number(e.amount), 0);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setError('');
    try {
      if (selected) {
        await fixedExpenseService.update(selected.id, data);
        notify.success('Gasto actualizado');
      } else {
        await fixedExpenseService.create(data);
        notify.success('Gasto creado');
      }
      await mutate();
      setModalOpen(false);
      setSelected(null);
    } catch (err) {
      setError(err.response?.data?.message ?? 'No se pudo guardar el gasto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.expense) return;
    setIsDeleting(true);
    try {
      await fixedExpenseService.remove(deleteDialog.expense.id);
      await mutate();
      setDeleteDialog({ open: false, expense: null });
      notify.success('Gasto eliminado');
    } catch (err) {
      notify.error(err.response?.data?.message ?? 'No se pudo eliminar el gasto');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <MainCard>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <div>
          <Typography variant="h3">Gastos fijos</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Total mensual (activos): <strong>{formatCurrency(totalActivo)}</strong>
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelected(null);
            setError('');
            setModalOpen(true);
          }}
        >
          Nuevo gasto
        </Button>
      </Stack>

      <ExpenseTable
        expenses={expenses}
        isLoading={isLoading}
        onEdit={(expense) => {
          setSelected(expense);
          setError('');
          setModalOpen(true);
        }}
        onDelete={(expense) => setDeleteDialog({ open: true, expense })}
      />

      <ExpenseFormModal
        open={modalOpen}
        onClose={() => {
          if (!isSubmitting) {
            setModalOpen(false);
            setSelected(null);
          }
        }}
        onSubmit={handleSubmit}
        expense={selected}
        isSubmitting={isSubmitting}
        error={error}
      />

      <Dialog open={deleteDialog.open} onClose={() => !isDeleting && setDeleteDialog({ open: false, expense: null })}>
        <DialogTitle>Eliminar gasto fijo</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Eliminar <strong>{deleteDialog.expense?.name}</strong>? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, expense: null })} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={isDeleting}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
