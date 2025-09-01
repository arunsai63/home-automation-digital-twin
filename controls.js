// Interactive controls
let controlState = {
    lights: false,
    ac: false,
    blinds: true,
    computer: false,
    acTemperature: 22
};

function initControls() {
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
                    camera.position.set(8, 6, 8);
                    controls.target.set(0, 0, 0);
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

// Export control functions
window.controlAPI = {
    init: initControls,
    initKeyboard: initKeyboardShortcuts,
    initAutomation: initSmartAutomation,
    getState: () => controlState
};