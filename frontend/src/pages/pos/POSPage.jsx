import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import MainCard from 'components/cards/MainCard';
import useCart from 'hooks/useCart';
import useCustomers from 'hooks/useCustomers';
import usePrintTicket from 'hooks/usePrintTicket';
import { saleService } from 'services/saleService';
import Ticket from 'pages/sales/components/Ticket';
import ProductSearchGrid from './components/ProductSearchGrid';
import Cart from './components/Cart';
import CheckoutPanel from './components/CheckoutPanel';

export default function POSPage() {
  const { items, addProduct, setQuantity, removeProduct, clear, subtotal, count } = useCart();
  const { customers } = useCustomers({ limit: 1000 });

  const [discount, setDiscount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('EFECTIVO');
  const [customerId, setCustomerId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { severity, message }
  const [lastSale, setLastSale] = useState(null);

  const { ticketRef, printTicket } = usePrintTicket();

  // Al registrarse una venta, imprime su ticket automáticamente.
  useEffect(() => {
    if (lastSale) printTicket();
  }, [lastSale, printTicket]);

  const resetSale = () => {
    clear();
    setDiscount('');
    setCustomerId('');
    setPaymentMethod('EFECTIVO');
  };

  const handleConfirm = async () => {
    if (items.length === 0) return;
    setIsSubmitting(true);
    try {
      const payload = {
        paymentMethod,
        discount: Number(discount) || 0,
        customerId: customerId || undefined,
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      };
      const sale = await saleService.create(payload);
      setLastSale(sale);
      setFeedback({ severity: 'success', message: `Venta #${sale.id} registrada — imprimiendo ticket` });
      resetSale();
    } catch (err) {
      setFeedback({ severity: 'error', message: err.response?.data?.message ?? 'No se pudo registrar la venta' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <MainCard title="Punto de Venta" contentSX={{ p: 2 }}>
            <ProductSearchGrid onSelect={addProduct} />
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <MainCard>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h4">Carrito</Typography>
              {count > 0 && <Typography variant="body2" color="text.secondary">{count} ítem(s)</Typography>}
            </Stack>

            <Cart items={items} onSetQuantity={setQuantity} onRemove={removeProduct} />

            {items.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <CheckoutPanel
                  subtotal={subtotal}
                  discount={discount}
                  onDiscountChange={setDiscount}
                  paymentMethod={paymentMethod}
                  onPaymentMethodChange={setPaymentMethod}
                  customerId={customerId}
                  onCustomerChange={setCustomerId}
                  customers={customers}
                  onConfirm={handleConfirm}
                  isSubmitting={isSubmitting}
                  disabled={items.length === 0}
                />
              </Box>
            )}
          </MainCard>
        </Grid>
      </Grid>

      <Snackbar
        open={!!feedback}
        autoHideDuration={4000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {feedback ? (
          <Alert severity={feedback.severity} onClose={() => setFeedback(null)} variant="filled">
            {feedback.message}
          </Alert>
        ) : undefined}
      </Snackbar>

      {/* Ticket oculto de la última venta; react-to-print lo copia a un iframe para imprimir */}
      <Box sx={{ display: 'none' }}>
        <Ticket ref={ticketRef} sale={lastSale} />
      </Box>
    </>
  );
}
