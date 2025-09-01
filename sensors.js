// Sensor data simulation
const sensorData = {
    temperature: 22,
    humidity: 55,
    co2: 600,
    lightLevel: 500,
    occupancy: 2,
    noiseLevel: 45,
    history: {
        temperature: [],
        humidity: [],
        co2: [],
        lightLevel: [],
        occupancy: [],
        noiseLevel: []
    }
};

const sensorRanges = {
    temperature: { min: 18, max: 28, unit: '°C' },
    humidity: { min: 40, max: 70, unit: '%' },
    co2: { min: 400, max: 2000, unit: ' ppm' },
    lightLevel: { min: 0, max: 1000, unit: ' lux' },
    occupancy: { min: 0, max: 5, unit: '' },
    noiseLevel: { min: 30, max: 80, unit: ' dB' }
};

const alertThresholds = {
    temperature: { low: 18, high: 26 },
    humidity: { low: 40, high: 65 },
    co2: { low: 400, high: 1000 },
    lightLevel: { low: 100, high: 900 },
    noiseLevel: { low: 30, high: 70 }
};

let simulationInterval;
let historyInterval;

function startSensorSimulation() {
    // Update sensor values every second
    simulationInterval = setInterval(() => {
        updateSensorValues();
        displaySensorData();
        checkAlerts();
    }, 1000);

    // Store history every 2 seconds
    historyInterval = setInterval(() => {
        storeSensorHistory();
    }, 2000);
}

function updateSensorValues() {
    // Temperature changes slowly
    sensorData.temperature += (Math.random() - 0.5) * 0.5;
    sensorData.temperature = Math.max(
        sensorRanges.temperature.min,
        Math.min(sensorRanges.temperature.max, sensorData.temperature)
    );

    // Humidity changes slowly
    sensorData.humidity += (Math.random() - 0.5) * 2;
    sensorData.humidity = Math.max(
        sensorRanges.humidity.min,
        Math.min(sensorRanges.humidity.max, sensorData.humidity)
    );

    // CO2 fluctuates based on occupancy
    const co2Change = sensorData.occupancy > 0 ? 
        (Math.random() * 20) : -(Math.random() * 10);
    sensorData.co2 += co2Change;
    sensorData.co2 = Math.max(
        sensorRanges.co2.min,
        Math.min(sensorRanges.co2.max, sensorData.co2)
    );

    // Light level changes based on time and lights status
    const lightsOn = document.getElementById('lights-toggle')?.checked;
    if (lightsOn) {
        sensorData.lightLevel = 600 + Math.random() * 200;
    } else {
        sensorData.lightLevel = 50 + Math.random() * 100;
    }

    // Occupancy changes occasionally
    if (Math.random() < 0.02) {
        sensorData.occupancy = Math.floor(Math.random() * 6);
    }

    // Noise level fluctuates
    sensorData.noiseLevel = 35 + Math.random() * 30 + (sensorData.occupancy * 5);
    sensorData.noiseLevel = Math.min(
        sensorRanges.noiseLevel.max,
        sensorData.noiseLevel
    );
}

function displaySensorData() {
    document.getElementById('temp-value').textContent = 
        sensorData.temperature.toFixed(1) + sensorRanges.temperature.unit;
    
    document.getElementById('humidity-value').textContent = 
        Math.round(sensorData.humidity) + sensorRanges.humidity.unit;
    
    document.getElementById('co2-value').textContent = 
        Math.round(sensorData.co2) + sensorRanges.co2.unit;
    
    document.getElementById('light-value').textContent = 
        Math.round(sensorData.lightLevel) + sensorRanges.lightLevel.unit;
    
    document.getElementById('occupancy-value').textContent = 
        sensorData.occupancy + (sensorData.occupancy === 1 ? ' person' : ' people');
    
    document.getElementById('noise-value').textContent = 
        Math.round(sensorData.noiseLevel) + sensorRanges.noiseLevel.unit;

    // Update sensor item backgrounds based on thresholds
    updateSensorItemStyles();
}

function updateSensorItemStyles() {
    const sensorItems = document.querySelectorAll('.sensor-item');
    
    // Temperature
    if (sensorData.temperature < alertThresholds.temperature.low || 
        sensorData.temperature > alertThresholds.temperature.high) {
        sensorItems[0].style.background = '#ffebee';
    } else {
        sensorItems[0].style.background = '#f8f9fa';
    }

    // CO2
    if (sensorData.co2 > alertThresholds.co2.high) {
        sensorItems[2].style.background = '#ffebee';
    } else if (sensorData.co2 > 800) {
        sensorItems[2].style.background = '#fff3e0';
    } else {
        sensorItems[2].style.background = '#f8f9fa';
    }

    // Noise
    if (sensorData.noiseLevel > alertThresholds.noiseLevel.high) {
        sensorItems[5].style.background = '#ffebee';
    } else {
        sensorItems[5].style.background = '#f8f9fa';
    }
}

function storeSensorHistory() {
    const maxHistoryLength = 30; // Keep last 60 seconds (30 data points at 2s intervals)
    
    Object.keys(sensorData.history).forEach(key => {
        if (sensorData[key] !== undefined) {
            sensorData.history[key].push(sensorData[key]);
            
            // Keep only recent history
            if (sensorData.history[key].length > maxHistoryLength) {
                sensorData.history[key].shift();
            }
        }
    });

    // Update charts if they exist
    if (window.updateCharts) {
        window.updateCharts();
    }
}

function checkAlerts() {
    const alerts = [];

    // Check temperature
    if (sensorData.temperature > alertThresholds.temperature.high) {
        alerts.push({
            type: 'warning',
            message: `🌡️ High temperature: ${sensorData.temperature.toFixed(1)}°C`
        });
    } else if (sensorData.temperature < alertThresholds.temperature.low) {
        alerts.push({
            type: 'warning',
            message: `🌡️ Low temperature: ${sensorData.temperature.toFixed(1)}°C`
        });
    }

    // Check CO2
    if (sensorData.co2 > alertThresholds.co2.high) {
        alerts.push({
            type: 'danger',
            message: `🌬️ High CO₂ level: ${Math.round(sensorData.co2)} ppm - Ventilation needed!`
        });
    }

    // Check noise
    if (sensorData.noiseLevel > alertThresholds.noiseLevel.high) {
        alerts.push({
            type: 'warning',
            message: `🔊 High noise level: ${Math.round(sensorData.noiseLevel)} dB`
        });
    }

    // Display alerts
    if (alerts.length > 0 && Math.random() < 0.1) { // Show alerts occasionally, not every second
        showAlert(alerts[0]);
    }
}

function showAlert(alert) {
    const alertContainer = document.getElementById('alert-container');
    const alertElement = document.createElement('div');
    alertElement.className = `alert ${alert.type}`;
    alertElement.innerHTML = alert.message;
    
    alertContainer.appendChild(alertElement);
    
    // Remove alert after 5 seconds
    setTimeout(() => {
        alertElement.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            alertElement.remove();
        }, 300);
    }, 5000);
}

// Utility function to get current sensor data
function getCurrentSensorData() {
    return sensorData;
}

// Utility function to adjust sensor based on controls
function adjustSensorForControl(control, value) {
    switch(control) {
        case 'ac':
            if (value) {
                // AC on - temperature gradually decreases
                sensorData.temperature -= 0.3;
            } else {
                // AC off - temperature gradually increases
                sensorData.temperature += 0.1;
            }
            break;
        case 'lights':
            // Immediate light level change handled in updateSensorValues
            break;
        case 'computer':
            if (value) {
                // Computer on - slight temperature and noise increase
                sensorData.temperature += 0.1;
                sensorData.noiseLevel += 5;
            } else {
                sensorData.noiseLevel -= 5;
            }
            break;
    }
}

// Export for use in other modules
window.sensorAPI = {
    startSimulation: startSensorSimulation,
    getData: getCurrentSensorData,
    adjustForControl: adjustSensorForControl
};