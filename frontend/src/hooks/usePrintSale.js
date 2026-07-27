import { useCallback, useEffect, useState } from 'react';

import useCompany from 'hooks/useCompany';
import usePrintTicket from 'hooks/usePrintTicket';
import { printService } from 'services/printService';
import { buildSaleTicket } from 'utils/escpos';

// Imprime el ticket de una venta. Intenta primero por el puente local (ESC/POS:
// sale del largo justo y corta); si el puente no está, cae al método del
// navegador (react-to-print). El componente debe renderizar el Ticket oculto:
//   <Ticket ref={ticketRef} sale={fallbackSale} />
export default function usePrintSale() {
  const { company } = useCompany();
  const { ticketRef, printTicket } = usePrintTicket();
  const [fallbackSale, setFallbackSale] = useState(null);

  // Cuando cae al navegador, imprime una vez que el Ticket oculto se renderizó.
  useEffect(() => {
    if (fallbackSale) printTicket();
  }, [fallbackSale, printTicket]);

  // Devuelve 'escpos' si imprimió por el puente, 'browser' si usó el navegador.
  const printSale = useCallback(
    async (sale) => {
      try {
        await printService.printBytes(buildSaleTicket(sale, company));
        return 'escpos';
      } catch {
        setFallbackSale({ ...sale }); // objeto nuevo => dispara el efecto siempre
        return 'browser';
      }
    },
    [company]
  );

  return { printSale, ticketRef, fallbackSale };
}
