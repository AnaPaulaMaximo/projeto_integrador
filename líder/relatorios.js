document.addEventListener('DOMContentLoaded', function() {
    // --- FUNÇÕES DE MODAL ---
    function abrirModal(idModal) { document.getElementById(idModal).style.display = 'flex'; }
    function fecharModal(idModal) { document.getElementById(idModal).style.display = 'none'; }

    window.addEventListener('click', function(evento) {
        if (evento.target.classList.contains('modal-fundo')) {
            evento.target.style.display = 'none';
        }
    });

    // Eventos: Novo Relatório
    const btnNovoRelatorio = document.getElementById('btnNovoRelatorio');
    if (btnNovoRelatorio) {
        btnNovoRelatorio.addEventListener('click', () => abrirModal('modalRelatorio'));
        document.getElementById('iconeFecharRelatorio').addEventListener('click', () => fecharModal('modalRelatorio'));
        document.getElementById('btnCancelarRelatorio').addEventListener('click', () => fecharModal('modalRelatorio'));
    }
});