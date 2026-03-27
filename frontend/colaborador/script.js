document.addEventListener('DOMContentLoaded', function() {
            const ctx = document.getElementById('evolutionChart').getContext('2d');
            
            // Dados aproximados baseados na imagem
            const labels = ['S1/2025', 'S2/2025', 'S1/2026', 'S2/2026'];
            const dataPoints = [7.2, 8.5, 7.8, 9.2]; 

            new Chart(ctx, {
                type: 'bar', // Usamos um tipo misto (barras e linha) para replicar as linhas verticais
                data: {
                    labels: labels,
                    datasets: [
                        {
                            type: 'line',
                            label: 'Evolução',
                            data: dataPoints,
                            borderColor: '#8da6da', // Azul claro da linha
                            backgroundColor: '#0b4bcc', // Azul escuro das bolinhas
                            borderWidth: 3,
                            pointBackgroundColor: '#0b4bcc',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 3,
                            pointRadius: 6,
                            tension: 0.4, // Faz a linha ficar curva
                            zIndex: 2
                        },
                        {
                            type: 'bar',
                            label: 'Linhas guia',
                            data: dataPoints,
                            backgroundColor: '#4a7bd4', // Azul das colunas
                            barThickness: 3, // Largura fina para parecer uma linha
                            borderRadius: 2,
                            zIndex: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: true }
                    },
                    scales: {
                        y: {
                            min: 5,
                            max: 10,
                            display: false, // Esconde o eixo Y como na imagem
                            grid: { display: false }
                        },
                        x: {
                            grid: {
                                color: '#e2e8f0',
                                drawBorder: false,
                                lineWidth: 1,
                                drawOnChartArea: true, // Desenha as linhas horizontais no fundo
                            },
                            ticks: {
                                color: '#a3aed1',
                                font: {
                                    size: 12,
                                    weight: '600'
                                }
                            }
                        }
                    }
                }
            });
        });