document.addEventListener('DOMContentLoaded', async () => {

    // --- 1. Camera & Sensor Setup ---
    const video = document.getElementById('webcam-feed');
    const sensorCanvas = document.createElement('canvas');
    sensorCanvas.width = 64;
    sensorCanvas.height = 64;
    const sensorCtx = sensorCanvas.getContext('2d');

    let cameraReady = false;
    window.isAdaptingColor = false;
    window.ambientColor = { h: 220, s: 50, l: 60 };

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
            window.isAdaptingColor = !window.isAdaptingColor;
            adaptBtn.classList.toggle('active');

            if (!window.isAdaptingColor) {

                adaptBtn.style.backgroundColor = '#1e1e1e';
                adaptBtn.style.boxShadow = 'none';
                adaptBtn.style.color = '#888';
                adaptBtn.style.border = '2px solid #333';
            }
        });
    }

    // --- 3. Color Analysis ---
    function analyzeColor() {
        if (!cameraReady || !window.isAdaptingColor) return;

        sensorCtx.drawImage(video, 0, 0, 64, 64);
        const data = sensorCtx.getImageData(0, 0, 64, 64).data;

        let r = 0, g = 0, b = 0;
        const count = data.length / 4;
        for (let i = 0; i < data.length; i += 4) {
            r += data[i]; g += data[i + 1]; b += data[i + 2];
        }
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        const hsl = rgbToHsl(r, g, b);


        window.ambientColor.h += (hsl.h - window.ambientColor.h) * 0.05;
        window.ambientColor.s += (Math.max(hsl.s * 100, 60) - window.ambientColor.s) * 0.05;
        window.ambientColor.l += (60 - window.ambientColor.l) * 0.05;

        // --- UPDATE BUTTON VISUALS ---
        if (adaptBtn) {
            const btnColor = `hsl(${window.ambientColor.h}, 90%, 60%)`;
            const btnGlow = `0 0 20px hsl(${window.ambientColor.h}, 90%, 60%)`;

            adaptBtn.style.backgroundColor = btnColor;
            adaptBtn.style.boxShadow = btnGlow;
            adaptBtn.style.color = '#fff';
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

});