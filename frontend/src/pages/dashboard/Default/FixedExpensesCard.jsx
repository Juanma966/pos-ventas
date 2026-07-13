import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

import MainCard from 'components/cards/MainCard';
import { useFixedExpensesSummary } from 'hooks/useFixedExpenses';
import formatCurrency from 'utils/formatCurrency';
import { EXPENSE_CATEGORY_LABELS } from 'constants/app';

export default function FixedExpensesCard() {
  const navigate = useNavigate();
  const { summary, isLoading } = useFixedExpensesSummary();

  return (
    <MainCard
      title="Gastos fijos mensuales"
      secondary={
        <Button size="small" startIcon={<ReceiptLongOutlinedIcon />} onClick={() => navigate('/gastos-fijos')}>
          Administrar
        </Button>
      }
    >
      {isLoading || !summary ? (
        <Stack spacing={1}>{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={28} />)}</Stack>
      ) : (
        <>
          <Typography variant="h2" sx={{ mb: 0.5 }}>{formatCurrency(summary.total)}</Typography>
          <Typography variant="caption" color="text.secondary">{summary.count} gasto(s) activo(s)</Typography>

          {summary.byCategory.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1}>
                {summary.byCategory.map((c) => (
                  <Box key={c.category} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">{EXPENSE_CATEGORY_LABELS[c.category] ?? c.category}</Typography>
                    <Typography variant="body2" fontWeight={500}>{formatCurrency(c.amount)}</Typography>
                  </Box>
                ))}
              </Stack>
            </>
          )}
        </>
      )}
    </MainCard>
  );
}
