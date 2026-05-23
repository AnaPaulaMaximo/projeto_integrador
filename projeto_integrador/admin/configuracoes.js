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

  // ---------- Softskills ----------
  const tbodySoft = document.getElementById('tbodySoft');
  const modalSoft = document.getElementById('modalSoft');
  const formSoft  = document.getElementById('formSoft');
  document.getElementById('btnNovaSoft').addEventListener('click', () => abrirModal(modalSoft, formSoft, null));

  async function carregarSoft() {
    try {
      const lista = await API.Softskills.listarTodas();
      if (!lista.length) {
        tbodySoft.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#888;padding:1rem">Nenhuma softskill.</td></tr>';
        return;
      }
      tbodySoft.innerHTML = lista.map(s => `
        <tr>
          <td><strong>${esc(s.nome)}</strong></td>
          <td class="text-gray">${esc(s.descricao)}</td>
          <td>
            <button class="btn-link" data-editar="${s.idSoftskill}">Editar</button>
            <button class="btn-link danger" data-excluir="${s.idSoftskill}">Excluir</button>
          </td>
        </tr>`).join('');
      tbodySoft.querySelectorAll('[data-editar]').forEach(b => b.addEventListener('click', () => {
        const s = lista.find(x => x.idSoftskill === Number(b.dataset.editar));
        abrirModal(modalSoft, formSoft, s, { idSoftskill: s.idSoftskill });
      }));
      tbodySoft.querySelectorAll('[data-excluir]').forEach(b => b.addEventListener('click', async () => {
        if (!confirm('Excluir esta softskill? Essa ação não poderá ser desfeita.')) return;
        try { await API.Softskills.excluir(Number(b.dataset.excluir)); await carregarSoft(); }
        catch (err) { API.Util.mostrarErro(err); }
      }));
    } catch (err) { API.Util.mostrarErro(err); }
  }

  formSoft.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = { nome: formSoft.nome.value.trim(), descricao: formSoft.descricao.value.trim() };
    const id   = formSoft.idSoftskill.value;
    try {
      if (id) await API.Softskills.atualizar(Number(id), data);
      else    await API.Softskills.criar(data);
      modalSoft.hidden = true;
      await carregarSoft();
    } catch (err) { API.Util.mostrarErro(err); }
  });

  // ---------- Equipes ----------
  const tbodyEq = document.getElementById('tbodyEq');
  const modalEq = document.getElementById('modalEq');
  const formEq  = document.getElementById('formEq');
  document.getElementById('btnNovaEq').addEventListener('click', () => abrirModal(modalEq, formEq, null));

  async function carregarEq() {
    try {
      const lista = await API.Equipes.listarTodas();
      if (!lista.length) {
        tbodyEq.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#888;padding:1rem">Nenhuma equipe.</td></tr>';
        return;
      }
      // Busca membros em paralelo (tolerante a falha)
      const membros = await Promise.all(lista.map(e =>
        API.Usuarios.listarPorEquipe(e.idEquipe).then(m => m.length).catch(() => 0)));

      tbodyEq.innerHTML = lista.map((e, i) => `
        <tr>
          <td><strong>${esc(e.nome)}</strong></td>
          <td class="text-gray">${membros[i]} membro(s)</td>
          <td>
            <button class="btn-link" data-editar="${e.idEquipe}">Editar</button>
            <button class="btn-link danger" data-excluir="${e.idEquipe}">Excluir</button>
          </td>
        </tr>`).join('');
      tbodyEq.querySelectorAll('[data-editar]').forEach(b => b.addEventListener('click', () => {
        const e = lista.find(x => x.idEquipe === Number(b.dataset.editar));
        abrirModal(modalEq, formEq, e, { idEquipe: e.idEquipe });
      }));
      tbodyEq.querySelectorAll('[data-excluir]').forEach(b => b.addEventListener('click', async () => {
        if (!confirm('Excluir esta equipe?')) return;
        try { await API.Equipes.excluir(Number(b.dataset.excluir)); await carregarEq(); }
        catch (err) { API.Util.mostrarErro(err); }
      }));
    } catch (err) { API.Util.mostrarErro(err); }
  }

  formEq.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = { nome: formEq.nome.value.trim() };
    const id   = formEq.idEquipe.value;
    try {
      if (id) await API.Equipes.atualizar(Number(id), data);
      else    await API.Equipes.criar(data);
      modalEq.hidden = true;
      await carregarEq();
    } catch (err) { API.Util.mostrarErro(err); }
  });

  // ---------- Util de modais ----------
  document.querySelectorAll('[data-fechar]').forEach(b => {
    b.addEventListener('click', () => { document.getElementById(b.dataset.fechar).hidden = true; });
  });
  [modalSoft, modalEq].forEach(m => m.addEventListener('click', e => { if (e.target === m) m.hidden = true; }));

  function abrirModal(modal, form, obj, ids) {
    form.reset();
    // Preenche campos se obj
    if (obj) {
      Object.keys(obj).forEach(k => { if (form.elements[k]) form.elements[k].value = obj[k]; });
    }
    modal.hidden = false;
  }

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  carregarSoft();
  carregarEq();
})();
