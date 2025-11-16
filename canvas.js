document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.getElementById('ambient-canvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createFireParticle() {
        const size = Math.random() * 5 + 2;
        return {
            x: Math.random() * canvas.width,
            y: canvas.height - Math.random() * 20,
            size: size,
            speedY: Math.random() * 2 + 1,
            speedX: Math.random() * 2 - 1,
            hue: Math.random() * 30 + 10,
            opacity: Math.random() * 0.5 + 0.5
        };
    }

    function createStarParticle() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5, // Stars are small
            opacity: Math.random() * 0.5, // Start dim
            fadeSpeed: Math.random() * 0.01 + 0.005,
            fadingIn: true // Start by fading in
        };
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const soundControls = document.querySelectorAll('.sound-control');

    soundControls.forEach(control => {
        control.addEventListener('click', () => {
            control.classList.toggle('active');
        });
    });

    let fireParticles = [];
    for (let i = 0; i < 150; i++) {
        fireParticles.push(createFireParticle());

    }

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
    for (let i = 0; i < 150; i++) {
        starParticles.push(createStarParticle());
    }

    let lightningOpacity = 0;

    function drawRain() {
        ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
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
            ctx.fillStyle = `hsla(${p.hue}, 100%, 50%, ${p.opacity})`;
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            p.y -= p.speedY;
            p.x += p.speedX;
            p.opacity -= 0.015;

            if (Math.random() > 0.5) {
                p.x += Math.random() * 2 - 1;
            }

            if (p.opacity <= 0 || p.y <= 0) {

                Object.assign(p, createFireParticle());
            }
        });
        ctx.globalCompositeOperation = 'source-over';
    }

    function drawThunder() {
        if (lightningOpacity <= 0) {
            if (Math.random() < 0.005) {
                lightningOpacity = 1;
            }
        }

        if (lightningOpacity > 0) {
            ctx.fillStyle = `rgba(200, 220, 255, ${lightningOpacity})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            lightningOpacity -= 0.04;
        }
    }

    function drawNight() {
        starParticles.forEach(p => {
            ctx.beginPath();
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`; // White, with particle's opacity
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            if (p.fadingIn) {
                p.opacity += p.fadeSpeed;
                if (p.opacity >= 1) {
                    p.opacity = 1;
                    p.fadingIn = false;
                }
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


    function animate() {
        requestAnimationFrame(animate);
        ctx.fillStyle = 'rgba(25, 24, 24, 0.25)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const rainActive = document.querySelector('[data-sound="rain"]').classList.contains('active');
        const fireActive = document.querySelector('[data-sound="fire"]').classList.contains('active');
        const thunderActive = document.querySelector('[data-sound="thunder"]').classList.contains('active');
        const nightActive = document.querySelector('[data-sound="night"]').classList.contains('active');

        if (rainActive) {
            drawRain();
        }
        if (fireActive) {
            console.log("Drawing fire particles");
            drawFire();
        }
        if (thunderActive) {
            drawThunder();
        }
        if (nightActive) {
            drawNight();
        }
    }

    animate();
});