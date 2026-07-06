import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

import formatCurrency from 'utils/formatCurrency';

export default function Cart({ items, onSetQuantity, onRemove }) {
  if (items.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
        <ShoppingCartOutlinedIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
        <Typography variant="body2">El carrito está vacío</Typography>
        <Typography variant="caption">Seleccioná productos para agregarlos</Typography>
      </Box>
    );
  }

  return (
    <Stack divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />} spacing={1}>
      {items.map(({ product, quantity }) => (
        <Box key={product.id} sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={500} noWrap>{product.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {formatCurrency(product.price)} c/u
              </Typography>
            </Box>
            <IconButton size="small" color="error" onClick={() => onRemove(product.id)}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton size="small" onClick={() => onSetQuantity(product.id, quantity - 1)} disabled={quantity <= 1}>
                <RemoveIcon fontSize="small" />
              </IconButton>
              <TextField
                value={quantity}
                onChange={(e) => onSetQuantity(product.id, e.target.value)}
                size="small"
                type="number"
                inputProps={{ min: 1, max: product.stock, style: { textAlign: 'center', width: 40 } }}
                sx={{ '& .MuiInputBase-root': { height: 32 } }}
              />
              <IconButton
                size="small"
                onClick={() => onSetQuantity(product.id, quantity + 1)}
                disabled={quantity >= product.stock}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Box>
            <Typography variant="body2" fontWeight={600}>
              {formatCurrency(Number(product.price) * quantity)}
            </Typography>
          </Box>
        </Box>
      ))}
    </Stack>
  );
}

Cart.propTypes = {
  items: PropTypes.array.isRequired,
  onSetQuantity: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};
