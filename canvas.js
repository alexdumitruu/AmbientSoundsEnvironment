document.addEventListener('DOMContentLoaded', async () => {

    const canvas = document.getElementById('ambient-canvas');
    const ctx = canvas.getContext('2d');
    
    // --- 1. Camera & Sensor Setup ---
    const video = document.getElementById('webcam-feed');
    const sensorCanvas = document.createElement('canvas');
    sensorCanvas.width = 64; 
    sensorCanvas.height = 64;
    const sensorCtx = sensorCanvas.getContext('2d');
    
    let cameraReady = false;
    let isAdaptingColor = false; 
    let ambientColor = { h: 220, s: 50, l: 60 }; 

    async function setupCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 320, height: 240 },
                audio: false
            });
            video.srcObject = stream;
            return new Promise((resolve) => {
                video.onloadedmetadata = () => {
                    video.play();
                    cameraReady = true;
                    resolve(true);
                };
            });
        } catch (err) {
            console.error("Camera error:", err);
        }
    }
    await setupCamera();

    // --- 2. Button Logic ---
    const adaptBtn = document.getElementById('color-adapt-btn');
    if (adaptBtn) {
        adaptBtn.addEventListener('click', () => {
            isAdaptingColor = !isAdaptingColor;
            adaptBtn.classList.toggle('active');
            
            if (!isAdaptingColor) {
                // RESET VISUALS when turned off
                adaptBtn.style.backgroundColor = '#1e1e1e';
                adaptBtn.style.boxShadow = 'none';
                adaptBtn.style.color = '#888';
                adaptBtn.style.border = '2px solid #333';
            }
        });
    }

    // --- 3. Color Analysis ---
    function analyzeColor() {
        if (!cameraReady || !isAdaptingColor) return; 

        sensorCtx.drawImage(video, 0, 0, 64, 64);
        const data = sensorCtx.getImageData(0, 0, 64, 64).data;
        
        let r = 0, g = 0, b = 0;
        const count = data.length / 4;
        for (let i = 0; i < data.length; i += 4) {
            r += data[i]; g += data[i+1]; b += data[i+2];
        }
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        const hsl = rgbToHsl(r, g, b);
        
        // Smooth transition logic
        ambientColor.h += (hsl.h - ambientColor.h) * 0.05;
        ambientColor.s += (Math.max(hsl.s * 100, 60) - ambientColor.s) * 0.05;
        ambientColor.l += (60 - ambientColor.l) * 0.05;

        // --- UPDATE BUTTON VISUALS ---
        if (adaptBtn) {
            // We force high saturation/lightness for the BUTTON so it looks like a distinct palette color
            // regardless of how dark the room actually is.
            const btnColor = `hsl(${ambientColor.h}, 90%, 60%)`;
            const btnGlow = `0 0 20px hsl(${ambientColor.h}, 90%, 60%)`;

            adaptBtn.style.backgroundColor = btnColor;
            adaptBtn.style.boxShadow = btnGlow;
            adaptBtn.style.color = '#fff'; // Icon always white
            adaptBtn.style.border = '2px solid white';
        }
    }

    function rgbToHsl(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) { h = s = 0; } 
        else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: h * 360, s: s, l: l };
    }

    // ----------------------------------------

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // --- Particle Creators ---
    function createFireParticle() {
        return {
            x: Math.random() * canvas.width,
            y: canvas.height - Math.random() * 20,
            size: Math.random() * 5 + 2,
            speedY: Math.random() * 2 + 1,
            speedX: Math.random() * 2 - 1,
            hueOffset: Math.random() * 30 - 15, 
            opacity: Math.random() * 0.5 + 0.5
        };
    }

    function createStarParticle() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.5,
            fadeSpeed: Math.random() * 0.01 + 0.005,
            fadingIn: true 
        };
    }

    const soundControls = document.querySelectorAll('.sound-control');
    soundControls.forEach(control => {
        control.addEventListener('click', () => {
            control.classList.toggle('active');
        });
    });

    let fireParticles = [];
    for (let i = 0; i < 150; i++) fireParticles.push(createFireParticle());

    let rainParticles = [];
    for (let i = 0; i < 100; i++) {
        rainParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            length: Math.random() * 15 + 10,
            speed: Math.random() * 5 + 2
        });
    }

    let starParticles = [];
    for (let i = 0; i < 150; i++) starParticles.push(createStarParticle());

    let lightningOpacity = 0;
    let waveOffset = 0;

    // --- DRAW FUNCTIONS ---

    function drawRain() {
        if (isAdaptingColor) {
            ctx.strokeStyle = `hsla(${ambientColor.h}, ${ambientColor.s}%, ${ambientColor.l}%, 0.5)`;
        } else {
            ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
        }
        ctx.lineWidth = 1;
        ctx.lineCap = 'round';
        rainParticles.forEach(p => {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x, p.y + p.length);
            ctx.stroke();
            p.y += p.speed;
            if (p.y > canvas.height) {
                p.y = 0 - p.length;
                p.x = Math.random() * canvas.width;
            }
        });
    }

    function drawFire() {
        ctx.globalCompositeOperation = 'lighter';
        fireParticles.forEach(p => {
            ctx.beginPath();
            let finalColor;
            if (isAdaptingColor) {
                let h = ambientColor.h + p.hueOffset;
                finalColor = `hsla(${h}, 100%, 50%, ${p.opacity})`;
            } else {
                let h = 25 + p.hueOffset; 
                finalColor = `hsla(${h}, 100%, 50%, ${p.opacity})`;
            }
            ctx.fillStyle = finalColor;
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            p.y -= p.speedY;
            p.x += p.speedX;
            p.opacity -= 0.015;
            if (Math.random() > 0.5) p.x += Math.random() * 2 - 1;
            if (p.opacity <= 0 || p.y <= 0) Object.assign(p, createFireParticle());
        });
        ctx.globalCompositeOperation = 'source-over';
    }

    function drawThunder() {
        if (lightningOpacity <= 0) {
            if (Math.random() < 0.005) lightningOpacity = 1;
        }
        if (lightningOpacity > 0) {
            if (isAdaptingColor) {
                ctx.fillStyle = `hsla(${ambientColor.h}, 100%, 90%, ${lightningOpacity})`;
            } else {
                ctx.fillStyle = `rgba(200, 220, 255, ${lightningOpacity})`;
            }
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            lightningOpacity -= 0.04;
        }
    }

    function drawNight() {
        starParticles.forEach(p => {
            ctx.beginPath();
            if (isAdaptingColor) {
                ctx.fillStyle = `hsla(${ambientColor.h}, 50%, 90%, ${p.opacity})`;
            } else {
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            }
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            if (p.fadingIn) {
                p.opacity += p.fadeSpeed;
                if (p.opacity >= 1) { p.opacity = 1; p.fadingIn = false; }
            } else {
                p.opacity -= p.fadeSpeed;
                if (p.opacity <= 0) {
                    p.x = Math.random() * canvas.width;
                    p.y = Math.random() * canvas.height;
                    p.opacity = 0;
                    p.fadingIn = true;
                }
            }
        });
    }

    function drawWaves() {
        let waveColors;
        if (isAdaptingColor) {
            const h = ambientColor.h;
            waveColors = [
                `hsla(${h}, 60%, 50%, 0.4)`,
                `hsla(${h}, 60%, 45%, 0.3)`,
                `hsla(${h}, 60%, 40%, 0.2)`
            ];
        } else {
            waveColors = ['rgba(50, 100, 200, 0.4)', 'rgba(40, 120, 220, 0.3)', 'rgba(30, 140, 240, 0.2)'];
        }
        const frequencies = [0.01, 0.015, 0.008];
        const amplitudes = [30, 25, 35];
        const yOffsets = [canvas.height * 0.8, canvas.height * 0.82, canvas.height * 0.84];
        for (let i = 0; i < waveColors.length; i++) {
            ctx.fillStyle = waveColors[i]; 
            ctx.beginPath();
            ctx.moveTo(0, canvas.height);
            let startY = yOffsets[i] + Math.sin(waveOffset + i) * amplitudes[i];
            ctx.lineTo(0, startY);
            for (let x = 1; x < canvas.width; x++) {
                let y = yOffsets[i] + Math.sin(x * frequencies[i] + waveOffset + i * 2) * amplitudes[i];
                ctx.lineTo(x, y);
            }
            ctx.lineTo(canvas.width, canvas.height);
            ctx.closePath();
            ctx.fill(); 
        }
        waveOffset += 0.02; 
    }

    function animate() {
        requestAnimationFrame(animate);

        // 1. Analyze
        if (isAdaptingColor) analyzeColor();

        // 2. Background
        if (isAdaptingColor) {
            ctx.fillStyle = `hsla(${ambientColor.h}, 30%, 5%, 0.25)`;
        } else {
            ctx.fillStyle = 'rgba(25, 24, 24, 0.25)';
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const rainActive = document.querySelector('[data-sound="rain"]').classList.contains('active');
        const fireActive = document.querySelector('[data-sound="fire"]').classList.contains('active');
        const thunderActive = document.querySelector('[data-sound="thunder"]').classList.contains('active');
        const nightActive = document.querySelector('[data-sound="night"]').classList.contains('active');
        const wavesActive = document.querySelector('[data-sound="waves"]').classList.contains('active');

        if (rainActive) drawRain();
        if (fireActive) drawFire();
        if (thunderActive) drawThunder();
        if (nightActive) drawNight();
        if (wavesActive) drawWaves();
    }

    animate();
});