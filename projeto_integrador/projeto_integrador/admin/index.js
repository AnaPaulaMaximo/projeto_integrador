(async () => {
  const user = await API.Auth.requireAuth(['ADMIN']);
  if (!user) return;

  API.Util.bindLogout();
  API.Util.bindSuporte();
  inicializarAvatar(user);

  document.getElementById('btnAdicionarUsuario')?.addEventListener('click', () => {
    location.href = 'colaboradores.html';
  });

  // Sino de notificações
  document.getElementById('sinoNotificacoes')?.addEventListener('click', () => {
    const p = document.getElementById('painelNotificacoes');
    if (p) p.hidden = !p.hidden;
  });

  try {
    const [colaboradores, cicloAtual, ciclos] = await Promise.all([
      API.Usuarios.listarPorPerfil('COLABORADOR').catch(() => []),
      API.Ciclos.atual().catch(() => null),
      API.Ciclos.listarTodos().catch(() => []),
    ]);

    document.getElementById('statTotalColaboradores').textContent = colaboradores.length;

    if (cicloAtual) {
      document.getElementById('statCicloNome').textContent = cicloAtual.nome;
      document.getElementById('statCicloStatus').textContent = cicloAtual.status;

      const pendentes = await API.Avaliacoes.pendentes(cicloAtual.idCiclo).catch(() => []);
      document.getElementById('statPendencias').textContent = pendentes.length;

      const totalColab = colaboradores.length || 1;
      const adesao = Math.max(0, Math.min(100, Math.round(((totalColab - pendentes.length) / totalColab) * 100)));
      document.getElementById('statAdesaoValor').textContent = adesao + '%';
      document.getElementById('statAdesaoBar').style.width = adesao + '%';
      document.getElementById('statAdesaoLabel').textContent = '';

      // Sino: contador + painel
      const contador = document.getElementById('contadorPendentes');
      if (contador) {
        if (pendentes.length) { contador.textContent = pendentes.length; contador.hidden = false; }
        else                  { contador.hidden = true; }
      }
      const painelLista = document.getElementById('listaPendentesPanel');
      if (painelLista) {
        painelLista.innerHTML = pendentes.length
          ? pendentes.map(p => `<div class="painel-item"><strong>${escapar(p.nome)}</strong><br><span class="text-gray" style="font-size:11px">${escapar(p.email || '')}</span></div>`).join('')
          : '<div class="text-gray" style="padding:8px">Nenhuma pendência. 🎉</div>';
      }

      renderizarPendentes(pendentes);
    } else {
      document.getElementById('statCicloNome').textContent = 'Nenhum ciclo aberto';
      document.getElementById('statCicloStatus').textContent = '—';
      document.getElementById('statPendencias').textContent = '0';
      document.getElementById('statAdesaoValor').textContent = '—';
      document.getElementById('listaPendentes').innerHTML =
        '<div style="color:#888;text-align:center;padding:1rem">Nenhum ciclo aberto.</div>';
    }

    renderizarCiclos(ciclos);
  } catch (err) {
    API.Util.mostrarErro(err);
  }

  function inicializarAvatar(u) {
    const el = document.getElementById('avatarIniciais');
    if (!el) return;
    const iniciais = (u.nome || '?').split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase();
    el.textContent = iniciais;
    el.title = u.nome;
  }

  function renderizarCiclos(ciclos) {
    const tbody = document.getElementById('tbodyCiclos');
    if (!ciclos.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;padding:1rem">Nenhum ciclo cadastrado.</td></tr>';
      return;
    }
    tbody.innerHTML = ciclos.map(c => {
      const statusClass = c.status === 'ABERTO' ? 'status-aberto' : 'status-concluido';
      const statusTexto = c.status === 'ABERTO' ? 'Em Aberto' : 'Fechado';
      const acao = c.status === 'ABERTO'
        ? `<button class="btn-link" data-acao="fechar" data-id="${c.idCiclo}">Fechar</button>`
        : `<button class="btn-link" data-acao="reabrir" data-id="${c.idCiclo}">Reabrir</button>`;
      return `<tr>
        <td><strong>${escapar(c.nome)}</strong></td>
        <td class="text-gray">${API.Util.formatarData(c.dataInicio)}</td>
        <td class="text-gray">${API.Util.formatarData(c.dataFim)}</td>
        <td><span class="status-badge ${statusClass}">${statusTexto}</span></td>
        <td>${acao}</td>
      </tr>`;
    }).join('');

    tbody.querySelectorAll('button[data-acao]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.dataset.id);
        const acao = btn.dataset.acao;
        if (!confirm(`Confirmar ${acao} do ciclo?`)) return;
        try {
          if (acao === 'fechar')  await API.Ciclos.fechar(id);
          if (acao === 'reabrir') await API.Ciclos.reabrir(id);
          location.reload();
        } catch (err) { API.Util.mostrarErro(err); }
      });
    });
  }

  function renderizarPendentes(pendentes) {
    const lista = document.getElementById('listaPendentes');
    if (!pendentes.length) {
      lista.innerHTML = '<div style="color:#888;text-align:center;padding:1rem">Ninguém pendente. 🎉</div>';
      return;
    }
    lista.innerHTML = pendentes.slice(0, 10).map(p => `
      <div class="activity-item">
        <div class="activity-avatar avatar-iniciais">${iniciaisDe(p.nome)}</div>
        <div class="activity-details">
          <strong>${escapar(p.nome)}</strong>
          <span class="activity-desc">${escapar(p.email || '')} &bull; Avaliação pendente</span>
        </div>
      </div>`).join('');
  }

  function iniciaisDe(nome) {
    return (nome || '?').split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase();
  }

  function escapar(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }
})();
