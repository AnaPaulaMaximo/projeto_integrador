(async () => {
  const user = await API.Auth.requireAuth(['COLABORADOR']);
  if (!user) return;

  API.Util.bindLogout();
  API.Util.bindSuporte();
  API.Util.preencherPerfil(user, { avatarSelector: '#avatarIniciais' });

  const selectEquipe = document.getElementById('selectEquipe');
  const tbody = document.getElementById('tbodyRankingEquipe');
  const btnExportar = document.getElementById('btnExportarRanking');
  const btnComparativo = document.getElementById('btnVerComparativo');
  const btnAvaliacoes = document.getElementById('btnAdicionarUsuario');

  let chart = null;
  let equipes = [];
  let cicloAtual = null;
  let dashboardMeu = null;
  let rankingAtual = [];

  btnAvaliacoes?.addEventListener('click', () => {
    location.href = 'avaliacoes.html';
  });
  btnComparativo?.addEventListener('click', () => {
    location.href = 'relatorios.html';
  });

  try {
    const [times, ciclo] = await Promise.all([
      API.Equipes.minhas().catch(() => []),
      API.Ciclos.atual().catch(() => null),
    ]);

    equipes = times;
    cicloAtual = ciclo;

    if (!equipes.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#888;padding:1rem">Você ainda não está associado a nenhuma equipe.</td></tr>';
      document.getElementById('resumoRanking').textContent = 'Nenhuma equipe disponível';
      return;
    }

    if (!cicloAtual) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#888;padding:1rem">Nenhum ciclo aberto no momento.</td></tr>';
      document.getElementById('resumoRanking').textContent = 'Abra um ciclo para visualizar o ranking';
      return;
    }

    dashboardMeu = await API.Dashboard.meu(cicloAtual.idCiclo).catch(() => null);

    selectEquipe.innerHTML = equipes.map(equipe => `
      <option value="${equipe.idEquipe}">${API.Util.escaparHtml(equipe.nome)}</option>
    `).join('');
    selectEquipe.addEventListener('change', carregarEquipe);

    btnExportar?.addEventListener('click', () => exportarRanking(selectEquipe.value));

    await carregarEquipe();
  } catch (err) {
    API.Util.mostrarErro(err);
  }

  async function carregarEquipe() {
    const idEquipe = Number(selectEquipe.value);
    if (!idEquipe || !cicloAtual) return;

    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#888;padding:1rem">Carregando ranking...</td></tr>';

    try {
      const [membros, ranking, resumoSoftskills] = await Promise.all([
        API.Usuarios.listarPorEquipe(idEquipe).catch(() => []),
        API.Ranking.porEquipe(cicloAtual.idCiclo, idEquipe).catch(() => []),
        API.Dashboard.equipe(idEquipe, cicloAtual.idCiclo).catch(() => []),
      ]);

      rankingAtual = ranking;
      renderizarDistribuicao(ranking, membros);
      renderizarTabela(ranking);
      renderizarRadar(resumoSoftskills, dashboardMeu?.resultadosPorSoftskill || []);
      document.getElementById('atualizacaoEquipe').textContent = `Atualizado no ciclo ${cicloAtual.nome}`;
      document.getElementById('totalEquipe').textContent = membros.length;
    } catch (err) {
      API.Util.mostrarErro(err);
    }
  }

  function renderizarDistribuicao(ranking, membros) {
    const contagem = { AZUL: 0, VERDE: 0, AMARELO: 0, VERMELHO: 0 };
    ranking.forEach(item => {
      contagem[(item.cor || '').toUpperCase()] = (contagem[(item.cor || '').toUpperCase()] || 0) + 1;
    });

    document.getElementById('distribuicaoDesempenho').innerHTML = [
      `<span>EXCEPCIONAL: ${contagem.AZUL || 0}</span>`,
      `<span>ESPERADO: ${contagem.VERDE || 0}</span>`,
      `<span>DESENVOLVIMENTO: ${contagem.AMARELO || 0}</span>`,
      `<span>ABAIXO: ${contagem.VERMELHO || 0}</span>`,
    ].join('');
    document.getElementById('resumoRanking').textContent = `Mostrando ${ranking.length} de ${membros.length} colaborador(es) com avaliações no ciclo`;
  }

  function renderizarTabela(ranking) {
    if (!ranking.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#888;padding:1rem">Ainda não existem avaliações suficientes para montar o ranking.</td></tr>';
      return;
    }

    tbody.innerHTML = ranking.map(item => `
      <tr>
        <td><span class="emblema posicao">${item.posicao}º</span></td>
        <td>
          <div class="info-colaborador">
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(item.nome)}&background=0d47a1&color=fff" alt="${API.Util.escaparHtml(item.nome)}">
            <div>
              <strong>${API.Util.escaparHtml(item.nome)}</strong>
              <span>${API.Util.escaparHtml(item.cargo || '—')}</span>
            </div>
          </div>
        </td>
        <td><span class="emblema ${API.Util.classeDoNivel(item.cor)}">${API.Util.formatarNota(item.mediaAuto)}</span></td>
        <td><span class="emblema ${API.Util.classeDoNivel(item.cor)}">${API.Util.formatarNota(item.mediaLider)}</span></td>
        <td><span class="emblema ${API.Util.classeDoNivel(item.cor)}">${API.Util.formatarNota(item.media360)}</span></td>
        <td><strong>${API.Util.formatarNota(item.mediaGeral)}</strong></td>
        <td><a href="relatorios.html" class="link-azul">Ver<br>Resumo</a></td>
      </tr>
    `).join('');
  }

  function renderizarRadar(resumoEquipe, resultadosIndividuais) {
    const canvas = document.getElementById('graficoHabilidades');
    if (!canvas || !window.Chart) return;

    const pessoais = new Map();
    API.Util.agruparResultados(resultadosIndividuais).forEach(item => {
      const medias = Object.values(item.tipos).map(tipo => Number(tipo.media || 0)).filter(Boolean);
      if (medias.length) {
        pessoais.set(item.nomeSoftskill, medias.reduce((soma, valor) => soma + valor, 0) / medias.length);
      }
    });

    const labels = resumoEquipe.map(item => item.nomeSoftskill);
    const mediaEquipe = resumoEquipe.map(item => Number(API.Util.formatarNota(item.media)));
    const mediaPessoal = resumoEquipe.map(item => {
      const valor = pessoais.get(item.nomeSoftskill);
      return valor == null ? null : Number(API.Util.formatarNota(valor));
    });

    if (chart) chart.destroy();
    chart = new Chart(canvas.getContext('2d'), {
      type: 'radar',
      data: {
        labels,
        datasets: [
          {
            label: 'Média do Time',
            data: mediaEquipe,
            backgroundColor: 'rgba(13, 71, 161, 0.10)',
            borderColor: '#0d47a1',
            pointBackgroundColor: '#0d47a1',
            pointBorderColor: '#fff',
            borderWidth: 2,
          },
          {
            label: 'Seu Resultado',
            data: mediaPessoal,
            backgroundColor: 'rgba(15, 118, 110, 0.10)',
            borderColor: '#0f766e',
            pointBackgroundColor: '#0f766e',
            pointBorderColor: '#fff',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
        },
        scales: {
          r: {
            min: 0,
            max: 10,
            ticks: { display: false },
            pointLabels: { color: '#64748b', font: { size: 10, weight: '600' } },
            grid: { color: 'rgba(0, 0, 0, 0.08)' },
            angleLines: { color: 'rgba(0, 0, 0, 0.06)' },
          },
        },
      },
    });
  }

  function exportarRanking(idEquipe) {
    const equipe = equipes.find(item => String(item.idEquipe) === String(idEquipe));
    const linhas = [
      ['Relatorio', 'Ranking da equipe'],
      ['Equipe', equipe?.nome || '—'],
      ['Ciclo', cicloAtual?.nome || '—'],
      [],
      ['Posicao', 'Colaborador', 'Cargo', 'Autoavaliacao', 'Lider', 'Avaliacao 360', 'Media Final', 'Nivel'],
      ...rankingAtual.map(item => [
        item.posicao,
        item.nome,
        item.cargo || '',
        API.Util.formatarNota(item.mediaAuto),
        API.Util.formatarNota(item.mediaLider),
        API.Util.formatarNota(item.media360),
        API.Util.formatarNota(item.mediaGeral),
        item.nivel,
      ]),
    ];

    API.Util.baixarCSV(`ranking-${(equipe?.nome || 'equipe').toLowerCase().replace(/\s+/g, '-')}.csv`, linhas);
  }
})();
