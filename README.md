# Ambient Sounds Environment

An interactive web application that combines ambient soundscapes with dynamic visual effects. Create immersive environments by layering different sounds and watching the canvas respond with particle effects, animations, and real-time color adaptation from your camera feed.

## Features

### 🎵 Audio API
- **Multi-sound Mixing**: Layer multiple ambient sounds simultaneously
  - Rain
  - Fire
  - Thunder
  - Waves
  - Night ambience
  ... and more
- **Master Volume Control**: Adjust overall volume with real-time feedback
- **Independent Sound Controls**: Toggle each sound on/off individually

### 🎨 Canvas API
- **Dynamic Particle Effects**: 
  - Fire particles with realistic physics and opacity
  - Rain droplets with smooth motion
  - Lightning flashes with intensity variation
  - Star particles with twinkling effects
  - Wave animations with oscillating patterns
- **Real-time Animation**: Smooth canvas rendering that responds to active sounds
- **Responsive Design**: Canvas automatically resizes to fill the viewport

### 📹 Video API
- **Webcam Integration**: Access your camera feed for real-time color analysis
- **Adaptive Color Sync**: Button colors dynamically adjust based on ambient lighting from your camera
- **Color Analysis Engine**: Analyzes camera feed to extract dominant hues and saturation levels
- **Smooth Color Transitions**: Gradual color blending for seamless visual experience

### 🎬 Integrated Features
- **Color-Responsive Canvas**: Canvas effects adapt to camera-detected colors when color adaptation is enabled
- **Synchronized Visuals**: Canvas animations activate when sounds are played
- **Interactive Controls**: Intuitive button-based interface for all features

## Project Structure

```
AmbientSoundsEnvironment/
├── index.html           # Main HTML document
├── styles.css           # Styling and responsive design
├── README.md            # This file
└── scripts/
    ├── audioAPI.js      # Audio control and sound management
    ├── canvas.js        # Canvas rendering and particle effects
    └── videoAPI.js      # Webcam access and color analysis
```

## How to Use

1. **Open the Application**: Load `index.html` in a modern web browser
2. **Grant Permissions**: Allow camera access when prompted for color adaptation features
3. **Select Sounds**: Click on any sound button (rain, fire, thunder, waves, night) to toggle it on/off
4. **Adjust Volume**: Use the master volume slider to control overall sound level
5. **Enable Color Adaptation**: Click the color sync button to match visuals with your surroundings
6. **Enjoy**: Watch the canvas animate with particles and effects as you mix sounds

## Technologies Used

- **HTML5**: Document structure and semantic markup
- **CSS3**: Styling, animations, and responsive layout
- **JavaScript (Vanilla)**: Core functionality without external dependencies
- **Web APIs**:
  - Canvas API 2D context for graphics rendering
  - Web Audio API for sound management
  - Video API for camera access
- **Bootstrap 5.3.3**: Responsive grid layout and UI components
- **Bootstrap Icons**: Visual icons for controls

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari (with camera permissions)
- Any modern browser supporting:
  - HTML5 Canvas
  - Web Audio API
  - Video API

## Technical Details

### Canvas Rendering
- 60 FPS animation loop using `requestAnimationFrame`
- Composite operations for realistic fire effects
- Particle system for all visual effects
- Real-time color adaptation integration

### Audio System
- Range input for master volume control
- Support for multiple simultaneous sound streams
- Smooth volume adjustments with visual feedback

### Color Analysis
- 64x64 downsampled camera feed for efficient processing
- RGB to HSL color space conversion
- Smooth color interpolation (5% per frame) for visual smoothness
- Auto-adjustments for saturation and lightness

## License

This project is created for educational purposes as part of the Multimedia course at ASE.

## Author

Alexandru David Dumitru and Ali Farajollah Esfahanny.

Created with ❤️ for an immersive multimedia experience.