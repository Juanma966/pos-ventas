// material-ui
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// ==============================|| LOGO ||============================== //

export default function Logo() {
  const theme = useTheme();

  return (
    <Typography
      variant="h3"
      sx={{
        fontWeight: 700,
        letterSpacing: '0.5px',
        color: theme.palette.primary.main
      }}
    >
      Appunti
    </Typography>
  );
}
