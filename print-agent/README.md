# Print Agent — puente de impresión ESC/POS

Mini servidor local que corre en la **PC de caja** y le permite al POS imprimir
en la impresora térmica con **corte automático** y del **largo justo** (sin rollo
en blanco). El navegador no puede mandar bytes crudos al USB; este puente sí.

```
POS (navegador)  --HTTP-->  print-agent (localhost:9100)  --RAW-->  impresora térmica
```

Sin dependencias: solo **Node.js** + **PowerShell** (Windows).

---

## Cómo funciona

- El POS genera el ticket en **ESC/POS** (ver `frontend/src/utils/escpos.js`) y lo
  manda por HTTP a `http://127.0.0.1:9100/print`.
- El agente recibe los bytes y los envía a la impresora en modo **RAW** (via
  `send-raw.ps1`), sin que el driver los reprocese → sale tal cual, con corte.
- Si el agente **no está corriendo**, el POS imprime igual por el navegador
  (método de respaldo), así nunca se rompe.

Endpoints (solo escucha en `127.0.0.1`, nadie de la red puede imprimir):
- `GET /status` → `{ ok: true, printer }` (el POS lo usa para detectarlo)
- `POST /print` → recibe los bytes ESC/POS y los imprime

---

## Uso

Requiere Node.js instalado en la PC de caja.

```bash
cd print-agent
node server.js
```

Con otra impresora o puerto:

```bash
# El nombre debe coincidir con el de "Impresoras y escáneres" de Windows
PRINTER="POS-80C" PORT=9100 node server.js
```

Dejá esa ventana abierta mientras se usa el POS. Para probar que anda:
**POS → Configuración → Impresora → "Probar impresora"**.

---

## Que arranque solo con Windows (recomendado)

Para que la caja no dependa de abrirlo a mano, creá un acceso directo del agente
en la carpeta de Inicio:

1. Creá un archivo `iniciar-agente.bat` con:

   ```bat
   @echo off
   cd /d "C:\ruta\al\proyecto\print-agent"
   set PRINTER=POS-80C
   node server.js
   ```

2. Copiá un acceso directo de ese `.bat` en la carpeta de Inicio de Windows:
   `Win + R` → `shell:startup` → pegá el acceso directo ahí.

Así, al prender la PC de caja, el puente queda corriendo solo.

---

## Notas

- El nombre de la impresora (`PRINTER`) debe ser **exactamente** el que figura en
  *Impresoras y escáneres*. Con el driver instalado suele ser `POS-80C`.
- El corte y el largo se controlan desde el ticket (ver `escpos.js`): el comando
  de corte es `GS V B` y el margen final son unas líneas de avance antes de cortar.
- Es Windows-only (usa el spooler vía PowerShell). Para Linux se adaptaría el
  transporte, pero las cajas de los clientes son Windows.
