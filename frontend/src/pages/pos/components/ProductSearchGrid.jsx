import PropTypes from 'prop-types';
import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid2';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import SearchIcon from '@mui/icons-material/Search';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';

import useProducts from 'hooks/useProducts';
import formatCurrency from 'utils/formatCurrency';

export default function ProductSearchGrid({ onSelect }) {
  const [search, setSearch] = useState('');
  const { products, isLoading } = useProducts({ search, active: 'true', limit: 50 });

  return (
    <Box>
      <TextField
        placeholder="Buscar producto por nombre o código de barras..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        fullWidth
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
        }}
      />

      {isLoading ? (
        <Grid container spacing={1.5}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}>
              <Skeleton variant="rounded" height={96} />
            </Grid>
          ))}
        </Grid>
      ) : products.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">No se encontraron productos</Typography>
        </Box>
      ) : (
        <Grid container spacing={1.5}>
          {products.map((product) => {
            const outOfStock = product.stock <= 0;
            return (
              <Grid key={product.id} size={{ xs: 6, sm: 4, md: 3 }}>
                <Card variant="outlined" sx={{ height: '100%', opacity: outOfStock ? 0.5 : 1 }}>
                  <CardActionArea
                    disabled={outOfStock}
                    onClick={() => onSelect(product)}
                    sx={{ p: 1.5, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                  >
                    <Box
                      sx={{
                        width: '100%', height: 80, mb: 1, borderRadius: 1, overflow: 'hidden',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: 'grey.100', color: 'grey.400'
                      }}
                    >
                      {product.image ? (
                        <Box component="img" src={product.image} alt={product.name}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <ImageOutlinedIcon />
                      )}
                    </Box>
                    <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5, minHeight: 40 }}>
                      {product.name}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <Typography variant="subtitle1" color="primary">{formatCurrency(product.price)}</Typography>
                      <Chip
                        label={outOfStock ? 'Sin stock' : `Stock ${product.stock}`}
                        size="small"
                        color={outOfStock ? 'default' : 'success'}
                        variant="outlined"
                      />
                    </Box>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}

ProductSearchGrid.propTypes = {
  onSelect: PropTypes.func.isRequired,
};
