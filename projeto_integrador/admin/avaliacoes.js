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

  const tbody       = document.getElementById('tbodyCiclos');
  const modal       = document.getElementById('modal');
  const form        = document.getElementById('formCiclo');
  const modalTitulo = document.getElementById('modalTitulo');
  const btnCancelar = document.getElementById('btnCancelar');
  const btnNovo1    = document.getElementById('btnNovoCiclo');
  const btnNovo2    = document.getElementById('btnNovoCicloTop');

  let ciclos = [];

  async function carregar() {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;padding:1rem">Carregando...</td></tr>';
    try {
      ciclos = await API.Ciclos.listarTodos();
      const abertos  = ciclos.filter(c => c.status === 'ABERTO').length;
      const fechados = ciclos.filter(c => c.status === 'FECHADO').length;
      document.getElementById('statAbertos').textContent  = abertos;
      document.getElementById('statFechados').textContent = fechados;

      const atual = ciclos.find(c => c.status === 'ABERTO');
      if (atual) {
        try {
          const pend = await API.Avaliacoes.pendentes(atual.idCiclo);
          document.getElementById('statPendentes').textContent = pend.length;
        } catch (_) { document.getElementById('statPendentes').textContent = '—'; }
      } else {
        document.getElementById('statPendentes').textContent = '0';
      }
      renderizar();
    } catch (err) { API.Util.mostrarErro(err); }
  }

  function renderizar() {
    if (!ciclos.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;padding:1rem">Nenhum ciclo cadastrado.</td></tr>';
      return;
    }
    tbody.innerHTML = ciclos.map(c => {
      const badge = c.status === 'ABERTO'
        ? '<span class="status-badge status-aberto">Aberto</span>'
        : '<span class="status-badge status-concluido">Fechado</span>';
      const toggle = c.status === 'ABERTO'
        ? `<button class="btn-link danger" data-acao="fechar" data-id="${c.idCiclo}">Fechar</button>`
        : `<button class="btn-link" data-acao="reabrir" data-id="${c.idCiclo}">Reabrir</button>`;
      return `<tr>
        <td><strong>${esc(c.nome)}</strong></td>
        <td class="text-gray">${API.Util.formatarData(c.dataInicio)}</td>
        <td class="text-gray">${API.Util.formatarData(c.dataFim)}</td>
        <td>${badge}</td>
        <td>
          <button class="btn-link" data-acao="editar" data-id="${c.idCiclo}">Editar</button>
          ${toggle}
        </td>
      </tr>`;
    }).join('');

    tbody.querySelectorAll('button[data-acao]').forEach(btn => {
      btn.addEventListener('click', () => acao(btn.dataset.acao, Number(btn.dataset.id)));
    });
  }

  async function acao(tipo, id) {
    try {
      if (tipo === 'editar') {
        abrirModal(ciclos.find(c => c.idCiclo === id));
      } else if (tipo === 'fechar') {
        if (!confirm('Fechar este ciclo? Novas avaliações não poderão ser registradas.')) return;
        await API.Ciclos.fechar(id);
        await carregar();
      } else if (tipo === 'reabrir') {
        await API.Ciclos.reabrir(id);
        await carregar();
      }
    } catch (err) { API.Util.mostrarErro(err); }
  }

  function abrirModal(c) {
    form.reset();
    if (c) {
      modalTitulo.textContent = 'Editar Ciclo';
      form.idCiclo.value    = c.idCiclo;
      form.nome.value       = c.nome;
      form.dataInicio.value = (c.dataInicio || '').slice(0, 10);
      form.dataFim.value    = (c.dataFim    || '').slice(0, 10);
      form.status.value     = c.status;
    } else {
      modalTitulo.textContent = 'Novo Ciclo';
      form.idCiclo.value = '';
      form.status.value  = 'ABERTO';
    }
    modal.hidden = false;
  }
  function fecharModal() { modal.hidden = true; }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      nome:       form.nome.value.trim(),
      dataInicio: form.dataInicio.value,
      dataFim:    form.dataFim.value,
      status:     form.status.value,
    };
    const id = form.idCiclo.value;
    try {
      if (id) await API.Ciclos.atualizar(Number(id), data);
      else    await API.Ciclos.criar(data);
      fecharModal();
      await carregar();
    } catch (err) { API.Util.mostrarErro(err); }
  });

  btnCancelar.addEventListener('click', fecharModal);
  modal.addEventListener('click', e => { if (e.target === modal) fecharModal(); });
  btnNovo1?.addEventListener('click', () => abrirModal(null));
  btnNovo2?.addEventListener('click', () => abrirModal(null));

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  carregar();
})();
