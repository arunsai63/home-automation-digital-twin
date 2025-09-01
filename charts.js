// Data visualization with Chart.js
let sensorChart;
let currentChartType = 'temperature';

function initCharts() {
    const ctx = document.getElementById('sensor-chart').getContext('2d');
    
    sensorChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: [],
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y-temp'
                },
                {
                    label: 'Humidity (%)',
                    data: [],
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y-humidity'
                },
                {
                    label: 'CO₂ (ppm/100)',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y-co2'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 10,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#333',
                    bodyColor: '#666',
                    borderColor: '#ddd',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 10
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 10
                    }
                },
                'y-temp': {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Temp (°C)',
                        font: {
                            size: 10
                        }
                    },
                    grid: {
                        drawOnChartArea: false
                    },
                    min: 15,
                    max: 30
                },
                'y-humidity': {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Humidity (%)',
                        font: {
                            size: 10
                        }
                    },
                    grid: {
                        drawOnChartArea: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    min: 30,
                    max: 80
                },
                'y-co2': {
                    type: 'linear',
                    display: false,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    },
                    min: 0,
                    max: 20
                }
            },
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
            }
        }
    });
}

function updateCharts() {
    const sensorData = window.sensorAPI.getData();
    
    // Generate time labels (last 60 seconds)
    const labels = [];
    const now = new Date();
    for (let i = sensorData.history.temperature.length - 1; i >= 0; i--) {
        const timeAgo = (sensorData.history.temperature.length - 1 - i) * 2;
        labels.push(`-${timeAgo}s`);
    }
    
    // Update chart data
    sensorChart.data.labels = labels;
    sensorChart.data.datasets[0].data = sensorData.history.temperature;
    sensorChart.data.datasets[1].data = sensorData.history.humidity;
    sensorChart.data.datasets[2].data = sensorData.history.co2.map(val => val / 100); // Scale CO2 for visibility
    
    sensorChart.update('none'); // Update without animation for smooth real-time feel
}

// Create mini gauge charts
function createGaugeDisplay(elementId, value, min, max, color) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const percentage = ((value - min) / (max - min)) * 100;
    const gauge = document.createElement('div');
    gauge.style.cssText = `
        width: 100%;
        height: 4px;
        background: #e0e0e0;
        border-radius: 2px;
        margin-top: 5px;
        position: relative;
        overflow: hidden;
    `;
    
    const fill = document.createElement('div');
    fill.style.cssText = `
        width: ${percentage}%;
        height: 100%;
        background: ${color};
        border-radius: 2px;
        transition: width 1s ease;
    `;
    
    gauge.appendChild(fill);
    
    // Replace existing gauge if present
    const existingGauge = element.parentElement.querySelector('.gauge');
    if (existingGauge) {
        existingGauge.remove();
    }
    gauge.className = 'gauge';
    element.parentElement.appendChild(gauge);
}

// Update gauges periodically
function updateGauges() {
    setInterval(() => {
        const sensorData = window.sensorAPI.getData();
        
        // Update mini progress bars under sensor values
        const sensors = [
            { id: 'temp-value', value: sensorData.temperature, min: 15, max: 30, color: '#ff6384' },
            { id: 'humidity-value', value: sensorData.humidity, min: 30, max: 80, color: '#36a2eb' },
            { id: 'co2-value', value: sensorData.co2, min: 400, max: 2000, color: '#4bc0c0' },
            { id: 'light-value', value: sensorData.lightLevel, min: 0, max: 1000, color: '#ffcd56' },
            { id: 'noise-value', value: sensorData.noiseLevel, min: 30, max: 80, color: '#9966ff' }
        ];
        
        sensors.forEach(sensor => {
            createGaugeDisplay(sensor.id, sensor.value, sensor.min, sensor.max, sensor.color);
        });
    }, 2000);
}

// Initialize performance metrics display
function initPerformanceMetrics() {
    const metricsDiv = document.createElement('div');
    metricsDiv.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.7);
        color: #0f0;
        font-family: monospace;
        font-size: 12px;
        padding: 10px;
        border-radius: 5px;
        z-index: 1000;
        display: none;
    `;
    metricsDiv.id = 'performance-metrics';
    document.body.appendChild(metricsDiv);
    
    // Toggle metrics with 'P' key
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'p') {
            metricsDiv.style.display = metricsDiv.style.display === 'none' ? 'block' : 'none';
        }
    });
    
    // Update metrics
    setInterval(() => {
        if (metricsDiv.style.display !== 'none') {
            const fps = renderer ? Math.round(1000 / 16) : 0; // Approximate FPS
            const memory = performance.memory ? 
                `${Math.round(performance.memory.usedJSHeapSize / 1048576)}MB` : 'N/A';
            
            metricsDiv.innerHTML = `
                FPS: ${fps}<br>
                Memory: ${memory}<br>
                Particles: ${acParticles ? acParticles.length : 0}<br>
                Data Points: ${sensorData.history.temperature.length * 6}
            `;
        }
    }, 1000);
}

// Export chart functions
window.updateCharts = updateCharts;
window.chartAPI = {
    init: initCharts,
    update: updateCharts,
    initGauges: updateGauges,
    initMetrics: initPerformanceMetrics
};