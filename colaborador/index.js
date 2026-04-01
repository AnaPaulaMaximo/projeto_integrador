document.addEventListener('DOMContentLoaded', function() {
    const canvasGrafico = document.getElementById('graficoHabilidades');
    if (canvasGrafico) {
        const contextoGrafico = canvasGrafico.getContext('2d');
        new Chart(contextoGrafico, {
            type: 'radar',
            data: {
                labels: ['Liderança', 'Comunicação', 'Resiliência', 'Trabalho em Equipe', 'Inovação'],
                datasets: [{
                    label: 'Média do Colaborador',
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
                        angleLines: { display: true, color: 'rgba(0, 0, 0, 0.05)' },
                        grid: { color: 'rgba(0, 0, 0, 0.05)', circular: true },
                        pointLabels: { font: { family: "'Inter', sans-serif", size: 10, weight: '600' }, color: '#64748b' },
                        ticks: { display: false, min: 0, max: 10 }
                    }
                },
                plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(13, 71, 161, 0.9)' } }
            }
        });
    }
});