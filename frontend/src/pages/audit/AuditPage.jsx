import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import MainCard from 'components/cards/MainCard';
import useAudit from 'hooks/useAudit';

const ENTITY_OPTIONS = [
  '', 'products', 'categories', 'brands', 'customers', 'suppliers',
  'purchases', 'sales', 'cash', 'inventory', 'branches', 'users', 'settings',
];
const ENTITY_LABELS = {
  products: 'Productos', categories: 'Categorías', brands: 'Marcas', customers: 'Clientes',
  suppliers: 'Proveedores', purchases: 'Compras', sales: 'Ventas', cash: 'Caja',
  inventory: 'Inventario', branches: 'Sucursales', users: 'Usuarios', settings: 'Configuración',
};

const formatDateTime = (value) => new Date(value).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const statusColor = (code) => (code >= 500 ? 'error' : code >= 400 ? 'warning' : 'success');

export default function AuditPage() {
  const [entity, setEntity] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const { logs, total, isLoading } = useAudit({
    entity: entity || undefined,
    from: from || undefined,
    to: to || undefined,
    page: page + 1,
    limit: rowsPerPage,
  });

  return (
    <MainCard>
      <Typography variant="h3" sx={{ mb: 3 }}>Auditoría</Typography>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent sx={{ pb: '12px !important' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select label="Entidad" value={entity}
              onChange={(e) => { setEntity(e.target.value); setPage(0); }}
              size="small" sx={{ width: { xs: '100%', sm: 220 } }}
            >
              {ENTITY_OPTIONS.map((opt) => (
                <MenuItem key={opt || 'all'} value={opt}>{opt === '' ? 'Todas las entidades' : (ENTITY_LABELS[opt] ?? opt)}</MenuItem>
              ))}
            </TextField>
            <TextField label="Desde" type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(0); }} size="small" InputLabelProps={{ shrink: true }} />
            <TextField label="Hasta" type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(0); }} size="small" InputLabelProps={{ shrink: true }} />
          </Stack>
        </CardContent>
      </Card>

      {isLoading ? (
        <Stack spacing={1}>{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={40} />)}</Stack>
      ) : logs.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">No hay registros de auditoría</Typography>
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Acción</TableCell>
                  <TableCell>Entidad</TableCell>
                  <TableCell align="right">ID</TableCell>
                  <TableCell>Método</TableCell>
                  <TableCell align="center">Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>{formatDateTime(log.createdAt)}</TableCell>
                    <TableCell>{log.user?.name ?? '—'}</TableCell>
                    <TableCell><Typography variant="body2" fontWeight={500}>{log.action}</Typography></TableCell>
                    <TableCell>{ENTITY_LABELS[log.entity] ?? log.entity}</TableCell>
                    <TableCell align="right">{log.entityId ?? '—'}</TableCell>
                    <TableCell>{log.method}</TableCell>
                    <TableCell align="center"><Chip label={log.statusCode} color={statusColor(log.statusCode)} size="small" variant="outlined" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[10, 20, 50]}
            labelRowsPerPage="Filas por página"
            labelDisplayedRows={({ from: f, to: t, count }) => `${f}–${t} de ${count}`}
          />
        </>
      )}
    </MainCard>
  );
}
