document.addEventListener('DOMContentLoaded', function() {
    
    // --- LÓGICA DO GRÁFICO (CHART.JS) ---
    const canvasGrafico = document.getElementById('graficoHabilidades');
    
    if (canvasGrafico) {
        const contextoGrafico = canvasGrafico.getContext('2d');
        new Chart(contextoGrafico, {
            type: 'radar',
            data: {
                labels: ['Liderança', 'Comunicação', 'Resiliência', 'Trabalho em Equipe', 'Inovação'],
                datasets: [{
                    label: 'Média do Time',
                    data: [8.5, 9, 8, 9.5, 7.5], 
                    backgroundColor: 'rgba(13, 71, 161, 0.1)', 
                    borderColor: '#0d47a1', 
                    pointBackgroundColor: '#0d47a1',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#0d47a1',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            circular: true
                        },
                        pointLabels: {
                            font: {
                                family: "'Inter', sans-serif",
                                size: 10,
                                weight: '600'
                            },
                            color: '#64748b' 
                        },
                        ticks: {
                            display: false, 
                            min: 0,
                            max: 10
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false 
                    },
                    tooltip: {
                        backgroundColor: 'rgba(13, 71, 161, 0.9)'
                    }
                }
            }
        });
    }

    // --- LÓGICA DOS MODAIS ---

    // Função genérica para abrir modal
    function abrirModal(idModal) {
        document.getElementById(idModal).style.display = 'flex';
    }

    // Função genérica para fechar modal
    function fecharModal(idModal) {
        document.getElementById(idModal).style.display = 'none';
    }

    // Fechar modais ao clicar no fundo escuro
    window.addEventListener('click', function(evento) {
        if (evento.target.classList.contains('modal-fundo')) {
            evento.target.style.display = 'none';
        }
    });

    // Eventos do Modal: Adicionar Usuário
    const btnAddUsuario = document.getElementById('btnAdicionarUsuario');
    if (btnAddUsuario) {
        btnAddUsuario.addEventListener('click', () => abrirModal('modalUsuario'));
        document.getElementById('iconeFecharUsuario').addEventListener('click', () => fecharModal('modalUsuario'));
        document.getElementById('btnCancelarUsuario').addEventListener('click', () => fecharModal('modalUsuario'));
    }

    // Eventos do Modal: Novo Relatório
    const btnNovoRelatorio = document.getElementById('btnNovoRelatorio');
    if (btnNovoRelatorio) {
        btnNovoRelatorio.addEventListener('click', () => abrirModal('modalRelatorio'));
        document.getElementById('iconeFecharRelatorio').addEventListener('click', () => fecharModal('modalRelatorio'));
        document.getElementById('btnCancelarRelatorio').addEventListener('click', () => fecharModal('modalRelatorio'));
    }

    // Eventos do Modal: Nova Avaliação
    const btnNovaAvaliacao = document.getElementById('btnNovaAvaliacao');
    if (btnNovaAvaliacao) {
        btnNovaAvaliacao.addEventListener('click', () => abrirModal('modalAvaliacao'));
        document.getElementById('iconeFecharAvaliacao').addEventListener('click', () => fecharModal('modalAvaliacao'));
        document.getElementById('btnCancelarAvaliacao').addEventListener('click', () => fecharModal('modalAvaliacao'));
    }
});