import PropTypes from 'prop-types';
import { useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import formatCurrency from 'utils/formatCurrency';

const TYPES = [
  { value: 'ADELANTO', label: 'Adelanto', color: 'warning' },
  { value: 'DESCUENTO', label: 'Descuento', color: 'error' },
  { value: 'PAGO', label: 'Pago', color: 'success' },
];
const TYPE_MAP = TYPES.reduce((acc, t) => ({ ...acc, [t.value]: t }), {});
const formatDateTime = (value) => new Date(value).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function SummaryItem({ label, value, strong }) {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant={strong ? 'h4' : 'body1'} fontWeight={strong ? 700 : 500}>{value}</Typography>
    </Box>
  );
}
SummaryItem.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.node.isRequired, strong: PropTypes.bool };

export default function EmployeeDetailModal({ open, employee, onClose, onAddMovement, onRemoveMovement, isSubmitting, error }) {
  const [type, setType] = useState('ADELANTO');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  if (!employee) return null;
  const s = employee.summary ?? { totalAdelantos: 0, totalDescuentos: 0, totalPagos: 0, neto: 0 };

  const handleAdd = async () => {
    const ok = await onAddMovement({ type, amount: Number(amount), note: note.trim() || undefined });
    if (ok) { setAmount(''); setNote(''); }
  };

  const canAdd = amount !== '' && Number(amount) > 0 && !isSubmitting;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {employee.name}
        {employee.position && <Typography variant="body2" color="text.secondary">{employee.position}</Typography>}
      </DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid size={{ xs: 6, sm: 2.4 }}><SummaryItem label="Sueldo" value={formatCurrency(employee.salary)} /></Grid>
          <Grid size={{ xs: 6, sm: 2.4 }}><SummaryItem label="Adelantos" value={formatCurrency(s.totalAdelantos)} /></Grid>
          <Grid size={{ xs: 6, sm: 2.4 }}><SummaryItem label="Descuentos" value={formatCurrency(s.totalDescuentos)} /></Grid>
          <Grid size={{ xs: 6, sm: 2.4 }}><SummaryItem label="Pagos" value={formatCurrency(s.totalPagos)} /></Grid>
          <Grid size={{ xs: 12, sm: 2.4 }}><SummaryItem label="Entregado (neto)" value={formatCurrency(s.neto)} strong /></Grid>
        </Grid>

        <Divider sx={{ mb: 2 }} />

        {/* Alta de movimiento */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} sx={{ mb: 2 }}>
          <TextField select label="Tipo" value={type} onChange={(e) => setType(e.target.value)} size="small" sx={{ width: { xs: '100%', sm: 150 } }}>
            {TYPES.map((t) => (<MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>))}
          </TextField>
          <TextField label="Monto" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} size="small" inputProps={{ min: 0, step: 1000 }} sx={{ width: { xs: '100%', sm: 140 } }} />
          <TextField label="Nota (opcional)" value={note} onChange={(e) => setNote(e.target.value)} size="small" sx={{ flexGrow: 1 }} />
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd} disabled={!canAdd}>Agregar</Button>
        </Stack>

        {/* Ledger */}
        {employee.movements.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Sin movimientos registrados</Typography>
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell align="right">Monto</TableCell>
                <TableCell>Nota</TableCell>
                <TableCell align="center" />
              </TableRow>
            </TableHead>
            <TableBody>
              {employee.movements.map((m) => {
                const t = TYPE_MAP[m.type] ?? { label: m.type, color: 'default' };
                return (
                  <TableRow key={m.id} hover>
                    <TableCell>{formatDateTime(m.createdAt)}</TableCell>
                    <TableCell><Chip label={t.label} color={t.color} size="small" variant="outlined" /></TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={500} color={m.type === 'DESCUENTO' ? 'error.main' : 'success.main'}>
                        {m.type === 'DESCUENTO' ? '- ' : '+ '}{formatCurrency(m.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>{m.note ?? '—'}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="error" onClick={() => onRemoveMovement(m.id)} disabled={isSubmitting}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}

EmployeeDetailModal.propTypes = {
  open: PropTypes.bool.isRequired,
  employee: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onAddMovement: PropTypes.func.isRequired,
  onRemoveMovement: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  error: PropTypes.string,
};
