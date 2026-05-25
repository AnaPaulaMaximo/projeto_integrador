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

  const tbody        = document.getElementById('tbodyUsuarios');
  const filtroPerfil = document.getElementById('filtroPerfil');
  const busca        = document.getElementById('buscaUsuario');
  const modal        = document.getElementById('modal');
  const form         = document.getElementById('formUsuario');
  const modalTitulo  = document.getElementById('modalTitulo');
  const btnCancelar  = document.getElementById('btnCancelar');
  const btnAdd1      = document.getElementById('btnAdicionarUsuario');
  const btnAdd2      = document.getElementById('btnNovo');
  const selectEquipes = form.equipes;

  let usuarios = [];
  let equipes = [];

  async function carregar() {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;padding:1rem">Carregando...</td></tr>';
    try {
      const perfil = filtroPerfil.value;
      const [listaUsuarios, listaEquipes] = await Promise.all([
        perfil ? API.Usuarios.listarPorPerfil(perfil) : API.Usuarios.listarTodos(),
        API.Equipes.listarTodas().catch(() => []),
      ]);
      usuarios = listaUsuarios;
      equipes = listaEquipes;
      renderizar();
    } catch (err) { API.Util.mostrarErro(err); }
  }

  function renderizar() {
    const termo = (busca.value || '').toLowerCase().trim();
    const lista = usuarios.filter(u => {
      if (!termo) return true;
      return (u.nome || '').toLowerCase().includes(termo)
          || (u.email || '').toLowerCase().includes(termo)
          || (u.cargo || '').toLowerCase().includes(termo);
    });
    if (!lista.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;padding:1rem">Nenhum usuário encontrado.</td></tr>';
      return;
    }
    tbody.innerHTML = lista.map(u => `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:12px;">
            <div class="activity-avatar avatar-iniciais" style="width:32px;height:32px;font-size:12px;">${iniciais(u.nome)}</div>
            <div>
              <strong>${esc(u.nome)}</strong><br>
              <span class="text-gray" style="font-size:11px;">${esc(u.email)}</span>
            </div>
          </div>
        </td>
        <td class="text-gray">${esc(u.cargo)}</td>
        <td>${esc(u.tipoPerfil)}</td>
        <td>${badgeStatus(u.status)}</td>
        <td style="display:flex; gap:8px;">
          <button class="btn-outline" data-acao="editar" data-id="${u.idUsuario}" title="Editar" style="margin:0;padding:6px;width:32px;border-radius:6px;display:inline-flex;justify-content:center;"><i class="fa-solid fa-pen"></i></button>
          <button class="btn-outline" data-acao="${u.status === 'ATIVO' ? 'inativar' : 'ativar'}" data-id="${u.idUsuario}" title="${u.status === 'ATIVO' ? 'Inativar' : 'Ativar'}" style="margin:0;padding:6px;width:32px;border-radius:6px;display:inline-flex;justify-content:center;">
            <i class="fa-solid ${u.status === 'ATIVO' ? 'fa-user-slash' : 'fa-user-check'}"></i>
          </button>
        </td>
      </tr>`).join('');

    tbody.querySelectorAll('button[data-acao]').forEach(btn => {
      btn.addEventListener('click', () => acao(btn.dataset.acao, Number(btn.dataset.id)));
    });
  }

  async function acao(tipo, id) {
    try {
      if (tipo === 'editar') {
        const u = usuarios.find(x => x.idUsuario === id);
        abrirModal(u);
      } else if (tipo === 'inativar') {
        if (!confirm('Inativar este usuário?')) return;
        await API.Usuarios.inativar(id);
        await carregar();
      } else if (tipo === 'ativar') {
        await API.Usuarios.ativar(id);
        await carregar();
      }
    } catch (err) { API.Util.mostrarErro(err); }
  }

  async function abrirModal(u) {
    form.reset();
    preencherSelectEquipes([]);
    if (u) {
      modalTitulo.textContent = 'Editar Usuário';
      form.id.value         = u.idUsuario;
      form.nome.value       = u.nome;
      form.email.value      = u.email;
      form.cargo.value      = u.cargo;
      form.tipoPerfil.value = u.tipoPerfil;
      const idsEquipes = await obterIdsEquipesDoUsuario(u.idUsuario);
      preencherSelectEquipes(idsEquipes);
      form.dataset.equipesAtuais = JSON.stringify(idsEquipes);
    } else {
      modalTitulo.textContent = 'Novo Usuário';
      form.id.value = '';
      form.dataset.equipesAtuais = '[]';
    }
    modal.hidden = false;
  }
  function fecharModal() { modal.hidden = true; }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      nome:       form.nome.value.trim(),
      email:      form.email.value.trim(),
      cargo:      form.cargo.value.trim(),
      tipoPerfil: form.tipoPerfil.value,
    };
    const id = form.id.value;
    const selecionadas = Array.from(selectEquipes.selectedOptions).map(opt => Number(opt.value));
    const atuais = JSON.parse(form.dataset.equipesAtuais || '[]');
    try {
      let usuarioSalvo;
      if (id) usuarioSalvo = await API.Usuarios.atualizar(Number(id), data);
      else    usuarioSalvo = await API.Usuarios.criar(data);

      const idUsuario = Number(id || usuarioSalvo.idUsuario);
      const paraAdicionar = selecionadas.filter(eq => !atuais.includes(eq));
      const paraRemover = atuais.filter(eq => !selecionadas.includes(eq));

      await Promise.all([
        ...paraAdicionar.map(idEquipe => API.Usuarios.adicionarAEquipe(idUsuario, idEquipe)),
        ...paraRemover.map(idEquipe => API.Usuarios.removerDaEquipe(idUsuario, idEquipe)),
      ]);

      fecharModal();
      await carregar();
    } catch (err) { API.Util.mostrarErro(err); }
  });

  btnCancelar.addEventListener('click', fecharModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) fecharModal(); });
  btnAdd1?.addEventListener('click', () => abrirModal(null));
  btnAdd2?.addEventListener('click', () => abrirModal(null));
  filtroPerfil.addEventListener('change', carregar);
  busca.addEventListener('input', renderizar);

  async function obterIdsEquipesDoUsuario(idUsuario) {
    const membrosPorEquipe = await Promise.all(equipes.map(async equipe => ({
      idEquipe: equipe.idEquipe,
      membros: await API.Usuarios.listarPorEquipe(equipe.idEquipe).catch(() => []),
    })));
    return membrosPorEquipe
      .filter(item => item.membros.some(usuario => usuario.idUsuario === idUsuario))
      .map(item => item.idEquipe);
  }

  function preencherSelectEquipes(idsSelecionados) {
    selectEquipes.innerHTML = equipes.map(equipe => `
      <option value="${equipe.idEquipe}" ${idsSelecionados.includes(equipe.idEquipe) ? 'selected' : ''}>
        ${esc(equipe.nome)}
      </option>
    `).join('');
  }

  function iniciais(nome) {
    return (nome || '?').split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase();
  }
  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function badgeStatus(st) {
    return st === 'ATIVO'
      ? '<span class="status-badge status-aberto">Ativo</span>'
      : '<span class="status-badge" style="background:#fee2e2;color:#dc2626;">Inativo</span>';
  }

  carregar();
})();
