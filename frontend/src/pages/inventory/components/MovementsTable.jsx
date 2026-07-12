import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import MovementTypeChip from './MovementTypeChip';

const formatDateTime = (value) => new Date(value).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function MovementsTable({ movements, total, page, rowsPerPage, isLoading, onPageChange, onRowsPerPageChange }) {
  if (isLoading) {
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Stock', 'Motivo', 'Usuario'].map((h) => (
                <TableCell key={h}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 7 }).map((__, j) => (
                  <TableCell key={j}><Skeleton /></TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (!movements.length) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">No hay movimientos de inventario</Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Producto</TableCell>
              <TableCell align="center">Tipo</TableCell>
              <TableCell align="right">Cantidad</TableCell>
              <TableCell align="right">Stock</TableCell>
              <TableCell>Motivo</TableCell>
              <TableCell>Usuario</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movements.map((m) => (
              <TableRow key={m.id} hover>
                <TableCell>{formatDateTime(m.createdAt)}</TableCell>
                <TableCell>{m.product?.name ?? `#${m.productId}`}</TableCell>
                <TableCell align="center"><MovementTypeChip type={m.type} /></TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={500} color={m.quantity >= 0 ? 'success.main' : 'error.main'}>
                    {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                  </Typography>
                </TableCell>
                <TableCell align="right">{m.stockAfter}</TableCell>
                <TableCell>{m.reason ?? '—'}</TableCell>
                <TableCell>{m.user?.name ?? '—'}</TableCell>
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
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[10, 20, 50]}
        labelRowsPerPage="Filas por página"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
      />
    </>
  );
}

MovementsTable.propTypes = {
  movements: PropTypes.array.isRequired,
  total: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  isLoading: PropTypes.bool,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func.isRequired,
};
