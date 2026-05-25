(async () => {
  const user = await API.Auth.requireAuth(['COLABORADOR']);
  if (!user) return;

  API.Util.bindLogout();
  API.Util.bindSuporte();
  API.Util.preencherPerfil(user, { avatarSelector: '#avatarIniciais' });

  const tbody = document.getElementById('tbodyRelatorios');
  const cards = document.getElementById('cardsResumoRelatorio');
  const busca = document.getElementById('buscaRelatorio');
  const resumo = document.getElementById('resumoRelatorios');

  let dashboard = null;
  let cicloAtual = null;
  let linhasTabela = [];

  try {
    cicloAtual = await API.Ciclos.atual().catch(() => null);
    if (!cicloAtual) {
      renderizarSemCiclo();
      return;
    }

    dashboard = await API.Dashboard.meu(cicloAtual.idCiclo);
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
    const agrupados = API.Util.agruparResultados(dashboard.resultadosPorSoftskill || []);
    const pior = agrupados
      .map(item => {
        const medias = Object.values(item.tipos).map(tipo => Number(tipo.media || 0)).filter(Boolean);
        return {
          nome: item.nomeSoftskill,
          media: medias.length ? medias.reduce((soma, valor) => soma + valor, 0) / medias.length : null,
        };
      })
      .filter(item => item.media != null)
      .sort((a, b) => a.media - b.media)[0];

    cards.innerHTML = `
      <div class="cartao" style="display:flex;flex-direction:column;justify-content:space-between;">
        <div>
          <div class="cabecalho-cartao" style="margin-bottom:8px;">
            <h3 style="font-size:1rem;">Resumo do Ciclo ${API.Util.escaparHtml(cicloAtual.nome)}</h3>
            <span class="emblema nota-azul">CSV</span>
          </div>
          <p class="texto-suave" style="font-size:0.9rem;line-height:1.5;">
            Média geral consolidada em <strong>${API.Util.formatarNota(dashboard.mediaGeral)}/10</strong> com status
            <strong>${API.Util.escaparHtml(dashboard.nivelGeral)}</strong>.
          </p>
        </div>
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid var(--borda);display:flex;justify-content:space-between;align-items:center;">
          <span class="texto-suave" style="font-size:0.8rem;"><i class="fa-regular fa-calendar"></i> Atualizado para o ciclo atual</span>
          <div style="display:flex;gap:8px;">
            <button class="btn-secundario" title="Baixar" id="btnDownloadResumo"><i class="fa-solid fa-download"></i></button>
            <button class="btn-primario" id="btnVisualizarResumo">Visualizar</button>
          </div>
        </div>
      </div>
      <div class="cartao" style="display:flex;flex-direction:column;justify-content:space-between;">
        <div>
          <div class="cabecalho-cartao" style="margin-bottom:8px;">
            <h3 style="font-size:1rem;">Ponto de atenção</h3>
            <span class="emblema nota-verde">Evolução</span>
          </div>
          <p class="texto-suave" style="font-size:0.9rem;line-height:1.5;">
            ${pior
              ? `A soft skill com menor média consolidada no momento é <strong>${API.Util.escaparHtml(pior.nome)}</strong>, com ${API.Util.formatarNota(pior.media)}/10.`
              : 'Ainda não há avaliações suficientes para apontar uma prioridade de desenvolvimento.'}
          </p>
        </div>
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid var(--borda);display:flex;justify-content:space-between;align-items:center;">
          <span class="texto-suave" style="font-size:0.8rem;"><i class="fa-regular fa-calendar"></i> Gerado ao abrir a página</span>
        </div>
      </div>`;
  }

  function montarLinhasTabela() {
    return (dashboard.resultadosPorSoftskill || []).map(item => ({
      nome: item.nomeSoftskill,
      tipo: API.Util.labelTipo(item.tipo),
      data: API.Util.formatarData(cicloAtual.dataFim),
      formato: 'CSV',
      media: API.Util.formatarNota(item.media),
      nivel: item.nivel,
    }));
  }

  function renderizarTabela(linhas) {
    if (!linhas.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;padding:1rem">Nenhum relatório disponível para este ciclo.</td></tr>';
      resumo.textContent = '0 relatório(s)';
      return;
    }

    tbody.innerHTML = linhas.map((item, index) => `
      <tr>
        <td><strong>${API.Util.escaparHtml(item.nome)}</strong></td>
        <td>${API.Util.escaparHtml(item.tipo)} • ${API.Util.escaparHtml(item.nivel)}</td>
        <td>${API.Util.escaparHtml(item.data)}</td>
        <td><span class="emblema nota-azul">${API.Util.escaparHtml(item.formato)}</span></td>
        <td>
          <a href="#" class="link-azul" data-linha="${index}" style="margin-right:12px;">Abrir</a>
          <a href="#" class="texto-suave" data-download="${index}"><i class="fa-solid fa-download"></i></a>
        </td>
      </tr>
    `).join('');

    resumo.textContent = `${linhas.length} relatório(s) baseado(s) no ciclo ${cicloAtual.nome}`;

    tbody.querySelectorAll('[data-linha], [data-download]').forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        exportarResumo();
      });
    });
  }

  function exportarResumo() {
    if (!dashboard || !cicloAtual) return;

    const linhas = [
      ['Relatorio', 'Desempenho Individual'],
      ['Colaborador', user.nome],
      ['Ciclo', cicloAtual.nome],
      ['Media Geral', API.Util.formatarNota(dashboard.mediaGeral)],
      ['Nivel Geral', dashboard.nivelGeral],
      [],
      ['Soft skill', 'Tipo', 'Media (0-10)', 'Nivel'],
      ...linhasTabela.map(item => [item.nome, item.tipo, item.media, item.nivel]),
    ];

    API.Util.baixarCSV(`relatorio-individual-${user.nome.toLowerCase().replace(/\s+/g, '-')}.csv`, linhas);
  }

  async function exportarPDF() {
    if (!dashboard || !cicloAtual) { alert('Sem dados para exportar.'); return; }
    await Export.toPDF({
      titulo: `Relatório individual — ${user.nome}`,
      subtitulo: `Ciclo ${cicloAtual.nome} • Média ${API.Util.formatarNota(dashboard.mediaGeral)} (${dashboard.nivelGeral || ''})`,
      colunas: ['Soft skill', 'Tipo', 'Média', 'Nível'],
      linhas: linhasTabela.map(it => [it.nome, it.tipo, it.media, it.nivel]),
      nomeArquivo: `relatorio_${user.nome.toLowerCase().replace(/\s+/g, '_')}_${cicloAtual.nome.replace(/[^a-z0-9]+/gi, '_')}`,
    });
  }

  async function exportarExcel() {
    if (!dashboard || !cicloAtual) { alert('Sem dados para exportar.'); return; }
    await Export.toExcel({
      nomeArquivo: `relatorio_${user.nome.toLowerCase().replace(/\s+/g, '_')}_${cicloAtual.nome.replace(/[^a-z0-9]+/gi, '_')}`,
      abas: [
        {
          nome: 'Resumo',
          colunas: ['Campo', 'Valor'],
          linhas: [
            ['Colaborador', user.nome],
            ['Ciclo', cicloAtual.nome],
            ['Média geral', dashboard.mediaGeral || 0],
            ['Nível geral', dashboard.nivelGeral || ''],
            ['Cor', dashboard.corGeral || ''],
          ],
        },
        {
          nome: 'Por soft skill',
          colunas: ['Soft skill', 'Tipo', 'Média', 'Nível'],
          linhas: linhasTabela.map(it => [it.nome, it.tipo, it.media, it.nivel]),
        },
        {
          nome: 'Histórico',
          colunas: ['Ciclo', 'Início', 'Média', 'Cor'],
          linhas: (dashboard.historico || []).map(h => [h.nomeCiclo, h.dataInicio || '', h.mediaGeral || 0, h.cor || '']),
        },
      ],
    });
  }

  function renderizarSemCiclo() {
    cards.innerHTML = `
      <div class="cartao">
        <p class="texto-suave">Nenhum ciclo aberto no momento. Assim que um ciclo for iniciado, seus relatórios serão exibidos aqui.</p>
      </div>`;
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;padding:1rem">Sem dados para exibir.</td></tr>';
    resumo.textContent = 'Nenhum relatório disponível';
  }
})();
