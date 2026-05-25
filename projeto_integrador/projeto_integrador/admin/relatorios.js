(async () => {
  const user = await API.Auth.requireAuth(['ADMIN']);
  if (!user) return;

  API.Util.bindLogout();
  API.Util.bindSuporte();
  const avatar = document.getElementById('avatarIniciais');
  if (avatar) {
    avatar.textContent = (user.nome || '?').split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase();
    avatar.title = user.nome;
  }

  const seletorCiclo   = document.getElementById('seletorCiclo');
  const tbodyRanking   = document.getElementById('tbodyRanking');
  const cicloAtualLabel= document.getElementById('cicloAtualLabel');

  let ranking = [];
  let pendentes = [];
  let cicloSelecionado = null;
  let nomeCicloSelecionado = '';

  // Carrega ciclos no seletor
  let ciclos = [];
  try {
    ciclos = await API.Ciclos.listarTodos();
  } catch (err) { API.Util.mostrarErro(err); }

  if (!ciclos.length) {
    seletorCiclo.innerHTML = '<option value="">Sem ciclos cadastrados</option>';
  } else {
    seletorCiclo.innerHTML = ciclos.map(c =>
      `<option value="${c.idCiclo}">${esc(c.nome)} (${c.status})</option>`
    ).join('');
    // Pré-seleciona o ciclo aberto, se houver
    const aberto = ciclos.find(c => c.status === 'ABERTO') || ciclos[0];
    seletorCiclo.value = aberto.idCiclo;
    cicloSelecionado = aberto.idCiclo;
    nomeCicloSelecionado = aberto.nome;
    await carregarRanking();
    await carregarPendentes();
  }

  seletorCiclo.addEventListener('change', async () => {
    cicloSelecionado = Number(seletorCiclo.value);
    nomeCicloSelecionado = ciclos.find(c => c.idCiclo === cicloSelecionado)?.nome || '';
    await carregarRanking();
    await carregarPendentes();
  });

  async function carregarRanking() {
    cicloAtualLabel.textContent = nomeCicloSelecionado;
    tbodyRanking.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#888;padding:1rem">Carregando...</td></tr>';
    try {
      ranking = await API.Ranking.geral(cicloSelecionado);
      if (!ranking.length) {
        tbodyRanking.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#888;padding:1rem">Nenhum dado para este ciclo.</td></tr>';
        return;
      }
      tbodyRanking.innerHTML = ranking.map(r => `
        <tr>
          <td><strong>${r.posicao}º</strong></td>
          <td><strong>${esc(r.nome)}</strong></td>
          <td class="text-gray">${esc(r.cargo || '')}</td>
          <td>${r.mediaGeral != null ? r.mediaGeral.toFixed(1) : '—'}</td>
          <td><span class="status-badge" style="background:${corBg(r.cor)};color:${corFg(r.cor)};">${esc(r.nivel || '—')}</span></td>
          <td class="text-gray">${r.totalAvaliacoes || 0}</td>
        </tr>`).join('');
    } catch (err) { API.Util.mostrarErro(err); }
  }

  async function carregarPendentes() {
    try { pendentes = await API.Avaliacoes.pendentes(cicloSelecionado); }
    catch (_) { pendentes = []; }
    const contador = document.getElementById('contadorPendentes');
    if (pendentes.length) { contador.textContent = pendentes.length; contador.hidden = false; }
    else                  { contador.hidden = true; }
    const lista = document.getElementById('listaPendentesPanel');
    lista.innerHTML = pendentes.length
      ? pendentes.map(p => `<div class="painel-item"><strong>${esc(p.nome)}</strong><br><span class="text-gray" style="font-size:11px">${esc(p.email)}</span></div>`).join('')
      : '<div class="text-gray" style="padding:8px">Nenhuma pendência. 🎉</div>';
  }

  // Sino
  document.getElementById('sinoNotificacoes').addEventListener('click', () => {
    const p = document.getElementById('painelNotificacoes');
    p.hidden = !p.hidden;
  });

  // ---------- Exportações ----------
  document.getElementById('btnRankingPDF').addEventListener('click', async () => {
    if (!ranking.length) return alert('Sem dados para exportar.');
    await Export.toPDF({
      titulo: 'Ranking — ' + nomeCicloSelecionado,
    subtitulo: 'SoftGroup',
      colunas: ['POS', 'Nome', 'Cargo', 'Média', 'Nível', 'Avaliações'],
      linhas: ranking.map(r => [r.posicao, r.nome, r.cargo || '', (r.mediaGeral || 0).toFixed(1), r.nivel || '', r.totalAvaliacoes || 0]),
      nomeArquivo: `ranking_${slug(nomeCicloSelecionado)}`,
    });
  });

  document.getElementById('btnRankingExcel').addEventListener('click', async () => {
    if (!ranking.length) return alert('Sem dados para exportar.');
    await Export.toExcel({
      nomeArquivo: `ranking_${slug(nomeCicloSelecionado)}`,
      abas: [
        {
          nome: 'Ranking',
          colunas: ['Posição', 'Nome', 'Cargo', 'Média', 'Cor', 'Nível', 'Total avaliações'],
          linhas: ranking.map(r => [r.posicao, r.nome, r.cargo || '', r.mediaGeral || 0, r.cor || '', r.nivel || '', r.totalAvaliacoes || 0]),
        },
        {
          nome: 'Pendentes',
          colunas: ['Nome', 'E-mail'],
          linhas: pendentes.map(p => [p.nome, p.email]),
        },
      ],
    });
  });

  document.getElementById('btnUsuariosCSV').addEventListener('click', async () => {
    try {
      const usuarios = await API.Usuarios.listarTodos();
      Export.toCSV({
        nomeArquivo: 'usuarios_' + new Date().toISOString().slice(0, 10),
        colunas: ['ID', 'Nome', 'E-mail', 'Cargo', 'Perfil', 'Status'],
        linhas: usuarios.map(u => [u.idUsuario, u.nome, u.email, u.cargo, u.tipoPerfil, u.status]),
      });
    } catch (err) { API.Util.mostrarErro(err); }
  });

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function slug(s) {
    return String(s || 'ciclo').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }
  function corBg(cor) {
    return ({ AZUL:'#dbeafe', VERDE:'#d1fae5', AMARELO:'#fef3c7', VERMELHO:'#fee2e2' }[cor] || '#f1f5f9');
  }
  function corFg(cor) {
    return ({ AZUL:'#1d4ed8', VERDE:'#047857', AMARELO:'#92400e', VERMELHO:'#b91c1c' }[cor] || '#475569');
  }
})();
