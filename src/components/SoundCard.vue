<script setup>
import { computed } from 'vue';
import useAudioPlayer from '../composables/useAudioPlayer';

const props = defineProps({
  sound: {
    type: Object,
    required: true
  },
  showLink: {
    type: Boolean,
    default: true
  }
});

const { state, toggle } = useAudioPlayer();
const isCurrent = computed(() => state.currentId === props.sound.id);
const isPlaying = computed(() => isCurrent.value && state.isPlaying);
const progress = computed(() => {
  if (!isCurrent.value || !state.duration) return 0;
  return (state.currentTime / state.duration) * 100;
});
</script>

<template>
  <article class="sound-card" :style="{ '--accent': sound.color }">
    <div class="sound-top">
      <span class="sound-tag">{{ sound.tag }}</span>
      <span class="sound-duration">{{ sound.duration }}</span>
    </div>
    <h3>{{ sound.title }}</h3>
    <p class="sound-location">{{ sound.location }}</p>
    <p class="sound-mood">{{ sound.mood }}</p>
    <div class="sound-meta">
      <span>热度 {{ sound.heat }}</span>
      <span>{{ sound.city }}</span>
    </div>
    <div class="sound-actions">
      <button class="text-button" @click="toggle(sound.id, sound.audio)">
        {{ isPlaying ? '暂停' : '试听' }}
      </button>
      <RouterLink v-if="showLink" class="detail-link" :to="`/sounds/${sound.id}`">
        详情
      </RouterLink>
      <div class="sound-progress" :class="{ active: isPlaying }">
        <span></span><span></span><span></span><span></span><span></span>
      </div>
    </div>
    <div class="progress-bar">
      <span :style="{ width: `${progress}%` }"></span>
    </div>
  </article>
</template>

<style scoped>
.sound-card {
  background: #ffffff;
  padding: 1.4rem;
  border-radius: 20px;
  box-shadow: var(--shadow-soft);
  border: 1px solid rgba(17, 17, 17, 0.05);
  display: grid;
  gap: 0.6rem;
}

.sound-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.sound-tag {
  background: var(--accent);
  color: #fff;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
}

.sound-location {
  color: var(--muted);
}

.sound-mood {
  font-size: 0.92rem;
}

.sound-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--muted);
}

.sound-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.text-button {
  background: transparent;
  border: none;
  color: var(--sea);
  cursor: pointer;
  padding: 0;
  font-weight: 600;
}

.detail-link {
  font-size: 0.85rem;
  color: var(--muted);
}

.detail-link:hover {
  color: var(--sea);
}

.sound-progress {
  display: flex;
  gap: 4px;
  align-items: flex-end;
  opacity: 0.6;
}

.sound-progress span {
  width: 6px;
  height: 16px;
  background: var(--accent);
  border-radius: 999px;
}

.sound-progress.active span {
  animation: bounce 1.2s ease infinite;
}

.sound-progress span:nth-child(2) {
  height: 10px;
  animation-delay: 0.2s;
}

.sound-progress span:nth-child(3) {
  height: 22px;
  animation-delay: 0.4s;
}

.sound-progress span:nth-child(4) {
  height: 12px;
  animation-delay: 0.6s;
}

.sound-progress span:nth-child(5) {
  height: 18px;
  animation-delay: 0.8s;
}

.progress-bar {
  height: 4px;
  background: rgba(17, 17, 17, 0.08);
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar span {
  display: block;
  height: 100%;
  background: var(--accent);
  width: 0%;
  transition: width 0.2s ease;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
</style>
