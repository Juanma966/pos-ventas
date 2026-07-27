// Puente de impresión local (print-agent).
// Corre en la PC de caja. Recibe los bytes ESC/POS del POS por HTTP y los manda
// a la impresora térmica en modo RAW (para que corte y salga del largo justo).
//
// Uso:   node server.js              (impresora "POS-80C", puerto 9100)
//        PRINTER="Mi Impresora" PORT=9100 node server.js
//
// Sin dependencias: solo Node + PowerShell (Windows).
const http = require('http');
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PRINTER = process.env.PRINTER || 'POS-80C';
const PORT = Number(process.env.PORT || 9100);
const PS1 = path.join(__dirname, 'send-raw.ps1');

// Manda un Buffer de bytes a la impresora vía el script PowerShell (RAW).
function sendRaw(buffer) {
  const tmp = path.join(os.tmpdir(), `pos-ticket-${Date.now()}-${Math.random().toString(36).slice(2)}.bin`);
  fs.writeFileSync(tmp, buffer);
  try {
    const r = spawnSync(
      'powershell',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', PS1, '-Printer', PRINTER, '-File', tmp],
      { encoding: 'utf8', windowsHide: true }
    );
    if (r.status !== 0) console.error('[print-agent] Error al imprimir:', r.stderr || r.stdout);
    return r.status === 0;
  } finally {
    fs.unlink(tmp, () => {});
  }
}

const cors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

const server = http.createServer((req, res) => {
  cors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // El POS usa este endpoint para saber si el puente está activo.
  if (req.method === 'GET' && req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, printer: PRINTER }));
  }

  // Recibe los bytes ESC/POS y los imprime.
  if (req.method === 'POST' && req.url === '/print') {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      if (buffer.length === 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: false, error: 'sin datos' }));
      }
      const ok = sendRaw(buffer);
      res.writeHead(ok ? 200 : 500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok }));
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: false, error: 'no encontrado' }));
});

// Solo escucha en localhost: nadie de la red puede mandar a imprimir.
server.listen(PORT, '127.0.0.1', () => {
  console.log(`[print-agent] Escuchando en http://127.0.0.1:${PORT}`);
  console.log(`[print-agent] Impresora: "${PRINTER}"`);
  console.log('[print-agent] Dejá esta ventana abierta mientras usás el POS.');
});
