// Carrega configuracoes do frontend a partir do arquivo .env.
// Para sites estaticos, o .env precisa estar publicado junto do frontend.
(function (global) {
  const API_BASE_KEY = 'SOFTGROUP_API_BASE_URL';
  const LEGACY_API_BASE_KEY = 'EVALUASOFT_API_BASE_URL';
  const READY_KEY = 'SOFTGROUP_CONFIG_READY';
  const LEGACY_READY_KEY = 'EVALUASOFT_CONFIG_READY';
  const DEFAULT_API_BASE_URL = calcularDefaultApiBase();

  function calcularDefaultApiBase() {
    try {
      const host = (global.location && global.location.hostname) || '';
      // Espelha o mesmo hostname que esta na barra do navegador para a API.
      // - Em localhost/127.0.0.1, evita que o cookie de sessao caia em
      //   "cross-site" e seja bloqueado pelo SameSite=Lax.
      // - Quando o frontend e aberto por outro computador na rede local
      //   (ex.: http://10.109.3.45:5500), a API passa a apontar para o
      //   MESMO IP na porta 8080 (http://10.109.3.45:8080), em vez de
      //   "localhost", que no outro PC seria a propria maquina dele.
      if (host) {
        return 'http://' + host + ':8080';
      }
    } catch (_) {}
    return 'http://localhost:8080';
  }

  const ready = carregarEnv();
  global[READY_KEY] = ready;
  global[LEGACY_READY_KEY] = ready;

  async function carregarEnv() {
    const fallback = global[API_BASE_KEY] || global[LEGACY_API_BASE_KEY] || DEFAULT_API_BASE_URL;

    try {
      const envUrl = new URL('.env', document.currentScript.src).toString();
      const response = await fetch(envUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error('Arquivo .env nao encontrado');

      const env = parseEnv(await response.text());
      definirApiBase(env[API_BASE_KEY] || env[LEGACY_API_BASE_KEY] || fallback);
    } catch (_) {
      definirApiBase(fallback);
    }

    return global[API_BASE_KEY];
  }

  function parseEnv(texto) {
    return String(texto || '')
      .split(/\r?\n/)
      .reduce((acc, linha) => {
        const limpa = linha.trim();
        if (!limpa || limpa.startsWith('#')) return acc;

        const pos = limpa.indexOf('=');
        if (pos === -1) return acc;

        const chave = limpa.slice(0, pos).trim();
        const valor = limpa.slice(pos + 1).trim().replace(/^['"]|['"]$/g, '');
        if (chave) acc[chave] = valor;
        return acc;
      }, {});
  }

  function normalizarBase(base) {
    let valor = String(base || '').trim();
    while (valor.endsWith('/')) valor = valor.slice(0, -1);
    return valor;
  }

  function definirApiBase(base) {
    const normalizada = normalizarBase(base);
    global[API_BASE_KEY] = normalizada;
    global[LEGACY_API_BASE_KEY] = normalizada;
  }
})(window);
