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
import useEmployees from 'hooks/useEmployees';
import { employeeService } from 'services/employeeService';
import EmployeeTable from './components/EmployeeTable';
import EmployeeFormModal from './components/EmployeeFormModal';
import EmployeeDetailModal from './components/EmployeeDetailModal';

export default function EmployeesPage() {
  const { employees, isLoading, mutate } = useEmployees();

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [movError, setMovError] = useState('');
  const [movSubmitting, setMovSubmitting] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState({ open: false, employee: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setFormError('');
    try {
      if (selected) await employeeService.update(selected.id, data);
      else await employeeService.create(data);
      await mutate();
      setFormOpen(false);
      setSelected(null);
    } catch (err) {
      setFormError(err.response?.data?.message ?? 'No se pudo guardar el empleado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleView = async (employee) => {
    setDetailOpen(true);
    setDetail(null);
    setMovError('');
    try {
      setDetail(await employeeService.getById(employee.id));
    } catch {
      setDetailOpen(false);
    }
  };

  // Devuelve true si el movimiento se registró (para limpiar el form del modal).
  const handleAddMovement = async (data) => {
    setMovSubmitting(true);
    setMovError('');
    try {
      const updated = await employeeService.addMovement(detail.id, data);
      setDetail(updated);
      await mutate();
      return true;
    } catch (err) {
      setMovError(err.response?.data?.message ?? 'No se pudo registrar el movimiento');
      return false;
    } finally {
      setMovSubmitting(false);
    }
  };

  const handleRemoveMovement = async (movementId) => {
    setMovSubmitting(true);
    setMovError('');
    try {
      const updated = await employeeService.removeMovement(detail.id, movementId);
      setDetail(updated);
      await mutate();
    } catch (err) {
      setMovError(err.response?.data?.message ?? 'No se pudo eliminar el movimiento');
    } finally {
      setMovSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.employee) return;
    setIsDeleting(true);
    try {
      await employeeService.remove(deleteDialog.employee.id);
      await mutate();
      setDeleteDialog({ open: false, employee: null });
    } catch {
      // feedback en mejora futura
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <MainCard>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h3">Personal</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setSelected(null); setFormError(''); setFormOpen(true); }}>
          Nuevo empleado
        </Button>
      </Stack>

      <EmployeeTable
        employees={employees}
        isLoading={isLoading}
        onView={handleView}
        onEdit={(employee) => { setSelected(employee); setFormError(''); setFormOpen(true); }}
        onDelete={(employee) => setDeleteDialog({ open: true, employee })}
      />

      <EmployeeFormModal
        open={formOpen}
        onClose={() => { if (!isSubmitting) { setFormOpen(false); setSelected(null); } }}
        onSubmit={handleSubmit}
        employee={selected}
        isSubmitting={isSubmitting}
        error={formError}
      />

      <EmployeeDetailModal
        open={detailOpen}
        employee={detail}
        onClose={() => { setDetailOpen(false); setDetail(null); }}
        onAddMovement={handleAddMovement}
        onRemoveMovement={handleRemoveMovement}
        isSubmitting={movSubmitting}
        error={movError}
      />

      <Dialog open={deleteDialog.open} onClose={() => !isDeleting && setDeleteDialog({ open: false, employee: null })}>
        <DialogTitle>Eliminar empleado</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Eliminar a <strong>{deleteDialog.employee?.name}</strong>? Se borrarán también sus movimientos. Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, employee: null })} disabled={isDeleting}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={isDeleting}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
