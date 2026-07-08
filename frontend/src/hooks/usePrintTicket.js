import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

// Encapsula react-to-print para el ticket de venta.
// Devuelve un ref (a colocar en <Ticket ref={ticketRef} />) y la función de impresión.
export default function usePrintTicket() {
  const ticketRef = useRef(null);

  const printTicket = useReactToPrint({
    contentRef: ticketRef,
    documentTitle: 'Ticket de venta',
    pageStyle: '@page { size: 80mm auto; margin: 0; } body { margin: 0; }',
  });

  return { ticketRef, printTicket };
}
