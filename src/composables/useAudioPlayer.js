import { reactive } from 'vue';

const audio = new Audio();
const state = reactive({
  currentId: '',
  currentUrl: '',
  isPlaying: false,
  currentTime: 0,
  duration: 0
});

let initialized = false;

const updateTime = () => {
  state.currentTime = audio.currentTime || 0;
  state.duration = Number.isFinite(audio.duration) ? audio.duration : 0;
};

const init = () => {
  if (initialized) return;
  initialized = true;
  audio.preload = 'metadata';
  audio.addEventListener('timeupdate', updateTime);
  audio.addEventListener('loadedmetadata', updateTime);
  audio.addEventListener('ended', () => {
    state.isPlaying = false;
  });
};

const setTrack = (id, url) => {
  if (!url) return;
  if (state.currentUrl !== url) {
    state.currentUrl = url;
    state.currentId = id;
    state.currentTime = 0;
    state.duration = 0;
    audio.src = url;
    audio.load();
  } else {
    state.currentId = id;
  }
};

const play = async (id, url) => {
  if (!url) return;
  init();
  setTrack(id, url);
  try {
    await audio.play();
    state.isPlaying = true;
  } catch {
    state.isPlaying = false;
  }
};

const pause = () => {
  audio.pause();
  state.isPlaying = false;
};

const toggle = (id, url) => {
  if (state.currentId === id && state.isPlaying) {
    pause();
  } else {
    play(id, url);
  }
};

const seek = (percent) => {
  if (!state.duration) return;
  audio.currentTime = Math.min(Math.max(percent, 0), 1) * state.duration;
};

export default function useAudioPlayer() {
  init();
  return {
    state,
    play,
    pause,
    toggle,
    seek
  };
}
