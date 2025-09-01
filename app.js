// Main application entry point
let isInitialized = false;

// Show loading screen
function showLoadingScreen() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.innerHTML = '🔄 Initializing Digital Twin...';
    document.body.appendChild(loadingDiv);
    return loadingDiv;
}

// Initialize the application
async function initApp() {
    const loadingScreen = showLoadingScreen();
    
    try {
        // Initialize Three.js scene
        initThreeJS();
        
        // Start animation loop
        animate();
        
        // Initialize sensor simulation
        window.sensorAPI.startSimulation();
        
        // Initialize controls
        window.controlAPI.init();
        window.controlAPI.initKeyboard();
        window.controlAPI.initAutomation();
        
        // Initialize charts
        window.chartAPI.init();
        window.chartAPI.initGauges();
        window.chartAPI.initMetrics();
        
        // Remove loading screen
        setTimeout(() => {
            loadingScreen.style.animation = 'fadeOut 0.5s ease';
            setTimeout(() => {
                loadingScreen.remove();
            }, 500);
        }, 1000);
        
        isInitialized = true;
        
        // Show welcome message
        showWelcomeMessage();
        
        // Start background animations
        startBackgroundAnimations();
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        loadingScreen.innerHTML = '❌ Failed to initialize. Please refresh the page.';
    }
}

// Show welcome message
function showWelcomeMessage() {
    const welcomeAlert = {
        type: 'success',
        message: '🎉 Digital Twin Ready! Check shortcuts panel →'
    };
    
    const alertContainer = document.getElementById('alert-container');
    const alertElement = document.createElement('div');
    alertElement.className = `alert ${welcomeAlert.type}`;
    alertElement.innerHTML = welcomeAlert.message;
    
    alertContainer.appendChild(alertElement);
    
    setTimeout(() => {
        alertElement.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            alertElement.remove();
        }, 300);
    }, 5000);
}

// Background animations
function startBackgroundAnimations() {
    // Pulse status dot
    const statusDot = document.querySelector('.status-dot');
    if (statusDot) {
        setInterval(() => {
            statusDot.style.background = '#4caf50';
        }, 2000);
    }
    
    // Subtle room rotation when idle
    let idleTime = 0;
    let lastMouseMove = Date.now();
    
    document.addEventListener('mousemove', () => {
        lastMouseMove = Date.now();
        idleTime = 0;
    });
    
    setInterval(() => {
        if (Date.now() - lastMouseMove > 10000) { // 10 seconds of inactivity
            idleTime++;
            if (scene) {
                scene.rotation.y = Math.sin(idleTime * 0.01) * 0.05;
            }
        } else {
            if (scene) {
                scene.rotation.y = 0;
            }
        }
    }, 50);
    
    // Animate sensor values smoothly
    animateSensorValues();
}

// Smooth sensor value animations
function animateSensorValues() {
    const sensorValues = document.querySelectorAll('.sensor-value');
    
    sensorValues.forEach(element => {
        element.style.transition = 'all 0.5s ease';
    });
}

// Handle window visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause expensive operations when tab is hidden
        console.log('Tab hidden - pausing animations');
    } else {
        // Resume when tab is visible
        console.log('Tab visible - resuming animations');
    }
});

// Error handling
window.addEventListener('error', (event) => {
    console.error('Application error:', event.error);
    showAlert({
        type: 'danger',
        message: '⚠️ An error occurred. Check console for details.'
    });
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (renderer) {
        renderer.dispose();
    }
    if (scene) {
        scene.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
    }
});

// Add CSS animation keyframes dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
    
    .sensor-item {
        animation: float 4s ease-in-out infinite;
    }
    
    .sensor-item:nth-child(1) { animation-delay: 0s; }
    .sensor-item:nth-child(2) { animation-delay: 0.5s; }
    .sensor-item:nth-child(3) { animation-delay: 1s; }
    .sensor-item:nth-child(4) { animation-delay: 1.5s; }
    .sensor-item:nth-child(5) { animation-delay: 2s; }
    .sensor-item:nth-child(6) { animation-delay: 2.5s; }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Export for debugging
window.appState = {
    isInitialized: () => isInitialized,
    reset: () => {
        location.reload();
    },
    toggleFullscreen: () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
};

console.log('%c🏢 Smart Room Digital Twin', 'font-size: 24px; font-weight: bold; color: #667eea;');
console.log('%cKeyboard Shortcuts:', 'font-weight: bold;');
console.log('L - Toggle Lights | A - Toggle AC | B - Toggle Blinds | C - Toggle Computer');
console.log('R - Reset Camera | P - Performance Metrics | F11 - Fullscreen');
console.log('%cMade with Three.js + Vanilla JS', 'color: #666; font-style: italic;');