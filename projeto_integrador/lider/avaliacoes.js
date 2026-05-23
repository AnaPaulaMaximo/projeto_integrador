(async () => {
  const user = await API.Auth.requireAuth(['LIDER']);
  if (!user) return;

  API.Util.bindLogout();
  API.Util.bindSuporte();
  API.Util.preencherPerfil(user, { avatarSelector: '#avatarIniciais' });

  const tbody = document.getElementById('tbodyAvaliacoes');
  const modal = document.getElementById('modalAvaliacao');
  const selectTipo = document.getElementById('tipoAvaliacao');
  const selectAvaliado = document.getElementById('avaliadoAvaliacao');
  const inputCiclo = document.getElementById('prazoAvaliacao');
  const checkboxAnonimo = document.getElementById('anonimatoAvaliacao');
  const listaSoftskillsForm = document.getElementById('listaSoftskillsForm');

  let cicloAtual = null;
  let ciclosAbertos = [];
  let softskills = [];
  let colegas = [];
  let minhasAvaliacoes = [];
  let tarefas = [];

  document.getElementById('btnNovaAvaliacao')?.addEventListener('click', () => abrirModal(tarefas[0] || null));
  document.getElementById('iconeFecharAvaliacao')?.addEventListener('click', fecharModal);
  document.getElementById('btnCancelarAvaliacao')?.addEventListener('click', fecharModal);
  document.getElementById('btnSalvarAvaliacao')?.addEventListener('click', salvarAvaliacoes);

  selectTipo.addEventListener('change', () => {
    popularAvaliados();
    renderizarCamposSoftskills();
  });
  selectAvaliado.addEventListener('change', renderizarCamposSoftskills);

  try {
    const [abertos, softs, colegasLista] = await Promise.all([
      API.Ciclos.listarAbertos().catch(() => []),
      API.Softskills.listarTodas().catch(() => []),
      API.Usuarios.meusColegas().catch(() => []),
    ]);

    ciclosAbertos = abertos;
    cicloAtual = ciclosAbertos[0] || null;
    softskills = softs;
    colegas = colegasLista.filter(item => item.idUsuario !== user.idUsuario);

    if (!cicloAtual) {
      renderizarSemCiclo();
      return;
    }

    minhasAvaliacoes = await API.Avaliacoes.minhas(cicloAtual.idCiclo).catch(() => []);

    inputCiclo.value = `${cicloAtual.nome} • até ${API.Util.formatarData(cicloAtual.dataFim)}`;
    popularAvaliados();
    montarTarefas();
    renderizarTarefas();
    preencherKpis();
  } catch (err) {
    API.Util.mostrarErro(err);
  }

  function montarTarefas() {
    const totalSoftskills = softskills.length || 1;
    const progresso = new Map();

    minhasAvaliacoes.forEach(item => {
      const chave = `${(item.tipo || '').toUpperCase()}:${item.idAvaliado}`;
      const atual = progresso.get(chave) || new Set();
      atual.add(item.idSoftskill);
      progresso.set(chave, atual);
    });

    tarefas = [];
    colegas.forEach(colega => {
      ['LIDER', '360'].forEach(tipo => {
        const respondidas = progresso.get(`${tipo}:${colega.idUsuario}`)?.size || 0;
        tarefas.push({
          titulo: `${API.Util.labelTipo(tipo)} • ${colega.nome}`,
          tipo,
          idAvaliado: colega.idUsuario,
          nomeAvaliado: colega.nome,
          prazo: API.Util.formatarData(cicloAtual.dataFim),
          respondidas,
          total: totalSoftskills,
        });
      });
    });
  }

  function renderizarTarefas() {
    if (!tarefas.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;padding:1rem">Nenhum colaborador disponível para avaliação.</td></tr>';
      return;
    }

    tbody.innerHTML = tarefas.map((tarefa, index) => {
      const pct = API.Util.percentual(tarefa.respondidas, tarefa.total);
      const concluida = tarefa.respondidas >= tarefa.total;
      const classe = tarefa.tipo === 'LIDER' ? 'nota-verde' : 'nota-azul';
      return `
        <tr>
          <td><strong>${API.Util.escaparHtml(tarefa.titulo)}</strong></td>
          <td><span class="emblema ${classe}">${API.Util.escaparHtml(API.Util.labelTipo(tarefa.tipo))}</span></td>
          <td>${API.Util.escaparHtml(tarefa.prazo)}</td>
          <td>
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="width:100px;height:8px;background:var(--borda);border-radius:4px;overflow:hidden;">
                <div style="width:${pct}%;height:100%;background:${concluida ? 'var(--emblema-verde-texto)' : 'var(--primaria)'};"></div>
              </div>
              <span class="texto-suave">${pct}%</span>
            </div>
          </td>
          <td>
            <a href="#" class="btn-secundario" data-tarefa="${index}" style="padding:6px 12px;font-size:0.8rem;">
              ${concluida ? 'Visualizar' : 'Responder'}
            </a>
          </td>
        </tr>`;
    }).join('');

    tbody.querySelectorAll('[data-tarefa]').forEach(el => {
      el.addEventListener('click', (event) => {
        event.preventDefault();
        abrirModal(tarefas[Number(el.dataset.tarefa)]);
      });
    });
  }

  function preencherKpis() {
    const totalSoftskills = softskills.length || 1;
    const totalEsperado = totalSoftskills * tarefas.length;
    const totalConcluido = tarefas.reduce((soma, tarefa) => soma + Math.min(tarefa.respondidas, tarefa.total), 0);
    const pct = API.Util.percentual(totalConcluido, totalEsperado);
    const pendentes = tarefas.filter(tarefa => tarefa.respondidas < tarefa.total).length;

    document.getElementById('statCiclosAbertos').textContent = ciclosAbertos.length;
    document.getElementById('statCicloAtual').textContent = cicloAtual.nome;
    document.getElementById('statPendencias').textContent = pendentes;
    document.getElementById('statPrazo').textContent = `Prazo final: ${API.Util.formatarData(cicloAtual.dataFim)}`;
    document.getElementById('statConcluido').textContent = `${pct}%`;
    document.getElementById('statConcluidoDesc').textContent = `${totalConcluido} de ${totalEsperado} respostas enviadas pela liderança`;
  }

  function popularAvaliados(tarefa = null) {
    const tipo = tarefa?.tipo || selectTipo.value || 'LIDER';
    selectTipo.value = tipo;

    selectAvaliado.innerHTML = colegas.map(item => `
      <option value="${item.idUsuario}">${API.Util.escaparHtml(item.nome)}</option>
    `).join('');

    if (tarefa) {
      selectAvaliado.value = String(tarefa.idAvaliado);
    }

    checkboxAnonimo.disabled = tipo !== '360';
    if (tipo !== '360') checkboxAnonimo.checked = false;
  }

  function abrirModal(tarefa) {
    if (!cicloAtual) return;
    popularAvaliados(tarefa);
    renderizarCamposSoftskills();
    modal.style.display = 'flex';
  }

  function fecharModal() {
    modal.style.display = 'none';
  }

  function renderizarCamposSoftskills() {
    const tipo = selectTipo.value;
    const idAvaliado = Number(selectAvaliado.value);
    const jaEnviadas = minhasAvaliacoes.filter(item =>
      Number(item.idAvaliado) === idAvaliado && (item.tipo || '').toUpperCase() === tipo
    );

    listaSoftskillsForm.innerHTML = softskills.map(skill => {
      const existente = jaEnviadas.find(item => item.idSoftskill === skill.idSoftskill);
      return `
        <div style="display:grid;grid-template-columns:1fr 220px;gap:12px;align-items:center;margin-bottom:12px;">
          <div>
            <strong>${API.Util.escaparHtml(skill.nome)}</strong>
            <div style="font-size:0.85rem;color:var(--texto-suave);">${API.Util.escaparHtml(skill.descricao || '')}</div>
          </div>
          ${existente ? `
            <div class="controle-formulario" style="display:flex;align-items:center;justify-content:center;background:#f8fafc;">
              Enviado (${API.Util.formatarNota(existente.nota)}/10)
            </div>
          ` : `
            <select class="controle-formulario" data-softskill-id="${skill.idSoftskill}">
              <option value="">Selecione um nível</option>
              <option value="90">Azul • Acima da expectativa</option>
              <option value="65">Verde • Dentro da expectativa</option>
              <option value="40">Amarelo • Abaixo da expectativa</option>
              <option value="10">Vermelho • Crítico</option>
            </select>
          `}
        </div>`;
    }).join('');
  }

  async function salvarAvaliacoes() {
    if (!cicloAtual) return;

    const tipo = selectTipo.value;
    const idAvaliado = Number(selectAvaliado.value);
    const selects = Array.from(listaSoftskillsForm.querySelectorAll('select[data-softskill-id]'));
    const faltando = selects.filter(select => !select.value);

    if (!selects.length) {
      alert('Todas as soft skills desse formulário já foram enviadas.');
      return;
    }
    if (faltando.length) {
      alert('Preencha todas as soft skills pendentes antes de salvar.');
      return;
    }

    try {
      for (const select of selects) {
        await API.Avaliacoes.registrar({
          idAvaliado,
          idSoftskill: Number(select.dataset.softskillId),
          idCiclo: cicloAtual.idCiclo,
          nota: Number(select.value),
          tipo,
          anonimato: checkboxAnonimo.checked,
        });
      }

      fecharModal();
      minhasAvaliacoes = await API.Avaliacoes.minhas(cicloAtual.idCiclo).catch(() => []);
      montarTarefas();
      renderizarTarefas();
      preencherKpis();
    } catch (err) {
      API.Util.mostrarErro(err);
    }
  }

  function renderizarSemCiclo() {
    document.getElementById('statCiclosAbertos').textContent = '0';
    document.getElementById('statCicloAtual').textContent = 'Nenhum ciclo aberto';
    document.getElementById('statPendencias').textContent = '0';
    document.getElementById('statPrazo').textContent = 'Aguardando abertura';
    document.getElementById('statConcluido').textContent = '0%';
    document.getElementById('statConcluidoDesc').textContent = 'Sem avaliações disponíveis';
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;padding:1rem">Nenhum ciclo de avaliação está aberto no momento.</td></tr>';
    document.getElementById('btnNovaAvaliacao').disabled = true;
  }
})();
