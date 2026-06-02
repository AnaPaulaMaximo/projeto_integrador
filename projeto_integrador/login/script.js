document.addEventListener('DOMContentLoaded', async () => {
    // Se já está logado, vai direto para a página do perfil
    try {
        const u = await API.Auth.me();
        if (u) { location.href = API.paginaInicial(u.tipoPerfil); return; }
    } catch (_) { /* não logado — segue fluxo normal */ }

    // Se o OAuth2 falhou, backend redireciona com ?error=true
    const params = new URLSearchParams(location.search);
    if (params.get('error') === 'true') {
        mostrarErro('Não foi possível autenticar com Google. Tente novamente ou use seu e-mail.');
    }

    const form    = document.getElementById('formLogin');
    const input   = document.getElementById('emailLogin');
    const erro    = document.getElementById('erroLogin');
    const btn     = form.querySelector('.botao-entrar');
    const google  = document.getElementById('btnGoogle');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        esconderErro();
        const email = (input.value || '').trim();
        if (!email) { mostrarErro('Informe um e-mail.'); return; }

        btn.disabled = true;
        btn.textContent = 'Entrando...';
        try {
            const user = await API.Auth.login(email);
            const destino = user.redirectUrl || API.paginaInicial(user.tipoPerfil);
            location.href = destino;
        } catch (err) {
            mostrarErro(err.message || 'Falha no login.');
            btn.disabled = false;
            btn.textContent = 'Entrar';
        }
    });

    if (google) {
        google.addEventListener('click', async () => {
            await API.ready;
            location.href = API.url('/oauth2/authorization/google');
        });
    }

    function mostrarErro(msg) {
        erro.textContent = msg;
        erro.hidden = false;
    }
    function esconderErro() {
        erro.textContent = '';
        erro.hidden = true;
    }
});
