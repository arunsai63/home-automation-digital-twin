# home-automation-digital-twin

A browser-based 3D digital twin for smart room monitoring and control with real-time sensor simulation.

🔗 **Live Demo**: [https://arunsai63.github.io/home-automation-digital-twin/](https://arunsai63.github.io/home-automation-digital-twin/)

## Overview

This project implements a digital twin of a smart room using Three.js for 3D visualization and vanilla JavaScript for real-time sensor data simulation. It demonstrates IoT concepts without requiring actual hardware, making it ideal for prototyping, education, and showcasing smart building capabilities.

## Features

### 3D Environment
- Interactive 3D room with colorful walls and textured ceiling
- Seated human figures with subtle arm animations
- Animated ceiling fan with real-time control
- Orbit camera controls for navigation with optimized initial view
- Dynamic lighting system with multiple scenes (Normal, Dimmed, Focus, Party)
- Real-time visual feedback for all controls
- Live camera position display

### Smart Room Modes
- **Home Mode** 🏠: Optimal comfort settings for daily use
- **Away Mode** 🚪: Energy-saving mode with all devices off
- **Sleep Mode** 🌙: Quiet environment with lights off and blinds closed
- **Work Mode** 💼: Bright focused lighting with computer active
- **Eco Mode** 🌱: Minimal energy consumption
- **Party Mode** 🎉: Dynamic color-changing lights

### Sensor Simulation
- Temperature monitoring (18-28°C)
- Humidity tracking (40-70%)
- CO2 level detection (400-2000 ppm)
- Ambient light measurement (0-1000 lux)
- Occupancy detection (0-5 people)
- Noise level monitoring (30-80 dB)

### Control Systems
- Smart lighting control with scene presets
- HVAC control with temperature adjustment (16-30°C)
- Animated ceiling fan with speed control
- Window blinds operation
- Workstation power management
- Climate control slider
- Keyboard shortcuts for quick access

### Data Visualization
- Real-time sensor displays with progress indicators
- Historical trend charts with multiple metrics
- Tab-based chart switching (Temperature, Humidity, CO2, Light)
- Threshold-based alerting system
- Performance metrics overlay (FPS, Memory, Particles)

## Installation

No installation required. Simply clone and open in a browser:

```bash
git clone https://github.com/arunsai63/home-automation-digital-twin.git
cd home-automation-digital-twin
open index.html  # macOS
# or
start index.html # Windows
# or
xdg-open index.html # Linux
```

## Usage

#### Keyboard Shortcuts

| Key | Function |
|-----|----------|
| L | Toggle lights |
| A | Toggle AC unit |
| B | Toggle blinds |
| C | Toggle computer |
| F | Toggle ceiling fan |
| R | Reset camera view |
| P | Show performance metrics |

### Mouse Controls
- Left click + drag: Rotate view
- Scroll: Zoom in/out
- Right click + drag: Pan camera

## Architecture

The application follows a modular architecture:

```
app.js              - Application initialization and lifecycle
room3d.js           - Three.js scene, 3D objects, animations, and human figures
sensors.js          - Sensor data simulation and threshold monitoring
controls.js         - User interaction, device control, and smart automation
charts.js           - Data visualization, charting, and performance metrics
style.css           - Glass morphism UI, responsive design, and animations
index.html          - Application structure with semantic HTML5
```

## Technical Stack

- **Three.js r128** - 3D graphics rendering
- **Chart.js 3.x** - Data visualization
- **Vanilla JavaScript ES6** - Core application logic
- **CSS3** - Styling and animations
- **HTML5** - Semantic markup

## Configuration

### Sensor Parameters

Modify sensor ranges in `sensors.js`:

```javascript
const sensorRanges = {
    temperature: { min: 18, max: 28, unit: '°C' },
    humidity: { min: 40, max: 70, unit: '%' },
    co2: { min: 400, max: 2000, unit: ' ppm' }
};
```

### Alert Thresholds

Adjust alert triggers in `sensors.js`:

```javascript
const alertThresholds = {
    temperature: { low: 18, high: 26 },
    co2: { low: 400, high: 1000 },
    noiseLevel: { low: 30, high: 70 }
};
```

### 3D Scene Customization

Modify room layout in `room3d.js`:

```javascript
// Adjust furniture positions (x, y, z coordinates)
deskGroup.position.set(-1, 0, -2);
chairGroup.position.set(-1, 0, -1);
```

## Recent Updates

- **Enhanced 3D Scene**: Added colorful walls with procedural textures, seated human figures with arm animations
- **Ceiling Fan**: Animated ceiling fan with real-time control and default ON state
- **Smart Modes**: Six preset modes for different scenarios (Home, Away, Sleep, Work, Eco, Party)
- **UI Improvements**: Glass morphism design, improved toggle visibility, optimized panel layout
- **Camera Display**: Live camera position tracking with low-opacity display
- **GitHub Pages**: Deployed live demo for easy access
- **Performance**: Optimized initial camera view for better room visibility

## Performance Considerations

- Optimized render loop using requestAnimationFrame
- Efficient particle system for AC airflow visualization
- Throttled sensor updates to prevent excessive calculations
- Memory-efficient data history management (60-second window)
- Optimized human animations with minimal vertex updates
- Smart resource management for texture and material loading

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Opera 76+

## Use Cases

- **Education**: Teaching IoT and smart building concepts
- **Prototyping**: Visualizing smart room implementations before deployment
- **Demonstration**: Showcasing digital twin capabilities to stakeholders
- **Development**: Testing control logic without physical hardware

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/enhancement`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/enhancement`)
5. Create a Pull Request

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Three.js community for excellent 3D library
- Chart.js team for flexible charting solution
- Open source contributors

## Contact

For questions or suggestions, please open an issue on GitHub.