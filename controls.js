// Interactive controls
let controlState = {
    lights: false,
    ac: false,
    blinds: true,
    computer: false,
    music: false,
    security: false,
    acTemperature: 22,
    lightingScene: 'normal'
};

function initControls() {
    // Initialize navbar panel switching
    initNavbarPanelSwitching();
    
    // Lights toggle
    const lightsToggle = document.getElementById('lights-toggle');
    lightsToggle.addEventListener('change', (e) => {
        controlState.lights = e.target.checked;
        updateRoomLighting(controlState.lights);
        window.sensorAPI.adjustForControl('lights', controlState.lights);
        logControlChange('Lights', controlState.lights ? 'ON' : 'OFF');
    });

    // AC toggle
    const acToggle = document.getElementById('ac-toggle');
    acToggle.addEventListener('change', (e) => {
        controlState.ac = e.target.checked;
        updateAC(controlState.ac);
        window.sensorAPI.adjustForControl('ac', controlState.ac);
        logControlChange('AC Unit', controlState.ac ? 'ON' : 'OFF');
        
        if (controlState.ac) {
            startACAnimation();
        } else {
            stopACAnimation();
        }
    });

    // Blinds toggle
    const blindsToggle = document.getElementById('blinds-toggle');
    blindsToggle.checked = true; // Start with blinds open
    blindsToggle.addEventListener('change', (e) => {
        controlState.blinds = e.target.checked;
        updateBlinds(controlState.blinds);
        logControlChange('Blinds', controlState.blinds ? 'OPEN' : 'CLOSED');
    });

    // Computer toggle
    const computerToggle = document.getElementById('computer-toggle');
    computerToggle.addEventListener('change', (e) => {
        controlState.computer = e.target.checked;
        updateComputer(controlState.computer);
        window.sensorAPI.adjustForControl('computer', controlState.computer);
        logControlChange('Computer', controlState.computer ? 'ON' : 'OFF');
    });
    
    // Ceiling fan toggle
    const fanToggle = document.getElementById('fan-toggle');
    fanToggle.checked = true; // Default to ON to match the 3D scene
    fanToggle.addEventListener('change', (e) => {
        const fanOn = e.target.checked;
        if (room && room.fanOn !== undefined) {
            room.fanOn = fanOn;
        }
        logControlChange('Ceiling Fan', fanOn ? 'ON' : 'OFF');
        
        // Adjust room temperature slightly when fan is on
        if (fanOn) {
            window.sensorAPI.adjustForControl('fan', true);
        } else {
            window.sensorAPI.adjustForControl('fan', false);
        }
    });

    // Temperature slider
    const tempSlider = document.getElementById('temp-slider');
    const tempSetting = document.getElementById('temp-setting');
    tempSlider.addEventListener('input', (e) => {
        controlState.acTemperature = parseInt(e.target.value);
        tempSetting.textContent = controlState.acTemperature + '°C';
        
        if (controlState.ac) {
            logControlChange('AC Temperature', controlState.acTemperature + '°C');
        }
    });

    // Initialize temperature display
    tempSetting.textContent = controlState.acTemperature + '°C';

    // Music and security toggles removed - controls not in HTML

    // Lighting scene buttons
    const sceneButtons = document.querySelectorAll('.scene-btn');
    sceneButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const scene = e.target.getAttribute('data-scene');
            setLightingScene(scene);
            
            // Update active button
            sceneButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    // Mode buttons in navbar
    const modeButtons = document.querySelectorAll('.mode-btn');
    modeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.closest('.mode-btn').getAttribute('data-action');
            executeQuickAction(action);
            
            // Update active mode
            modeButtons.forEach(b => b.classList.remove('active'));
            e.target.closest('.mode-btn').classList.add('active');
        });
    });

    // Chart tab buttons
    const chartTabs = document.querySelectorAll('.chart-tab');
    chartTabs.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const chartType = e.target.getAttribute('data-chart');
            switchChart(chartType);
            
            // Update active tab
            chartTabs.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
}

function logControlChange(device, status) {
    console.log(`[Control] ${device}: ${status}`);
    
    // Show a subtle notification
    const notification = {
        type: 'success',
        message: `✅ ${device} ${status}`
    };
    
    const alertContainer = document.getElementById('alert-container');
    const alertElement = document.createElement('div');
    alertElement.className = `alert ${notification.type}`;
    alertElement.innerHTML = notification.message;
    alertElement.style.fontSize = '14px';
    
    alertContainer.appendChild(alertElement);
    
    // Remove notification after 2 seconds
    setTimeout(() => {
        alertElement.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            alertElement.remove();
        }, 300);
    }, 2000);
}

// AC Animation
let acAnimationInterval;
let acParticles = [];

function startACAnimation() {
    if (acAnimationInterval) return;
    
    // Create particle system for AC airflow
    const particleGeometry = new THREE.SphereGeometry(0.02, 4, 4);
    const particleMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xccddff,
        transparent: true,
        opacity: 0.6
    });
    
    acAnimationInterval = setInterval(() => {
        if (acParticles.length < 20) {
            const particle = new THREE.Mesh(particleGeometry, particleMaterial.clone());
            particle.position.set(
                -0.5 + Math.random(),
                2.3,
                -3.7
            );
            particle.velocity = {
                x: (Math.random() - 0.5) * 0.02,
                y: -0.03,
                z: 0.03 + Math.random() * 0.02
            };
            scene.add(particle);
            acParticles.push(particle);
        }
        
        // Update particles
        acParticles.forEach((particle, index) => {
            particle.position.x += particle.velocity.x;
            particle.position.y += particle.velocity.y;
            particle.position.z += particle.velocity.z;
            particle.material.opacity -= 0.01;
            
            // Remove particles that are too faint or too low
            if (particle.material.opacity <= 0 || particle.position.y < 0.5) {
                scene.remove(particle);
                acParticles.splice(index, 1);
            }
        });
    }, 50);
}

function stopACAnimation() {
    if (acAnimationInterval) {
        clearInterval(acAnimationInterval);
        acAnimationInterval = null;
        
        // Remove all particles
        acParticles.forEach(particle => {
            scene.remove(particle);
        });
        acParticles = [];
    }
}

// Keyboard shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        switch(e.key.toLowerCase()) {
            case 'l':
                // Toggle lights
                const lightsToggle = document.getElementById('lights-toggle');
                lightsToggle.checked = !lightsToggle.checked;
                lightsToggle.dispatchEvent(new Event('change'));
                break;
            case 'a':
                // Toggle AC
                const acToggle = document.getElementById('ac-toggle');
                acToggle.checked = !acToggle.checked;
                acToggle.dispatchEvent(new Event('change'));
                break;
            case 'b':
                // Toggle blinds
                const blindsToggle = document.getElementById('blinds-toggle');
                blindsToggle.checked = !blindsToggle.checked;
                blindsToggle.dispatchEvent(new Event('change'));
                break;
            case 'c':
                // Toggle computer
                const computerToggle = document.getElementById('computer-toggle');
                computerToggle.checked = !computerToggle.checked;
                computerToggle.dispatchEvent(new Event('change'));
                break;
            case 'r':
                // Reset camera view
                if (camera && controls) {
                    camera.position.set(6, 5, 7);
                    controls.target.set(0, 1.5, 0);
                    controls.update();
                }
                break;
        }
    });
}

// Smart automation based on sensor data
function initSmartAutomation() {
    setInterval(() => {
        const sensorData = window.sensorAPI.getData();
        
        // Auto-adjust AC based on temperature
        if (sensorData.temperature > 26 && !controlState.ac) {
            // Suggest turning on AC
            if (Math.random() < 0.01) { // Low probability to avoid spam
                showAlert({
                    type: 'warning',
                    message: '🤖 Smart suggestion: Turn on AC? Temperature is high.'
                });
            }
        }
        
        // Auto-adjust lights based on occupancy and time
        if (sensorData.occupancy === 0 && controlState.lights) {
            if (Math.random() < 0.005) {
                showAlert({
                    type: 'warning',
                    message: '🤖 Room is empty. Consider turning off lights to save energy.'
                });
            }
        }
        
        // CO2-based ventilation suggestion
        if (sensorData.co2 > 1200 && !controlState.blinds) {
            if (Math.random() < 0.01) {
                showAlert({
                    type: 'danger',
                    message: '🤖 High CO₂ detected! Open blinds for ventilation.'
                });
            }
        }
    }, 5000);
}

// New enhanced functions
function setLightingScene(scene) {
    controlState.lightingScene = scene;
    
    switch(scene) {
        case 'normal':
            updateRoomLighting(true);
            lights.ceiling.intensity = 1;
            break;
        case 'dimmed':
            updateRoomLighting(true);
            lights.ceiling.intensity = 0.3;
            break;
        case 'focus':
            updateRoomLighting(true);
            lights.ceiling.intensity = 1.5;
            lights.lamp.intensity = 1;
            break;
        case 'party':
            updateRoomLighting(true);
            lights.ceiling.intensity = 0.8;
            // Add color cycling effect
            startColorCycling();
            break;
    }
    
    logControlChange('Lighting Scene', scene.toUpperCase());
}

function executeQuickAction(action) {
    switch(action) {
        case 'scene-home':
            // Home mode: lights on, AC comfortable, blinds open
            document.getElementById('lights-toggle').checked = true;
            document.getElementById('lights-toggle').dispatchEvent(new Event('change'));
            document.getElementById('ac-toggle').checked = true;
            document.getElementById('ac-toggle').dispatchEvent(new Event('change'));
            document.getElementById('blinds-toggle').checked = true;
            document.getElementById('blinds-toggle').dispatchEvent(new Event('change'));
            logControlChange('Quick Action', 'HOME MODE ACTIVATED');
            break;
            
        case 'scene-away':
            // Away mode: everything off
            document.getElementById('lights-toggle').checked = false;
            document.getElementById('lights-toggle').dispatchEvent(new Event('change'));
            document.getElementById('ac-toggle').checked = false;
            document.getElementById('ac-toggle').dispatchEvent(new Event('change'));
            document.getElementById('computer-toggle').checked = false;
            document.getElementById('computer-toggle').dispatchEvent(new Event('change'));
            logControlChange('Quick Action', 'AWAY MODE ACTIVATED');
            break;
            
        case 'scene-sleep':
            // Sleep mode: lights off, AC quiet, blinds closed
            document.getElementById('lights-toggle').checked = false;
            document.getElementById('lights-toggle').dispatchEvent(new Event('change'));
            document.getElementById('blinds-toggle').checked = false;
            document.getElementById('blinds-toggle').dispatchEvent(new Event('change'));
            logControlChange('Quick Action', 'SLEEP MODE ACTIVATED');
            break;
            
        case 'scene-work':
            // Work mode: bright lights, computer on, focused environment
            document.getElementById('lights-toggle').checked = true;
            document.getElementById('lights-toggle').dispatchEvent(new Event('change'));
            document.getElementById('computer-toggle').checked = true;
            document.getElementById('computer-toggle').dispatchEvent(new Event('change'));
            setLightingScene('focus');
            logControlChange('Quick Action', 'WORK MODE ACTIVATED');
            break;
            
        case 'energy-save':
            // Eco mode: minimal energy usage
            document.getElementById('lights-toggle').checked = false;
            document.getElementById('lights-toggle').dispatchEvent(new Event('change'));
            document.getElementById('ac-toggle').checked = false;
            document.getElementById('ac-toggle').dispatchEvent(new Event('change'));
            document.getElementById('computer-toggle').checked = false;
            document.getElementById('computer-toggle').dispatchEvent(new Event('change'));
            logControlChange('Quick Action', 'ECO MODE ACTIVATED');
            break;
            
        case 'party':
            // Party mode: colorful lights
            document.getElementById('lights-toggle').checked = true;
            document.getElementById('lights-toggle').dispatchEvent(new Event('change'));
            setLightingScene('party');
            logControlChange('Quick Action', 'PARTY MODE ACTIVATED');
            break;
    }
}

function switchChart(chartType) {
    if (window.chartAPI && window.chartAPI.switchChart) {
        window.chartAPI.switchChart(chartType);
    }
    logControlChange('Chart View', chartType.toUpperCase());
}

let colorCyclingInterval;
function startColorCycling() {
    if (colorCyclingInterval) {
        clearInterval(colorCyclingInterval);
    }
    
    colorCyclingInterval = setInterval(() => {
        if (controlState.lightingScene === 'party' && controlState.lights) {
            const hue = (Date.now() / 100) % 360;
            const color = new THREE.Color().setHSL(hue / 360, 0.7, 0.6);
            if (lights.ceiling) {
                lights.ceiling.color = color;
            }
        } else {
            clearInterval(colorCyclingInterval);
            colorCyclingInterval = null;
            // Reset to normal color
            if (lights.ceiling) {
                lights.ceiling.color = new THREE.Color(0xffffff);
            }
        }
    }, 100);
}

// Update energy stats periodically
function updateEnergyStats() {
    const energyBars = document.querySelectorAll('.energy-fill');
    const energyValues = document.querySelectorAll('.energy-value');
    
    // Simulate energy usage based on active devices
    let lightingUsage = controlState.lights ? 2.1 + Math.random() * 0.5 : 0.1;
    let coolingUsage = controlState.ac ? 4.5 + Math.random() * 1.0 : 0.2;
    let electronicsUsage = controlState.computer ? 1.8 + Math.random() * 0.3 : 0.1;
    
    if (energyBars.length >= 3 && energyValues.length >= 3) {
        energyBars[0].style.width = Math.min(100, (lightingUsage / 5) * 100) + '%';
        energyBars[1].style.width = Math.min(100, (coolingUsage / 8) * 100) + '%';
        energyBars[2].style.width = Math.min(100, (electronicsUsage / 4) * 100) + '%';
        
        energyValues[0].textContent = lightingUsage.toFixed(1) + ' kWh';
        energyValues[1].textContent = coolingUsage.toFixed(1) + ' kWh';
        energyValues[2].textContent = electronicsUsage.toFixed(1) + ' kWh';
    }
}

// Start energy monitoring
setInterval(updateEnergyStats, 2000);

// Initialize navbar panel switching - simplified
function initNavbarPanelSwitching() {
    // No longer needed since modes are in navbar now
}

// Export control functions
window.controlAPI = {
    init: initControls,
    initKeyboard: initKeyboardShortcuts,
    initAutomation: initSmartAutomation,
    getState: () => controlState,
    setLightingScene: setLightingScene,
    executeQuickAction: executeQuickAction
};