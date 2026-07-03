import { Box, Typography } from '@mui/material';
import { IconHammer } from '@tabler/icons-react';

export default function PagePlaceholder({ title }) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh" gap={2}>
      <IconHammer size={48} stroke={1.5} style={{ opacity: 0.4 }} />
      <Typography variant="h3" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="body2" color="text.disabled">
        Este módulo está en desarrollo.
      </Typography>
    </Box>
  );
}
