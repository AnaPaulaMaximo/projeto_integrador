(async () => {
  const user = await API.Auth.requireAuth(['LIDER']);
  if (!user) return;

  API.Util.bindLogout();
  API.Util.bindSuporte();
  API.Util.preencherPerfil(user, {
    nomeSelector: '[data-user-nome]',
    cargoSelector: '[data-user-cargo]',
    avatarSelector: '#avatarIniciais',
  });

  const canvas = document.getElementById('graficoEquipeLinha');
  let chart = null;

  try {
    const [equipes, cicloAtual, ciclos] = await Promise.all([
      API.Equipes.minhas().catch(() => []),
      API.Ciclos.atual().catch(() => null),
      API.Ciclos.listarTodos().catch(() => []),
    ]);

    if (!equipes.length) {
      document.getElementById('statEquipeAtual').textContent = 'Nenhuma equipe vinculada';
      document.getElementById('statCicloAtual').textContent = 'Sem ciclo';
      return;
    }

    const equipeAtual = equipes[0];
    document.getElementById('statEquipeAtual').textContent = equipeAtual.nome;

    if (!cicloAtual) {
      document.getElementById('statCicloAtual').textContent = 'Nenhum ciclo aberto';
      document.getElementById('statPendentes').textContent = '0';
      document.getElementById('statMediaEquipe').textContent = '—';
      document.getElementById('statNivelEquipe').textContent = 'Aguardando abertura';
      return;
    }

    const [membros, pendentes, ranking] = await Promise.all([
      API.Usuarios.listarPorEquipe(equipeAtual.idEquipe).catch(() => []),
      API.Avaliacoes.pendentes(cicloAtual.idCiclo).catch(() => []),
      API.Ranking.porEquipe(cicloAtual.idCiclo, equipeAtual.idEquipe).catch(() => []),
    ]);

    document.getElementById('statTotalColaboradores').textContent = membros.length;
    document.getElementById('statPendentes').textContent = pendentes.length;
    document.getElementById('statCicloAtual').textContent = cicloAtual.nome;

    const mediaEquipe = ranking.length
      ? ranking.reduce((soma, item) => soma + Number(item.mediaGeral || 0), 0) / ranking.length
      : null;

    document.getElementById('statMediaEquipe').textContent = mediaEquipe == null
      ? '—'
      : `${API.Util.formatarNota(mediaEquipe)}/10`;

    const melhor = ranking[0];
    document.getElementById('statNivelEquipe').textContent = melhor
      ? `Destaque atual: ${melhor.nome}`
      : 'Ainda sem avaliações fechadas';

    const historico = await Promise.all(ciclos.map(async ciclo => {
      const itens = await API.Ranking.porEquipe(ciclo.idCiclo, equipeAtual.idEquipe).catch(() => []);
      const media = itens.length
        ? itens.reduce((soma, item) => soma + Number(item.mediaGeral || 0), 0) / itens.length
        : null;
      return { nome: ciclo.nome, media };
    }));

    renderizarGrafico(historico);
  } catch (err) {
    API.Util.mostrarErro(err);
  }

  function renderizarGrafico(historico) {
    if (!canvas || !window.Chart) return;

    const labels = historico.map(item => item.nome).reverse();
    const dados = historico.map(item => item.media == null ? null : Number(API.Util.formatarNota(item.media))).reverse();

    if (chart) chart.destroy();
    chart = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Média da Equipe',
          data: dados,
          borderColor: '#0b4bcc',
          backgroundColor: 'rgba(11, 75, 204, 0.12)',
          borderWidth: 3,
          tension: 0.35,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: '#0b4bcc',
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
})();
