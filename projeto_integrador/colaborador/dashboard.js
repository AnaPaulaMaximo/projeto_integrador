(async () => {
  const user = await API.Auth.requireAuth(['COLABORADOR']);
  if (!user) return;

  API.Util.bindLogout();
  API.Util.bindSuporte();
  API.Util.preencherPerfil(user);

  document.getElementById('btnIrAvaliacoes')?.addEventListener('click', () => {
    location.href = 'avaliacoes.html';
  });
  document.getElementById('btnVerPrazos')?.addEventListener('click', () => {
    location.href = 'avaliacoes.html';
  });

  let dashboardAtual = null;
  let cicloAtual = null;

  try {
    const [ciclo, equipes, softskills, colegas] = await Promise.all([
      API.Ciclos.atual().catch(() => null),
      API.Equipes.minhas().catch(() => []),
      API.Softskills.listarTodas().catch(() => []),
      API.Usuarios.meusColegas().catch(() => []),
    ]);

    cicloAtual = ciclo;
    if (!cicloAtual) {
      renderizarSemCiclo();
      return;
    }

    const [dashboard, minhasAvaliacoes, ranking] = await Promise.all([
      API.Dashboard.meu(cicloAtual.idCiclo),
      API.Avaliacoes.minhas(cicloAtual.idCiclo).catch(() => []),
      equipes[0] ? API.Ranking.porEquipe(cicloAtual.idCiclo, equipes[0].idEquipe).catch(() => []) : Promise.resolve([]),
    ]);

    dashboardAtual = dashboard;
    preencherResumo(dashboard, cicloAtual, ranking);
    renderizarPendencias(minhasAvaliacoes, colegas.filter(c => c.idUsuario !== user.idUsuario), softskills, cicloAtual);
    renderizarPdi(dashboard.resultadosPorSoftskill || []);
    renderizarHistorico(dashboard.historico || []);

    document.getElementById('btnExportarRelatorio')?.addEventListener('click', () => {
      exportarRelatorio(user, dashboard, cicloAtual);
    });
  } catch (err) {
    API.Util.mostrarErro(err);
  }

  function preencherResumo(dashboard, ciclo, ranking) {
    const resultados = dashboard.resultadosPorSoftskill || [];
    const mediasPorTipo = ['AUTO', 'LIDER', '360'].reduce((acc, tipo) => {
      const itens = resultados.filter(r => (r.tipo || '').toUpperCase() === tipo && r.media != null);
      acc[tipo] = itens.length ? itens.reduce((soma, item) => soma + Number(item.media || 0), 0) / itens.length : null;
      return acc;
    }, {});

    preencherBarra('Auto', mediasPorTipo.AUTO);
    preencherBarra('Lider', mediasPorTipo.LIDER);
    preencherBarra('360', mediasPorTipo['360']);

    document.getElementById('resultadoCicloLabel').textContent =
      `${ciclo.nome} • ${resultados.length} resultado(s) consolidado(s)`;
    document.getElementById('bannerCicloTexto').textContent =
      `O ciclo de avaliação ${ciclo.nome} está aberto até ${API.Util.formatarData(ciclo.dataFim)}.`;
    document.getElementById('mediaGlobal').textContent = `${API.Util.formatarNota(dashboard.mediaGeral)}/10`;

    const posicao = ranking.findIndex(item => item.idUsuario === user.idUsuario);
    document.getElementById('percentilEquipe').textContent =
      posicao >= 0 ? `#${posicao + 1} de ${ranking.length}` : 'Sem ranking';

    const statusEl = document.getElementById('statusGeral');
    statusEl.textContent = dashboard.nivelGeral || 'Sem avaliação';
    statusEl.style.color = API.Util.corDoNivel(dashboard.corGeral);
  }

  function preencherBarra(sufixo, media) {
    const valorEl = document.getElementById(`valor${sufixo}`);
    const barraEl = document.getElementById(`barra${sufixo}`);
    valorEl.textContent = media == null ? '—' : `${API.Util.formatarNota(media)}/10`;
    barraEl.style.width = `${Math.max(0, Math.min(100, Math.round(Number(media || 0))))}%`;
  }

  function renderizarPendencias(minhasAvaliacoes, colegas, softskills, ciclo) {
    const lista = document.getElementById('listaPendencias');
    const totalSoftskills = softskills.length || 1;
    const progresso = new Map();

    (minhasAvaliacoes || []).forEach(item => {
      const chave = `${(item.tipo || '').toUpperCase()}:${item.idAvaliado}`;
      const atual = progresso.get(chave) || new Set();
      atual.add(item.idSoftskill);
      progresso.set(chave, atual);
    });

    const pendencias = [];
    const auto = progresso.get(`AUTO:${user.idUsuario}`)?.size || 0;
    if (auto < totalSoftskills) {
      pendencias.push({
        titulo: 'Concluir sua autoavaliação',
        descricao: `${auto}/${totalSoftskills} soft skills avaliadas`,
      });
    }

    colegas.forEach(colega => {
      const enviados = progresso.get(`360:${colega.idUsuario}`)?.size || 0;
      if (enviados < totalSoftskills) {
        pendencias.push({
          titulo: `Avaliar ${colega.nome} no 360°`,
          descricao: `${enviados}/${totalSoftskills} soft skills respondidas`,
        });
      }
    });

    if (!pendencias.length) {
      lista.innerHTML = `
        <div class="task-item">
          <div class="custom-checkbox"></div>
          <div class="task-info">
            <h4>Todas as avaliações do ciclo ${API.Util.escaparHtml(ciclo.nome)} estão em dia</h4>
            <p>Seu painel está sem pendências.</p>
          </div>
        </div>`;
      return;
    }

    lista.innerHTML = pendencias.slice(0, 5).map(item => `
      <div class="task-item">
        <div class="custom-checkbox"></div>
        <div class="task-info">
          <h4>${API.Util.escaparHtml(item.titulo)}</h4>
          <p>${API.Util.escaparHtml(item.descricao)}</p>
        </div>
      </div>`).join('');
  }

  function renderizarPdi(resultados) {
    const lista = document.getElementById('listaPdi');
    const agrupados = API.Util.agruparResultados(resultados)
      .map(item => {
        const medias = Object.values(item.tipos).map(tipo => Number(tipo.media || 0)).filter(Boolean);
        const media = medias.length ? medias.reduce((soma, valor) => soma + valor, 0) / medias.length : null;
        const piorResultado = Object.values(item.tipos).sort((a, b) => Number(a.media || 0) - Number(b.media || 0))[0];
        return {
          nomeSoftskill: item.nomeSoftskill,
          media,
          cor: piorResultado?.cor || 'CINZA',
          nivel: piorResultado?.nivel || 'Sem avaliação',
        };
      })
      .filter(item => item.media != null)
      .sort((a, b) => a.media - b.media)
      .slice(0, 3);

    if (!agrupados.length) {
      lista.innerHTML = `
        <div class="pdi-item">
          <div class="pdi-header">
            <span class="pdi-title">Nenhuma recomendação disponível</span>
            <span class="badge warning">Aguardando avaliações</span>
          </div>
          <p class="pdi-quote">Assim que você concluir as avaliações do ciclo, vamos sugerir ações de desenvolvimento aqui.</p>
        </div>`;
      return;
    }

    lista.innerHTML = agrupados.map(item => {
      const badgeClass = item.cor === 'VERMELHO' ? 'critical' : 'warning';
      return `
        <div class="pdi-item">
          <div class="pdi-header">
            <span class="pdi-title">${API.Util.escaparHtml(item.nomeSoftskill)}</span>
            <span class="badge ${badgeClass}">${API.Util.escaparHtml(item.nivel)}</span>
          </div>
          <p class="pdi-quote">${API.Util.escaparHtml(sugestaoParaSkill(item.nomeSoftskill))}</p>
          <div class="pdi-suggestion">
            <i class="fa-solid fa-book"></i> Próximo passo: ${API.Util.escaparHtml(acaoParaSkill(item.nomeSoftskill))}
          </div>
        </div>`;
    }).join('');
  }

  function renderizarHistorico(historico) {
    const canvas = document.getElementById('evolutionChart');
    if (!canvas || !window.Chart) return;

    const pontos = (historico || []).slice().reverse();
    const labels = pontos.map(item => item.nomeCiclo);
    const valores = pontos.map(item => item.mediaGeral == null ? null : Number(API.Util.formatarNota(item.mediaGeral)));

    new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Média Geral',
          data: valores,
          borderColor: '#0b4bcc',
          backgroundColor: 'rgba(11, 75, 204, 0.12)',
          borderWidth: 3,
          pointBackgroundColor: '#0b4bcc',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          tension: 0.35,
          fill: true,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            min: 0,
            max: 10,
            ticks: { color: '#94a3b8' },
            grid: { color: '#e5e7eb' },
          },
          x: {
            ticks: { color: '#94a3b8' },
            grid: { display: false },
          },
        },
      },
    });
  }

  function renderizarSemCiclo() {
    document.getElementById('bannerCicloTexto').textContent = 'Nenhum ciclo de avaliação está aberto no momento.';
    document.getElementById('resultadoCicloLabel').textContent = 'Abra um ciclo para começar';
    document.getElementById('listaPendencias').innerHTML = `
      <div class="task-item">
        <div class="custom-checkbox"></div>
        <div class="task-info">
          <h4>Sem pendências</h4>
          <p>Não existe um ciclo aberto para responder avaliações.</p>
        </div>
      </div>`;
    document.getElementById('listaPdi').innerHTML = `
      <div class="pdi-item">
        <div class="pdi-header">
          <span class="pdi-title">Sem dados consolidados</span>
          <span class="badge warning">Aguardando</span>
        </div>
        <p class="pdi-quote">Assim que um novo ciclo for aberto, seu painel será atualizado automaticamente.</p>
      </div>`;
  }

  function exportarRelatorio(usuario, dashboard, ciclo) {
    const linhas = [
      ['Relatorio', 'Desempenho Individual'],
      ['Colaborador', usuario.nome],
      ['Cargo', usuario.cargo],
      ['Ciclo', ciclo.nome],
      ['Media Geral', API.Util.formatarNota(dashboard.mediaGeral)],
      [],
      ['Soft skill', 'Tipo', 'Media (0-10)', 'Nivel'],
      ...(dashboard.resultadosPorSoftskill || []).map(item => [
        item.nomeSoftskill,
        API.Util.labelTipo(item.tipo),
        API.Util.formatarNota(item.media),
        item.nivel,
      ]),
      [],
      ['Historico'],
      ['Ciclo', 'Media (0-10)', 'Cor'],
      ...(dashboard.historico || []).map(item => [
        item.nomeCiclo,
        API.Util.formatarNota(item.mediaGeral),
        item.cor,
      ]),
    ];
    API.Util.baixarCSV(`relatorio-${usuario.nome.toLowerCase().replace(/\s+/g, '-')}.csv`, linhas);
  }

  function sugestaoParaSkill(nome) {
    const skill = String(nome || '').toLowerCase();
    if (skill.includes('comunica')) return 'Pratique alinhamentos curtos e objetivos nas entregas do dia a dia.';
    if (skill.includes('equipe')) return 'Busque mais trocas com colegas e compartilhe aprendizados recorrentes.';
    if (skill.includes('proatividade')) return 'Antecipe riscos e proponha próximos passos antes que o bloqueio cresça.';
    if (skill.includes('lider')) return 'Exercite influência positiva em pequenas iniciativas e rituais do time.';
    if (skill.includes('problema')) return 'Estruture o problema em etapas menores antes de partir para a solução.';
    return 'Monte um plano simples de evolução com metas curtas para as próximas semanas.';
  }

  function acaoParaSkill(nome) {
    const skill = String(nome || '').toLowerCase();
    if (skill.includes('comunica')) return 'pedir feedback sobre clareza em reuniões e mensagens';
    if (skill.includes('equipe')) return 'conduzir uma entrega em parceria com outro colega';
    if (skill.includes('proatividade')) return 'registrar riscos e ações preventivas toda semana';
    if (skill.includes('lider')) return 'assumir a facilitação de um ritual do time';
    if (skill.includes('problema')) return 'usar um checklist de análise antes de implementar correções';
    return 'definir um objetivo de melhoria e revisar seu avanço quinzenalmente';
  }
})();
