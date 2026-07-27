// Cliente del print-agent (puente de impresión local en la PC de caja).
// Si el puente no está corriendo, los métodos fallan y el POS cae al método
// del navegador (react-to-print). Ver print-agent/ y utils/escpos.js.
const AGENT_URL = import.meta.env.VITE_PRINT_AGENT_URL || 'http://127.0.0.1:9100';

// fetch con timeout corto (el puente es local; si no responde ya, no está).
async function agentFetch(path, options = {}, timeoutMs = 1500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(`${AGENT_URL}${path}`, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export const printService = {
  // ¿Está el puente disponible? Devuelve false si no responde.
  async isAvailable() {
    try {
      const res = await agentFetch('/status');
      return res.ok;
    } catch {
      return false;
    }
  },

  // Envía bytes ESC/POS (Uint8Array) al puente. Lanza error si falla.
  async printBytes(bytes) {
    const res = await agentFetch('/print', { method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: bytes }, 5000);
    if (!res.ok) throw new Error('El puente de impresión no pudo imprimir');
  }
};
