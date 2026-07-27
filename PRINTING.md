# PRINTING.md — Impresión de tickets (impresora térmica)

Hay **dos formas** de imprimir tickets, y el POS usa la mejor disponible en cada caja:

1. **ESC/POS con el puente local (recomendado).** Un mini programa (`print-agent/`)
   corre en la PC de caja y le manda a la impresora el ticket en su idioma nativo
   → sale del **largo justo**, con **corte automático** y sin rollo en blanco.
2. **Navegador (respaldo).** Si el puente no está corriendo, el POS imprime por el
   navegador (Windows/driver). Funciona, pero puede tirar papel de más según el
   driver (ver la sección de troubleshooting). Sirve además para reimprimir/PDF.

> El POS detecta solo si el puente está activo: si lo está, imprime por ESC/POS;
> si no, cae al navegador. No hay que elegir nada en la app.

---

## 0. Impresión ESC/POS con el puente (recomendado) ⭐

Es lo que hace que el ticket salga perfecto. Pasos:

1. **Instalá el driver** de la impresora (sección 1) y anotá su nombre exacto en
   *Impresoras y escáneres* (ej. `POS-80C`).
2. **Instalá Node.js** en la PC de caja (https://nodejs.org, versión LTS).
3. **Arrancá el puente** (una vez, o que quede en el inicio de Windows — ver
   `print-agent/README.md`):

   ```bash
   cd print-agent
   PRINTER="POS-80C" node server.js
   ```

4. En el POS: **Configuración → Impresora → "Probar impresora"**. Si imprime un
   ticket de prueba y corta, ya está: cada venta imprime sola por ESC/POS.

Para que arranque solo al prender la caja y no depender de abrirlo a mano, seguí
la sección "Que arranque solo con Windows" del `print-agent/README.md`.

El **largo del margen de corte** se ajusta en `frontend/src/utils/escpos.js`
(método `cut()`, el número de líneas de avance antes del corte).

---

## El resto: método por navegador (respaldo)

Si no usás el puente, o como respaldo, aplican las secciones siguientes.

---

## 1. Instalar la impresora en Windows

1. Conectá la impresora por USB y encendela.
2. Instalá el **driver del fabricante** (viene en un CD o en su web: Epson,
   Xprinter, 3nStar, Sam4s, etc.). Si no tenés el driver específico, muchas
   térmicas funcionan con el driver genérico **"Generic / Text Only"**.
3. En **Configuración → Bluetooth y dispositivos → Impresoras y escáneres**,
   verificá que aparezca.

## 2. Configurar el tamaño de papel ⚠️ (el paso más importante)

Es la causa del **90% de los problemas**: si el papel está en A4/Carta (o un rollo
larguísimo), el ticket de 72mm se apiña arriba (**se ve "mezclado"**) y la impresora
**expulsa toda la hoja en blanco**. Ambos síntomas se arreglan acá.

1. En **Impresoras y escáneres**, abrí tu impresora → **Preferencias de impresión**.
2. Buscá el tamaño de papel y elegí el de tu rollo:
   - **80mm** (el más común en POS) → algo como `80mm x Receipt`, `80 x 297`, `Roll 80 x 3276` o similar.
   - **58mm** (portátiles/chicas) → `58mm x Receipt`.
3. Si tu driver **no** tiene una opción de recibo, creá un **tamaño personalizado**:
   - Ancho `80mm`, alto `~200mm` (o el mínimo que permita). Evitá A4/Carta.
   - En algunos drivers esto está en **Propiedades de la impresora → Preferencias → Avanzado**,
     o en "Administrar formularios" del servidor de impresión de Windows.
4. Verificá también, en el **diálogo de impresión de Chrome**: Destino = tu térmica,
   **Papel = el tamaño de recibo**, **Márgenes = Ninguno**, **Escala = 100%**.
5. Si tu rollo es de **58mm**, además cambiá el ancho en el código (ver sección 6).

> El ticket ya incluye ~3cm de papel en blanco al final (zona de corte) para que
> puedas cortarlo cómodo después del "¡Gracias por su compra!".

## 3. Ponerla como predeterminada

En la **PC de caja**, marcá la térmica como **impresora predeterminada**
(en Impresoras y escáneres → tu impresora → "Establecer como predeterminada").
Esto es lo que hace posible la impresión silenciosa del paso 5.

## 4. Probar (impresión normal, con diálogo)

1. Entrá al POS y hacé una venta de prueba.
2. Al confirmar, se abre el diálogo de impresión del navegador con el ticket.
3. Elegí la térmica y **Imprimir**. También podés reimprimir cualquier ticket
   desde **Ventas → (abrir una venta) → Imprimir ticket**.

En el diálogo, para que salga bien:
- **Destino**: tu impresora térmica.
- **Márgenes**: Ninguno.
- **Escala**: 100% (o "Predeterminado").
- Desactivá "Encabezados y pies de página".

## 5. Impresión silenciosa (sin diálogo en cada venta) — recomendado

Para que el ticket salga **directo**, sin el diálogo, se usa el **modo kiosco**
de Chrome. Es configuración de la PC de caja, no del sistema.

1. Cerrá todas las ventanas de Chrome.
2. Creá un **acceso directo** de Chrome (click derecho en el escritorio →
   Nuevo → Acceso directo) con este destino:

   ```
   "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing --app=http://TU_URL_DEL_POS
   ```

   - Reemplazá `TU_URL_DEL_POS` por la dirección donde corre el POS
     (ej. `http://localhost` o `https://pos.tucomercio.com`).
   - `--kiosk-printing` hace que **cada impresión vaya directo a la impresora
     predeterminada, sin diálogo**.
   - `--app=` abre el POS en una ventana limpia (sin barras del navegador).
3. Usá **ese acceso directo** para abrir el POS en la caja. Listo: cada venta
   imprime el ticket sola.

> Con Microsoft Edge es igual: `msedge.exe --kiosk-printing --app=...`.

## 6. Papel de 58mm (si tu impresora es angosta)

Por defecto el ticket está pensado para **80mm**. Si tu rollo es de 58mm:

- En `frontend/src/hooks/usePrintTicket.js`: cambiá `size: 80mm auto` por `size: 58mm auto`.
- En `frontend/src/pages/sales/components/Ticket.jsx`: cambiá `width: '72mm'` por `width: '54mm'`.

(Avisame y lo dejo configurable desde la pantalla de Configuración si te sirve
manejar varias impresoras distintas por cliente.)

## 7. Problemas comunes

| Síntoma | Causa / solución |
|---|---|
| Sale una **hoja/tira en blanco** después del ticket | Tamaño de papel mal configurado (sección 2). Elegí el tamaño "Receipt" de tu rollo, no A4/Carta. |
| El ticket sale **cortado a lo ancho** | El ancho del papel no coincide. Verificá 80 vs 58mm (secciones 2 y 6). |
| Aparecen **URL, fecha o número de página** | Desactivá "Encabezados y pies de página" en el diálogo de impresión. |
| Sale **muy chico o con margen grande** | Poné Márgenes: Ninguno y Escala: 100%. |
| El papel **no se corta solo** | El corte automático lo maneja el driver del fabricante; activalo en Preferencias de impresión ("Cortar papel" / "Auto cut"). El corte por comando ESC/POS es una mejora futura. |
| El **cajón de dinero** no se abre | Requiere ESC/POS (mejora futura); por ahora se abre con la llave/botón físico. |

---

## Resumen

- **Instalación**: driver del fabricante + tamaño de papel correcto + impresora predeterminada.
- **Uso diario**: abrir el POS con el acceso directo de Chrome `--kiosk-printing` → los tickets salen solos.
- El ticket ya toma los datos del negocio desde **Configuración → Datos del negocio**
  (nombre, dirección, CUIT y pie del ticket).
