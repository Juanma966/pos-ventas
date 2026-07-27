import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

// Encapsula react-to-print para el ticket de venta.
// Devuelve un ref (a colocar en <Ticket ref={ticketRef} />) y la función de impresión.
export default function usePrintTicket() {
  const ticketRef = useRef(null);

  const printTicket = useReactToPrint({
    contentRef: ticketRef,
    documentTitle: 'Ticket de venta',
    // 80mm = ancho estándar de papel térmico (para 58mm, cambiar acá y el ancho
    // en Ticket.jsx). print-color-adjust fuerza el negro sólido en térmica.
    pageStyle: `
      @page { size: 80mm auto; margin: 0; }
      body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    `,
  });

  return { ticketRef, printTicket };
}
