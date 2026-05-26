// ============================================================
// Cliente HTTP central — todas as requisicoes para o back-end
// Spring Boot passam por aqui. O frontend pode ser hospedado em
// outro dominio/origem e apontar para a API via config.js.
// ============================================================

(function (global) {
  let API_BASE = resolverApiBase();
  const API_READY = carregarConfiguracao();

  // ---------- Helper genérico ----------
  async function request(path, opts = {}) {
    await API_READY;
    const url = apiUrl(path);
    const config = {
      method: opts.method || 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json', ...(opts.headers || {}) },
    };
    if (opts.body !== undefined) {
      config.headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(opts.body);
    }

    let res;
    try {
      res = await fetch(url, config);
    } catch (err) {
      throw new ApiError(0, 'Falha de conexão com o servidor', err);
    }

    if (res.status === 401) {
      if (!path.startsWith('/api/auth/') && !path.endsWith('/api/me')) {
        // Sessão expirou → manda para login
        try { sessionStorage.removeItem('usuario'); } catch (_) {}
        const loginUrl = '/login/index.html';
        if (!location.pathname.startsWith('/login/')) {
          location.href = loginUrl;
        }
      }
      throw new ApiError(401, 'Não autenticado');
    }

    if (res.status === 204) return null;

    let data = null;
    const ct = res.headers.get('Content-Type') || '';
    if (ct.includes('application/json')) {
      try { data = await res.json(); } catch (_) { data = null; }
    } else {
      try { data = await res.text(); } catch (_) { data = null; }
    }

    if (!res.ok) {
      const msg = (data && (data.erro || data.message || data.error)) || `Erro ${res.status}`;
      throw new ApiError(res.status, msg, data);
    }
    return data;
  }

  async function carregarConfiguracao() {
    const configReady = global.SOFTGROUP_CONFIG_READY || global.EVALUASOFT_CONFIG_READY;

    if (configReady && typeof configReady.then === 'function') {
      try {
        const configurada = await configReady;
        if (configurada) API_BASE = normalizarBase(configurada);
      } catch (_) {
        API_BASE = resolverApiBase();
      }
    }

    return API_BASE;
  }

  function resolverApiBase() {
    const meta = document.querySelector('meta[name="api-base-url"]')?.getAttribute('content');
    let localStorageBase = '';
    try {
      localStorageBase =
        localStorage.getItem('SOFTGROUP_API_BASE_URL') ||
        localStorage.getItem('EVALUASOFT_API_BASE_URL') ||
        '';
    } catch (_) {}

    const configurada =
      global.SOFTGROUP_API_BASE_URL ||
      global.EVALUASOFT_API_BASE_URL ||
      meta ||
      localStorageBase ||
      baseLocalPadrao();

    return normalizarBase(configurada);
  }

  function baseLocalPadrao() {
    const host = location.hostname;
    const ehLocal = !host || host === 'localhost' || host === '127.0.0.1';
    // Usa o mesmo hostname da pagina (localhost OU 127.0.0.1) para que o
    // cookie de sessao seja considerado same-site e enviado nas requisicoes.
    if (ehLocal && location.port !== '8080') {
      const hostnameApi = host || 'localhost';
      return 'http://' + hostnameApi + ':8080';
    }
    return '';
  }

  function normalizarBase(base) {
    let valor = String(base || '').trim();
    while (valor.endsWith('/')) valor = valor.slice(0, -1);
    return valor;
  }

  function apiUrl(path) {
    if (/^https?:\/\//i.test(path)) return path;
    return API_BASE ? API_BASE + path : path;
  }

  class ApiError extends Error {
    constructor(status, message, data) {
      super(message);
      this.status = status;
      this.data = data;
    }
  }

  // ---------- Sessão (cache local do usuário logado) ----------
  const Session = {
    set(user) {
      try { sessionStorage.setItem('usuario', JSON.stringify(user)); } catch (_) {}
    },
    get() {
      try {
        const raw = sessionStorage.getItem('usuario');
        return raw ? JSON.parse(raw) : null;
      } catch (_) { return null; }
    },
    clear() {
      try { sessionStorage.removeItem('usuario'); } catch (_) {}
    },
    isLogged() { return this.get() != null; },
    is(perfil) {
      const u = this.get();
      return u && (u.tipoPerfil || '').toUpperCase() === perfil.toUpperCase();
    },
  };

  function paginaInicial(tipoPerfil) {
    switch ((tipoPerfil || '').toUpperCase()) {
      case 'ADMIN':       return '/admin/index.html';
            case 'LIDER':       return '/lider/dashboard.html';
      case 'COLABORADOR': return '/colaborador/dashboard.html';
      default:            return '/login/index.html';
    }
  }

  // ---------- Auth ----------
  const Auth = {
    login: async (email) => {
      const u = await request('/api/auth/login', { method: 'POST', body: { email } });
      Session.set(u);
      return u;
    },
    logout: async () => {
      try { await request('/api/auth/logout', { method: 'POST' }); }
      catch (_) { /* ignora */ }
      Session.clear();
      location.href = '/login/index.html';
    },
    me: async () => {
      const u = await request('/api/me');
      Session.set(u);
      return u;
    },
    /**
     * Garante que o usuário está logado e (opcionalmente) tem um dos perfis permitidos.
     * Se não estiver → redireciona para login.
     * Se não tiver permissão → redireciona para a página inicial do perfil dele.
     */
    requireAuth: async (perfisPermitidos) => {
      let user = Session.get();
      if (!user) {
        try { user = await Auth.me(); }
        catch (_) { location.href = '/login/index.html'; return null; }
      }
      if (perfisPermitidos && perfisPermitidos.length) {
        const perfil = (user.tipoPerfil || '').toUpperCase();
        const ok = perfisPermitidos.map(p => p.toUpperCase()).includes(perfil);
        if (!ok) {
          location.href = paginaInicial(perfil);
          return null;
        }
      }
      return user;
    },
  };

  // ---------- Usuários ----------
  const Usuarios = {
    listarTodos:      ()              => request('/api/usuarios'),
    listarPorPerfil:  (tipo)          => request('/api/usuarios/perfil/' + encodeURIComponent(tipo)),
    listarPorEquipe:  (idEquipe)      => request('/api/usuarios/equipe/' + idEquipe),
    buscarPorId:      (id)            => request('/api/usuarios/' + id),
    criar:            (u)             => request('/api/usuarios', { method: 'POST', body: u }),
    atualizar:        (id, u)         => request('/api/usuarios/' + id, { method: 'PUT', body: u }),
    inativar:         (id)            => request('/api/usuarios/' + id + '/inativar', { method: 'PATCH' }),
    ativar:           (id)            => request('/api/usuarios/' + id + '/ativar',    { method: 'PATCH' }),
    adicionarAEquipe: (idU, idE)      => request(`/api/usuarios/${idU}/equipes/${idE}`, { method: 'POST' }),
    removerDaEquipe:  (idU, idE)      => request(`/api/usuarios/${idU}/equipes/${idE}`, { method: 'DELETE' }),
    meusColegas:      ()              => request('/api/usuarios/me/colegas'),
  };

  // ---------- Equipes ----------
  const Equipes = {
    listarTodas:  ()         => request('/api/equipes'),
    minhas:       ()         => request('/api/equipes/minhas'),
    buscarPorId:  (id)       => request('/api/equipes/' + id),
    criar:        (e)        => request('/api/equipes', { method: 'POST', body: e }),
    atualizar:    (id, e)    => request('/api/equipes/' + id, { method: 'PUT', body: e }),
    excluir:      (id)       => request('/api/equipes/' + id, { method: 'DELETE' }),
  };

  // ---------- Softskills ----------
  const Softskills = {
    listarTodas:  ()         => request('/api/softskills'),
    buscarPorId:  (id)       => request('/api/softskills/' + id),
    criar:        (s)        => request('/api/softskills', { method: 'POST', body: s }),
    atualizar:    (id, s)    => request('/api/softskills/' + id, { method: 'PUT', body: s }),
    excluir:      (id)       => request('/api/softskills/' + id, { method: 'DELETE' }),
  };

  // ---------- Ciclos ----------
  const Ciclos = {
    listarTodos:   ()        => request('/api/ciclos'),
    listarAbertos: ()        => request('/api/ciclos/abertos'),
    atual:         ()        => request('/api/ciclos/atual'),
    buscarPorId:   (id)      => request('/api/ciclos/' + id),
    criar:         (c)       => request('/api/ciclos', { method: 'POST', body: c }),
    atualizar:     (id, c)   => request('/api/ciclos/' + id, { method: 'PUT', body: c }),
    fechar:        (id)      => request('/api/ciclos/' + id + '/fechar', { method: 'PATCH' }),
    reabrir:       (id)      => request('/api/ciclos/' + id + '/reabrir', { method: 'PATCH' }),
  };

  // ---------- Avaliações ----------
  const Avaliacoes = {
    registrar:  (dto)                => request('/api/avaliacoes', { method: 'POST', body: dto }),
    minhas:     (idCiclo)            => request('/api/avaliacoes/minhas/ciclo/' + idCiclo),
    resultados: (idAvaliado, idCiclo) => request(`/api/avaliacoes/resultados/${idAvaliado}/ciclo/${idCiclo}`),
    pendentes:  (idCiclo)            => request('/api/avaliacoes/pendentes/ciclo/' + idCiclo),
  };

  // ---------- Dashboard ----------
  const Dashboard = {
    meu:          (idCiclo)           => request('/api/dashboard/meu/ciclo/' + idCiclo),
    colaborador:  (idUsuario, idCiclo) => request(`/api/dashboard/colaborador/${idUsuario}/ciclo/${idCiclo}`),
    equipe:       (idEquipe, idCiclo)  => request(`/api/dashboard/equipe/${idEquipe}/ciclo/${idCiclo}`),
  };

  // ---------- Ranking ----------
  const Ranking = {
    geral:     (idCiclo)             => request('/api/ranking/ciclo/' + idCiclo),
    porEquipe: (idCiclo, idEquipe)   => request(`/api/ranking/ciclo/${idCiclo}/equipe/${idEquipe}`),
  };

  // ---------- Utilidades visuais ----------
  const Util = {
    escaparHtml(valor) {
      return String(valor ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[c]));
    },
    iniciais(nome) {
      return (nome || '?').split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase();
    },
    corDoNivel(cor) {
      switch ((cor || '').toUpperCase()) {
        case 'AZUL':     return '#3b82f6';
        case 'VERDE':    return '#10b981';
        case 'AMARELO':  return '#f59e0b';
        case 'VERMELHO': return '#ef4444';
        default:         return '#9ca3af';
      }
    },
    classeDoNivel(cor) {
      switch ((cor || '').toUpperCase()) {
        case 'AZUL':     return 'nota-azul';
        case 'VERDE':    return 'nota-verde';
        case 'AMARELO':  return 'nota-amarela';
        case 'VERMELHO': return 'nota-vermelha';
        default:         return '';
      }
    },
    formatarNota(valor, casas = 1) {
      if (valor == null || Number.isNaN(Number(valor))) return '—';
      return (Number(valor) / 10).toFixed(casas);
    },
    percentual(valor, total) {
      if (!total) return 0;
      return Math.max(0, Math.min(100, Math.round((Number(valor || 0) / Number(total)) * 100)));
    },
    labelTipo(tipo) {
      switch ((tipo || '').toUpperCase()) {
        case 'AUTO':  return 'Autoavaliação';
        case 'LIDER': return 'Avaliação da Liderança';
        case '360':   return 'Avaliação 360°';
        default:      return tipo || '—';
      }
    },
    agruparResultados(resultados) {
      const mapa = new Map();
      (resultados || []).forEach(item => {
        const atual = mapa.get(item.idSoftskill) || {
          idSoftskill: item.idSoftskill,
          nomeSoftskill: item.nomeSoftskill,
          tipos: {},
        };
        atual.tipos[(item.tipo || '').toUpperCase()] = item;
        mapa.set(item.idSoftskill, atual);
      });
      return Array.from(mapa.values()).sort((a, b) => String(a.nomeSoftskill).localeCompare(String(b.nomeSoftskill)));
    },
    baixarCSV(nomeArquivo, linhas) {
      const csv = (linhas || [])
        .map(colunas => colunas.map(valor => {
          const texto = String(valor ?? '');
          return /[",;\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
        }).join(';'))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nomeArquivo;
      a.click();
      URL.revokeObjectURL(url);
    },
    /** Exibe erro padronizado (usa alert — páginas podem sobrescrever). */
    mostrarErro(err) {
      const msg = (err && err.message) ? err.message : 'Erro desconhecido';
      if (typeof global.mostrarErro === 'function' && global.mostrarErro !== Util.mostrarErro) {
        global.mostrarErro(err);
      } else {
        alert(msg);
      }
      console.error(err);
    },
    /** Liga clique em qualquer #linkSuporte / [data-suporte] para mostrar info de contato. */
    bindSuporte(root = document) {
      const els = root.querySelectorAll('#linkSuporte, [data-suporte]');
      els.forEach(el => {
        if (el.__suporteBound) return;
        el.__suporteBound = true;
        el.addEventListener('click', (e) => {
          e.preventDefault();
          alert('Precisa de ajuda?\n\nFale com o RH:\n  E-mail: rh@softgroup.com\n  Suporte técnico: suporte@softgroup.com\n\nProjeto integrador SENAI-CIC.');
        });
      });
    },
    /** Liga links/botões de logout (procura [data-logout], .logout-btn, #btnLogout, "Sair"). */
    bindLogout(root = document) {
      const candidates = new Set();
      root.querySelectorAll('[data-logout], .logout-btn, #btnLogout, #logoutBtn').forEach(el => candidates.add(el));
      root.querySelectorAll('a, button').forEach(el => {
        const t = (el.textContent || '').trim().toLowerCase();
        if (t === 'sair' || t === 'logout') candidates.add(el);
      });
      candidates.forEach(el => {
        if (el.__logoutBound) return;
        el.__logoutBound = true;
        el.addEventListener('click', (e) => {
          e.preventDefault();
          Auth.logout();
        });
      });
    },
    /** Formata data ISO (YYYY-MM-DD) para dd/mm/aaaa. */
    formatarData(iso) {
      if (!iso) return '';
      const s = String(iso).slice(0, 10);
      const [y, m, d] = s.split('-');
      return (d && m && y) ? `${d}/${m}/${y}` : s;
    },
    preencherPerfil(user, opções = {}) {
      const {
        avatarSelector = '#avatarIniciais',
        nomeSelector = '[data-user-nome]',
        cargoSelector = '[data-user-cargo]',
        nomeSaudacaoSelector = '[data-user-primeiro-nome]',
      } = opções;

      const avatar = document.querySelector(avatarSelector);
      if (avatar) {
        avatar.textContent = Util.iniciais(user?.nome);
        avatar.title = user?.nome || '';
      }

      const nomeEl = document.querySelector(nomeSelector);
      if (nomeEl) nomeEl.textContent = user?.nome || '';

      const cargoEl = document.querySelector(cargoSelector);
      if (cargoEl) cargoEl.textContent = user?.cargo || '';

      const saudacaoEl = document.querySelector(nomeSaudacaoSelector);
      if (saudacaoEl) saudacaoEl.textContent = (user?.nome || '').split(' ')[0] || '';
    },
  };

  // ---------- Exporta para o escopo global ----------
  global.API = {
    ApiError,
    request,
    get baseUrl() { return API_BASE; },
    ready: API_READY,
    url: apiUrl,
    Session,
    Auth,
    Usuarios,
    Equipes,
    Softskills,
    Ciclos,
    Avaliacoes,
    Dashboard,
    Ranking,
    Util,
    paginaInicial,
  };
})(window);
