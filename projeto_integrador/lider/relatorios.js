(async () => {
  const user = await API.Auth.requireAuth(['LIDER']);
  if (!user) return;

  API.Util.bindLogout();
  API.Util.bindSuporte();
  API.Util.preencherPerfil(user, { avatarSelector: '#avatarIniciais' });

  const tbody = document.getElementById('tbodyRelatorios');
  const cards = document.getElementById('cardsResumoRelatorio');
  const busca = document.getElementById('buscaRelatorio');
  const resumo = document.getElementById('resumoRelatorios');

  let equipeAtual = null;
  let cicloAtual = null;
  let ranking = [];
  let linhasTabela = [];

  try {
    const [equipes, ciclo] = await Promise.all([
      API.Equipes.minhas().catch(() => []),
      API.Ciclos.atual().catch(() => null),
    ]);

    equipeAtual = equipes[0] || null;
    cicloAtual = ciclo;

    if (!equipeAtual || !cicloAtual) {
      renderizarSemDados();
      return;
    }

    ranking = await API.Ranking.porEquipe(cicloAtual.idCiclo, equipeAtual.idEquipe).catch(() => []);
    renderizarCards();
    linhasTabela = montarLinhasTabela();
    renderizarTabela(linhasTabela);

    busca?.addEventListener('input', () => {
      const termo = (busca.value || '').toLowerCase().trim();
      const filtradas = linhasTabela.filter(item =>
        item.nome.toLowerCase().includes(termo) || item.tipo.toLowerCase().includes(termo)
      );
      renderizarTabela(filtradas);
    });

    document.getElementById('btnDownloadResumo')?.addEventListener('click', exportarResumo);
    document.getElementById('btnVisualizarResumo')?.addEventListener('click', exportarResumo);
    document.getElementById('btnExportarHistorico')?.addEventListener('click', exportarResumo);
    document.getElementById('btnExportarPDF')?.addEventListener('click', exportarPDF);
    document.getElementById('btnExportarExcel')?.addEventListener('click', exportarExcel);
  } catch (err) {
    API.Util.mostrarErro(err);
  }

  function renderizarCards() {
    const mediaEquipe = ranking.length
      ? ranking.reduce((soma, item) => soma + Number(item.mediaGeral || 0), 0) / ranking.length
      : null;
    const destaque = ranking[0];

    cards.innerHTML = `
      <div class="cartao" style="display:flex;flex-direction:column;justify-content:space-between;">
        <div>
          <div class="cabecalho-cartao" style="margin-bottom:8px;">
            <h3 style="font-size:1rem;">Resumo da ${API.Util.escaparHtml(equipeAtual.nome)}</h3>
            <span class="emblema nota-azul">CSV</span>
          </div>
          <p class="texto-suave" style="font-size:0.9rem;line-height:1.5;">
            Média consolidada da equipe em <strong>${API.Util.formatarNota(mediaEquipe)}/10</strong> no ciclo
            <strong>${API.Util.escaparHtml(cicloAtual.nome)}</strong>.
          </p>
        </div>
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid var(--borda);display:flex;justify-content:space-between;align-items:center;">
          <span class="texto-suave" style="font-size:0.8rem;"><i class="fa-regular fa-calendar"></i> Atualizado no ciclo atual</span>
          <div style="display:flex;gap:8px;">
            <button class="btn-secundario" title="Baixar" id="btnDownloadResumo"><i class="fa-solid fa-download"></i></button>
            <button class="btn-primario" id="btnVisualizarResumo">Visualizar</button>
          </div>
        </div>
      </div>
      <div class="cartao" style="display:flex;flex-direction:column;justify-content:space-between;">
        <div>
          <div class="cabecalho-cartao" style="margin-bottom:8px;">
            <h3 style="font-size:1rem;">Destaque do ciclo</h3>
            <span class="emblema nota-verde">Ranking</span>
          </div>
          <p class="texto-suave" style="font-size:0.9rem;line-height:1.5;">
            ${destaque
              ? `<strong>${API.Util.escaparHtml(destaque.nome)}</strong> lidera a equipe com ${API.Util.formatarNota(destaque.mediaGeral)}/10.`
              : 'Ainda não existem avaliações suficientes para apontar um destaque no ciclo atual.'}
          </p>
        </div>
      </div>`;
  }

  function montarLinhasTabela() {
    return ranking.map(item => ({
      nome: item.nome,
      tipo: item.nivel,
      data: API.Util.formatarData(cicloAtual.dataFim),
      formato: 'CSV',
      media: API.Util.formatarNota(item.mediaGeral),
      cargo: item.cargo || '',
    }));
  }

  function renderizarTabela(linhas) {
    if (!linhas.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;padding:1rem">Nenhum relatório disponível para esta equipe.</td></tr>';
      resumo.textContent = '0 relatório(s)';
      return;
    }

    tbody.innerHTML = linhas.map((item, index) => `
      <tr>
        <td><strong>${API.Util.escaparHtml(item.nome)}</strong></td>
        <td>${API.Util.escaparHtml(item.cargo)} • ${API.Util.escaparHtml(item.tipo)}</td>
        <td>${API.Util.escaparHtml(item.data)}</td>
        <td><span class="emblema nota-azul">${API.Util.escaparHtml(item.formato)}</span></td>
        <td>
          <a href="#" class="link-azul" data-linha="${index}" style="margin-right:12px;">Abrir</a>
          <a href="#" class="texto-suave" data-download="${index}"><i class="fa-solid fa-download"></i></a>
        </td>
      </tr>
    `).join('');

    resumo.textContent = `${linhas.length} relatório(s) com base no ranking da equipe ${equipeAtual.nome}`;

    tbody.querySelectorAll('[data-linha], [data-download]').forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        exportarResumo();
      });
    });
  }

  function exportarResumo() {
    if (!equipeAtual || !cicloAtual) return;

    const linhas = [
      ['Relatorio', 'Desempenho da equipe'],
      ['Equipe', equipeAtual.nome],
      ['Lider', user.nome],
      ['Ciclo', cicloAtual.nome],
      [],
      ['Posicao', 'Colaborador', 'Cargo', 'Media Final', 'Nivel'],
      ...ranking.map(item => [
        item.posicao,
        item.nome,
        item.cargo || '',
        API.Util.formatarNota(item.mediaGeral),
        item.nivel,
      ]),
    ];

    API.Util.baixarCSV(`relatorio-${equipeAtual.nome.toLowerCase().replace(/\s+/g, '-')}.csv`, linhas);
  }

  async function exportarPDF() {
    if (!equipeAtual || !cicloAtual || !ranking.length) { alert('Sem dados para exportar.'); return; }
    await Export.toPDF({
      titulo: `Ranking — ${equipeAtual.nome}`,
      subtitulo: `Ciclo ${cicloAtual.nome} • Líder: ${user.nome}`,
      colunas: ['Posição', 'Colaborador', 'Cargo', 'Média', 'Nível'],
      linhas: ranking.map(r => [r.posicao, r.nome, r.cargo || '', (r.mediaGeral || 0).toFixed(1), r.nivel || '']),
      nomeArquivo: `ranking_${equipeAtual.nome.toLowerCase().replace(/\s+/g, '_')}_${cicloAtual.nome.replace(/[^a-z0-9]+/gi, '_')}`,
    });
  }

  async function exportarExcel() {
    if (!equipeAtual || !cicloAtual || !ranking.length) { alert('Sem dados para exportar.'); return; }
    await Export.toExcel({
      nomeArquivo: `ranking_${equipeAtual.nome.toLowerCase().replace(/\s+/g, '_')}_${cicloAtual.nome.replace(/[^a-z0-9]+/gi, '_')}`,
      abas: [{
        nome: 'Ranking',
        colunas: ['Posição', 'Colaborador', 'Cargo', 'Média', 'Cor', 'Nível', 'Total avaliações'],
        linhas: ranking.map(r => [r.posicao, r.nome, r.cargo || '', r.mediaGeral || 0, r.cor || '', r.nivel || '', r.totalAvaliacoes || 0]),
      }],
    });
  }

  function renderizarSemDados() {
    cards.innerHTML = `
      <div class="cartao">
        <p class="texto-suave">Nenhuma equipe ou ciclo ativo foi encontrado para gerar relatórios agora.</p>
      </div>`;
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;padding:1rem">Sem dados para exibir.</td></tr>';
    resumo.textContent = 'Nenhum relatório disponível';
  }
})();
