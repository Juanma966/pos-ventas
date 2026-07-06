import PropTypes from 'prop-types';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

function getInitials(name) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function SupplierTable({ suppliers, total, page, rowsPerPage, isLoading, onEdit, onDelete, onPageChange, onRowsPerPageChange }) {
  if (isLoading) {
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {['Proveedor', 'Documento', 'Contacto', 'Teléfono', 'Estado', ''].map((h) => (
                <TableCell key={h}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 6 }).map((__, j) => (
                  <TableCell key={j}><Skeleton /></TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (!suppliers.length) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">No se encontraron proveedores</Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Proveedor</TableCell>
              <TableCell>Documento</TableCell>
              <TableCell>Contacto</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', color: 'primary.dark', fontSize: '0.75rem' }}>
                      {getInitials(supplier.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{supplier.name}</Typography>
                      {supplier.email && (
                        <Typography variant="caption" color="text.secondary">{supplier.email}</Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{supplier.document ?? '—'}</TableCell>
                <TableCell>{supplier.contactName ?? '—'}</TableCell>
                <TableCell>{supplier.phone ?? '—'}</TableCell>
                <TableCell align="center">
                  <Chip label={supplier.active ? 'Activo' : 'Inactivo'} color={supplier.active ? 'success' : 'default'} size="small" />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => onEdit(supplier)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton size="small" color="error" onClick={() => onDelete(supplier)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
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

SupplierTable.propTypes = {
  suppliers: PropTypes.array.isRequired,
  total: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  isLoading: PropTypes.bool,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func.isRequired,
};
