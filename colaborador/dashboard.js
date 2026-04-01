document.addEventListener('DOMContentLoaded', function() {
    const canvasEvolucao = document.getElementById('evolutionChart');
    if (canvasEvolucao) {
        const ctx = canvasEvolucao.getContext('2d');
        
        const labels = ['S1/2025', 'S2/2025', 'S1/2026', 'S2/2026'];
        const dataPoints = [7.2, 8.5, 7.8, 9.2]; 

        new Chart(ctx, {
            type: 'bar', 
            data: {
                labels: labels,
                datasets: [
                    {
                        type: 'line',
                        label: 'Evolução',
                        data: dataPoints,
                        borderColor: '#8da6da',
                        backgroundColor: '#0b4bcc',
                        borderWidth: 3,
                        pointBackgroundColor: '#0b4bcc',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 3,
                        pointRadius: 6,
                        tension: 0.4, 
                        zIndex: 2
                    },
                    {
                        type: 'bar',
                        label: 'Linhas guia',
                        data: dataPoints,
                        backgroundColor: '#4a7bd4',
                        barThickness: 3, 
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
                        display: false, 
                        grid: { display: false }
                    },
                    x: {
                        grid: {
                            color: '#e2e8f0',
                            drawBorder: false,
                            lineWidth: 1,
                            drawOnChartArea: true,
                        },
                        ticks: {
                            color: '#a3aed1',
                            font: { size: 12, weight: '600' }
                        }
                    }
                }
            }
        });
    }
});