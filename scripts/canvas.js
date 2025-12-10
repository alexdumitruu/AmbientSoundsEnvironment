document.addEventListener('DOMContentLoaded', async () => {

    const canvas = document.getElementById('ambient-canvas');
    const ctx = canvas.getContext('2d');

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