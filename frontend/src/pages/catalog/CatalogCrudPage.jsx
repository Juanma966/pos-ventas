import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import MainCard from 'components/cards/MainCard';
import CatalogFormModal from './CatalogFormModal';

// CRUD reutilizable para entidades simples del catálogo (categorías, marcas).
export default function CatalogCrudPage({ title, singular, swrKey, service }) {
  const { data, isLoading, mutate } = useSWR(swrKey, service.getAll);
  const items = data ?? [];

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [deleteDialog, setDeleteDialog] = useState({ open: false, entity: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.name.toLowerCase().includes(q));
  }, [items, search]);

  const handleOpenCreate = () => {
    setSelected(null);
    setSubmitError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (entity) => {
    setSelected(entity);
    setSubmitError('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setModalOpen(false);
    setSelected(null);
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      if (selected) {
        await service.update(selected.id, formData);
      } else {
        await service.create(formData);
      }
      await mutate();
      setModalOpen(false);
      setSelected(null);
    } catch (err) {
      setSubmitError(err.response?.data?.message ?? 'Ocurrió un error, intentá de nuevo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.entity) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await service.remove(deleteDialog.entity.id);
      await mutate();
      setDeleteDialog({ open: false, entity: null });
    } catch (err) {
      setDeleteError(err.response?.data?.message ?? 'No se pudo eliminar');
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteDialog = () => {
    if (isDeleting) return;
    setDeleteDialog({ open: false, entity: null });
    setDeleteError('');
  };

  return (
    <>
      <MainCard>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h3">{title}</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            Nueva {singular}
          </Button>
        </Stack>

        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent sx={{ pb: '12px !important' }}>
            <TextField
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              sx={{ width: { xs: '100%', sm: 360 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
          </CardContent>
        </Card>

        {isLoading ? (
          <TableContainer>
            <Table size="small">
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 4 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : filtered.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No se encontraron resultados
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((entity) => (
                  <TableRow key={entity.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {entity.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {entity.description || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={entity.active ? 'Activa' : 'Inactiva'} color={entity.active ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleOpenEdit(entity)}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, entity })}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </MainCard>

      <CatalogFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        entity={selected}
        singular={singular}
        isSubmitting={isSubmitting}
        error={submitError}
      />

      <Dialog open={deleteDialog.open} onClose={closeDeleteDialog}>
        <DialogTitle>Eliminar {singular}</DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {deleteError}
            </Alert>
          )}
          <DialogContentText>
            ¿Estás seguro que querés eliminar <strong>{deleteDialog.entity?.name}</strong>? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={isDeleting}>
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

CatalogCrudPage.propTypes = {
  title: PropTypes.string.isRequired,
  singular: PropTypes.string.isRequired,
  swrKey: PropTypes.string.isRequired,
  service: PropTypes.shape({
    getAll: PropTypes.func.isRequired,
    create: PropTypes.func.isRequired,
    update: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired
  }).isRequired
};
