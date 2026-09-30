// Sound Effects Controller using the copied audio assets
let isMuted = false;
let ambienceAudio = null;

export const toggleMute = () => {
  isMuted = !isMuted;
  if (isMuted && ambienceAudio) {
    ambienceAudio.pause();
  } else if (!isMuted && ambienceAudio) {
    ambienceAudio.play().catch(() => {});
  }
  return isMuted;
};

export const getMuteState = () => isMuted;

export const playSound = (soundName, volume = 0.4) => {
  if (isMuted) return;
  try {
    const audio = new Audio(`/sounds/${soundName}.mp3`);
    audio.volume = volume;
    audio.play().catch(() => {
      // Autoplay blocked until user interaction
    });
  } catch (e) {
    console.warn('Audio play error:', e);
  }
};

export const playButtonClick = () => playSound('button-click', 0.5);
export const playTransition = () => playSound('transition-0', 0.6);
export const playNotification = () => playSound('notification', 0.5);
export const playHologram = () => playSound('hologram', 0.4);

export const initAmbience = () => {
  if (ambienceAudio || isMuted) return;
  try {
    ambienceAudio = new Audio('/sounds/lab-ambience.mp3');
    ambienceAudio.loop = true;
    ambienceAudio.volume = 0.15;
  } catch (e) {
    console.warn('Ambience error:', e);
  }
};
