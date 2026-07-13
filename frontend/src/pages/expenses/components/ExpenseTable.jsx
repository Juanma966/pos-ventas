import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import formatCurrency from 'utils/formatCurrency';
import { EXPENSE_CATEGORY_LABELS } from 'constants/app';

export default function ExpenseTable({ expenses, isLoading, onEdit, onDelete }) {
  if (isLoading) {
    return (
      <TableContainer>
        <Table>
          <TableBody>
            {Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 5 }).map((__, j) => (<TableCell key={j}><Skeleton /></TableCell>))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (!expenses.length) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">No hay gastos fijos cargados</Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Categoría</TableCell>
            <TableCell align="right">Monto mensual</TableCell>
            <TableCell align="center">Estado</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id} hover>
              <TableCell><Typography variant="body2" fontWeight={500}>{expense.name}</Typography></TableCell>
              <TableCell><Chip label={EXPENSE_CATEGORY_LABELS[expense.category] ?? expense.category} size="small" variant="outlined" /></TableCell>
              <TableCell align="right">{formatCurrency(expense.amount)}</TableCell>
              <TableCell align="center">
                <Chip label={expense.active ? 'Activo' : 'Inactivo'} color={expense.active ? 'success' : 'default'} size="small" />
              </TableCell>
              <TableCell align="center">
                <Tooltip title="Editar">
                  <IconButton size="small" onClick={() => onEdit(expense)}><EditOutlinedIcon fontSize="small" /></IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <IconButton size="small" color="error" onClick={() => onDelete(expense)}><DeleteOutlineIcon fontSize="small" /></IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

ExpenseTable.propTypes = {
  expenses: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
