import PropTypes from 'prop-types';
import { Controller, useWatch } from 'react-hook-form';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import formatCurrency from 'utils/formatCurrency';

function RowSubtotal({ control, index }) {
  const item = useWatch({ control, name: `items.${index}` });
  const subtotal = (Number(item?.quantity) || 0) * (Number(item?.cost) || 0);
  return <>{formatCurrency(subtotal)}</>;
}

RowSubtotal.propTypes = { control: PropTypes.object.isRequired, index: PropTypes.number.isRequired };

export default function PurchaseItemsEditor({ control, fields, append, remove, products, errors }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5">Productos</Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => append({ productId: '', quantity: 1, cost: 0 })}
        >
          Agregar producto
        </Button>
      </Box>

      {typeof errors.items?.message === 'string' && (
        <Typography variant="caption" color="error">{errors.items.message}</Typography>
      )}

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 220 }}>Producto</TableCell>
              <TableCell align="right" sx={{ width: 110 }}>Cantidad</TableCell>
              <TableCell align="right" sx={{ width: 140 }}>Costo unit.</TableCell>
              <TableCell align="right" sx={{ width: 140 }}>Subtotal</TableCell>
              <TableCell sx={{ width: 48 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((field, index) => (
              <TableRow key={field.id}>
                <TableCell>
                  <Controller
                    name={`items.${index}.productId`}
                    control={control}
                    render={({ field: f }) => (
                      <TextField
                        {...f}
                        select
                        fullWidth
                        size="small"
                        error={!!errors.items?.[index]?.productId}
                      >
                        {products.map((p) => (
                          <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </TableCell>
                <TableCell align="right">
                  <Controller
                    name={`items.${index}.quantity`}
                    control={control}
                    render={({ field: f }) => (
                      <TextField
                        {...f}
                        type="number"
                        size="small"
                        inputProps={{ min: 1, step: 1, style: { textAlign: 'right' } }}
                        error={!!errors.items?.[index]?.quantity}
                        sx={{ width: 90 }}
                      />
                    )}
                  />
                </TableCell>
                <TableCell align="right">
                  <Controller
                    name={`items.${index}.cost`}
                    control={control}
                    render={({ field: f }) => (
                      <TextField
                        {...f}
                        type="number"
                        size="small"
                        inputProps={{ min: 0, step: 0.01, style: { textAlign: 'right' } }}
                        error={!!errors.items?.[index]?.cost}
                        sx={{ width: 120 }}
                      />
                    )}
                  />
                </TableCell>
                <TableCell align="right">
                  <RowSubtotal control={control} index={index} />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="error" onClick={() => remove(index)} disabled={fields.length === 1}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

PurchaseItemsEditor.propTypes = {
  control: PropTypes.object.isRequired,
  fields: PropTypes.array.isRequired,
  append: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
  products: PropTypes.array.isRequired,
  errors: PropTypes.object.isRequired,
};
