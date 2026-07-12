import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import MainCard from 'components/cards/MainCard';
import useBranches from 'hooks/useBranches';
import { branchService } from 'services/branchService';
import BranchFormModal from './BranchFormModal';

export default function BranchesSection() {
  const { branches, isLoading, mutate } = useBranches();

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, branch: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setError('');
    try {
      if (selected) await branchService.update(selected.id, data);
      else await branchService.create(data);
      await mutate();
      setModalOpen(false);
      setSelected(null);
    } catch (err) {
      setError(err.response?.data?.message ?? 'No se pudo guardar la sucursal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.branch) return;
    setIsDeleting(true);
    try {
      await branchService.remove(deleteDialog.branch.id);
      await mutate();
      setDeleteDialog({ open: false, branch: null });
    } catch {
      // feedback de error en mejora futura
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <MainCard
      title="Sucursales"
      secondary={
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => { setSelected(null); setError(''); setModalOpen(true); }}>
          Nueva sucursal
        </Button>
      }
    >
      {isLoading ? (
        <Stack spacing={1}>{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={40} />)}</Stack>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Dirección</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {branches.map((branch) => (
              <TableRow key={branch.id} hover>
                <TableCell><Typography variant="body2" fontWeight={500}>{branch.name}</Typography></TableCell>
                <TableCell>{branch.address ?? '—'}</TableCell>
                <TableCell>{branch.phone ?? '—'}</TableCell>
                <TableCell align="center">
                  <Chip label={branch.active ? 'Activa' : 'Inactiva'} color={branch.active ? 'success' : 'default'} size="small" />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => { setSelected(branch); setError(''); setModalOpen(true); }}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, branch })}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {branches.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Box sx={{ py: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">No hay sucursales cargadas</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <BranchFormModal
        open={modalOpen}
        onClose={() => { if (!isSubmitting) { setModalOpen(false); setSelected(null); } }}
        onSubmit={handleSubmit}
        branch={selected}
        isSubmitting={isSubmitting}
        error={error}
      />

      <Dialog open={deleteDialog.open} onClose={() => !isDeleting && setDeleteDialog({ open: false, branch: null })}>
        <DialogTitle>Eliminar sucursal</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Eliminar la sucursal <strong>{deleteDialog.branch?.name}</strong>? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, branch: null })} disabled={isDeleting}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={isDeleting}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
