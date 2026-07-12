import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import MainCard from 'components/cards/MainCard';
import { useUsers, useRoles } from 'hooks/useUsers';
import { userService } from 'services/userService';
import UserFormModal from './UserFormModal';

const ROLE_LABELS = { admin: 'Administrador', cajero: 'Cajero', vendedor: 'Vendedor' };

export default function UsersSection() {
  const { users, isLoading, mutate } = useUsers();
  const { roles } = useRoles();

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setError('');
    try {
      const payload = { ...data };
      if (selected && !payload.password) delete payload.password;
      if (selected) await userService.update(selected.id, payload);
      else await userService.create(payload);
      await mutate();
      setModalOpen(false);
      setSelected(null);
    } catch (err) {
      setError(err.response?.data?.message ?? 'No se pudo guardar el usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await userService.setActive(user.id, !user.active);
      await mutate();
    } catch {
      // el switch no cambia si falla; feedback en mejora futura
    }
  };

  return (
    <MainCard
      title="Usuarios"
      secondary={
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => { setSelected(null); setError(''); setModalOpen(true); }}>
          Nuevo usuario
        </Button>
      }
    >
      {isLoading ? (
        <Stack spacing={1}>{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={40} />)}</Stack>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell align="center">Activo</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell><Typography variant="body2" fontWeight={500}>{user.name}</Typography></TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell><Chip label={ROLE_LABELS[user.role?.name] ?? user.role?.name} size="small" variant="outlined" /></TableCell>
                <TableCell align="center">
                  <Switch checked={user.active} onChange={() => handleToggleActive(user)} size="small" />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => { setSelected(user); setError(''); setModalOpen(true); }}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Box sx={{ py: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">No hay usuarios</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <UserFormModal
        open={modalOpen}
        onClose={() => { if (!isSubmitting) { setModalOpen(false); setSelected(null); } }}
        onSubmit={handleSubmit}
        user={selected}
        roles={roles}
        isSubmitting={isSubmitting}
        error={error}
      />
    </MainCard>
  );
}
