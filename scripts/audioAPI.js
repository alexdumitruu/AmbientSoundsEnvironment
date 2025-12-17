document.addEventListener("DOMContentLoaded", () => {
  // Audio configuration - maps data-sound values to audio file paths
  const SOUND_FILES = {
    rain: "./sounds/rain.mp3",
    wind: "./sounds/wind.wav",
    thunder: "./sounds/thunder.wav",
    waves: "./sounds/waves.wav",
    birds: "./sounds/birds.wav",
    forest: "./sounds/forest.mp3",
    fire: "./sounds/fire.wav",
    cafe: "./sounds/coffee_shop.wav",
    fan: "./sounds/fan.mp3",
    night: "./sounds/night.wav",
  };

  // Store audio instances and their states
  const audioInstances = {};
  let isGlobalPlaying = false;

  // DOM Elements
  const masterVolumeSlider = document.getElementById("master-volume");
  const masterVolumeOutput = document.getElementById("rangeValue");
  const playBtn = document.getElementById("play-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const soundControls = document.querySelectorAll(".sound-control");

  // Initialize master volume display
  masterVolumeOutput.textContent = masterVolumeSlider.value;

  // Initialize audio instances for each sound
  Object.keys(SOUND_FILES).forEach((soundName) => {
    const audio = new Audio(SOUND_FILES[soundName]);
    audio.loop = true;
    audio.volume = 0; // Start muted, will be set when activated
    audioInstances[soundName] = {
      audio: audio,
      isActive: false,
      individualVolume: 50, // Default individual volume (0-100)
    };
  });

  /**
   * Calculate the effective volume for a sound
   * Combines master volume and individual volume
   */
  function calculateEffectiveVolume(individualVolume) {
    const masterVolume = parseInt(masterVolumeSlider.value) / 100;
    const soundVolume = individualVolume / 100;
    return masterVolume * soundVolume;
  }

  /**
   * Update volume for a specific sound
   */
  function updateSoundVolume(soundName) {
    const instance = audioInstances[soundName];
    if (instance && instance.isActive) {
      instance.audio.volume = calculateEffectiveVolume(
        instance.individualVolume
      );
    }
  }

  /**
   * Update all active sound volumes (used when master volume changes)
   */
  function updateAllVolumes() {
    Object.keys(audioInstances).forEach((soundName) => {
      updateSoundVolume(soundName);
    });
  }

  /**
   * Toggle a sound on/off
   */
  function toggleSound(soundName, controlElement) {
    const instance = audioInstances[soundName];
    if (!instance) return;

    if (instance.isActive) {
      // Deactivate sound
      instance.audio.pause();
      instance.isActive = false;
      controlElement.classList.remove("active");
    } else {
      // Activate sound
      instance.isActive = true;
      instance.audio.volume = calculateEffectiveVolume(
        instance.individualVolume
      );
      controlElement.classList.add("active");

      // Auto-enable global playing and start this sound immediately
      isGlobalPlaying = true;
      instance.audio.play().catch((err) => {
        console.warn(`Could not play ${soundName}:`, err);
      });
    }

    // Update play/pause button visibility based on whether any sounds are active
    updatePlayPauseButtons();
  }

  /**
   * Check if any sounds are active
   */
  function hasActiveSounds() {
    return Object.values(audioInstances).some((instance) => instance.isActive);
  }

  /**
   * Update the visibility of play/pause buttons
   */
  function updatePlayPauseButtons() {
    if (isGlobalPlaying) {
      playBtn.classList.add("d-none");
      pauseBtn.classList.remove("d-none");
    } else {
      playBtn.classList.remove("d-none");
      pauseBtn.classList.add("d-none");
    }
  }

  /**
   * Play all active sounds
   */
  function playAllActive() {
    isGlobalPlaying = true;
    Object.entries(audioInstances).forEach(([soundName, instance]) => {
      if (instance.isActive) {
        instance.audio.play().catch((err) => {
          console.warn(`Could not play ${soundName}:`, err);
        });
      }
    });
    updatePlayPauseButtons();
  }

  /**
   * Pause all sounds
   */
  function pauseAll() {
    isGlobalPlaying = false;
    Object.values(audioInstances).forEach((instance) => {
      instance.audio.pause();
    });
    updatePlayPauseButtons();
  }

  // ==================== EVENT LISTENERS ====================

  // Master volume slider
  masterVolumeSlider.addEventListener("input", function () {
    masterVolumeOutput.textContent = this.value;
    updateAllVolumes();
  });

  // Play button
  playBtn.addEventListener("click", () => {
    playAllActive();
  });

  // Pause button
  pauseBtn.addEventListener("click", () => {
    pauseAll();
  });

  // Sound control click handlers (toggle sound on/off)
  soundControls.forEach((control) => {
    const soundName = control.dataset.sound;
    const volumeSlider = control.querySelector(".sound-volume");

    // Click on the control card to toggle sound
    control.addEventListener("click", (e) => {
      // Don't toggle if clicking on the volume slider
      if (
        e.target.classList.contains("sound-volume") ||
        e.target.closest(".sound-volume")
      ) {
        return;
      }
      toggleSound(soundName, control);
    });

    // Individual volume slider
    if (volumeSlider) {
      volumeSlider.addEventListener("input", function (e) {
        e.stopPropagation(); // Prevent card click
        const instance = audioInstances[soundName];
        if (instance) {
          instance.individualVolume = parseInt(this.value);
          updateSoundVolume(soundName);
        }
      });

      // Prevent click propagation on slider
      volumeSlider.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }
  });

  // Handle audio loading errors
  Object.entries(audioInstances).forEach(([soundName, instance]) => {
    instance.audio.addEventListener("error", (e) => {
      console.error(`Error loading audio for ${soundName}:`, e);
    });
  });
});
