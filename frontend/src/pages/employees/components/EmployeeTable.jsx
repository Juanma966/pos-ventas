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

import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import formatCurrency from 'utils/formatCurrency';

export default function EmployeeTable({ employees, isLoading, onView, onEdit, onDelete }) {
  if (isLoading) {
    return (
      <TableContainer>
        <Table>
          <TableBody>
            {Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>{Array.from({ length: 5 }).map((__, j) => (<TableCell key={j}><Skeleton /></TableCell>))}</TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (!employees.length) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">No hay empleados cargados</Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Puesto</TableCell>
            <TableCell align="right">Sueldo</TableCell>
            <TableCell align="right">Entregado (neto)</TableCell>
            <TableCell align="center">Estado</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id} hover sx={{ cursor: 'pointer' }} onClick={() => onView(employee)}>
              <TableCell><Typography variant="body2" fontWeight={500}>{employee.name}</Typography></TableCell>
              <TableCell>{employee.position ?? '—'}</TableCell>
              <TableCell align="right">{formatCurrency(employee.salary)}</TableCell>
              <TableCell align="right">{formatCurrency(employee.neto ?? 0)}</TableCell>
              <TableCell align="center">
                <Chip label={employee.active ? 'Activo' : 'Inactivo'} color={employee.active ? 'success' : 'default'} size="small" />
              </TableCell>
              <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                <Tooltip title="Ver movimientos">
                  <IconButton size="small" onClick={() => onView(employee)}><ReceiptLongOutlinedIcon fontSize="small" /></IconButton>
                </Tooltip>
                <Tooltip title="Editar">
                  <IconButton size="small" onClick={() => onEdit(employee)}><EditOutlinedIcon fontSize="small" /></IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <IconButton size="small" color="error" onClick={() => onDelete(employee)}><DeleteOutlineIcon fontSize="small" /></IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

EmployeeTable.propTypes = {
  employees: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
