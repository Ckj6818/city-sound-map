<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SoundCard from '../components/SoundCard.vue';
import AMapView from '../components/AMapView.vue';
import { sounds } from '../data/demo';
import useAudioPlayer from '../composables/useAudioPlayer';

const route = useRoute();
const router = useRouter();

const sound = computed(() => sounds.find((item) => item.id === route.params.id));
const isLiked = ref(false);
const { state, toggle, seek } = useAudioPlayer();

const isCurrent = computed(() => sound.value && state.currentId === sound.value.id);
const isPlaying = computed(() => isCurrent.value && state.isPlaying);
const progress = computed(() => {
  if (!isCurrent.value || !state.duration) return 0;
  return (state.currentTime / state.duration) * 100;
});
const currentLabel = computed(() => formatTime(state.currentTime));
const durationLabel = computed(() => formatTime(state.duration));

const relatedSounds = computed(() => {
  if (!sound.value) return [];
  return sounds
    .filter((item) => item.id !== sound.value.id && item.tag === sound.value.tag)
    .slice(0, 3);
});

const comments = [
  {
    name: '阿梁',
    time: '2 小时前',
    text: '这段真的能闻到海风的味道，太真实了。'
  },
  {
    name: 'June',
    time: '昨天',
    text: '听着像回到了早市，摊贩的吆喝很有画面感。'
  },
  {
    name: 'Kiko',
    time: '2 天前',
    text: '建议加上拍摄时间，想收藏做素材。'
  }
];

const formatTime = (value) => {
  const minutes = Math.floor((value || 0) / 60);
  const seconds = Math.floor((value || 0) % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const onSeek = (event) => {
  const percent = Number(event.target.value) / 100;
  seek(percent);
};
const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/sounds');
  }
};
</script>

<template>
  <div v-if="sound" class="page">
    <button class="text-button back" @click="goBack">返回声景库</button>

    <section class="detail-hero">
      <div class="hero-main">
        <span class="tag">{{ sound.tag }}</span>
        <h1>{{ sound.title }}</h1>
        <p class="hero-location">{{ sound.location }}</p>
        <p class="hero-story">{{ sound.story }}</p>
        <div class="hero-meta">
          <span>录制时间：{{ sound.recordedAt }}</span>
          <span>设备：{{ sound.equipment }}</span>
        </div>
        <div class="hero-actions">
          <button class="primary-button" @click="toggle(sound.id, sound.audio)">
            {{ isPlaying ? '暂停声音' : '播放声音' }}
          </button>
          <button class="ghost-button" @click="isLiked = !isLiked">
            {{ isLiked ? '已收藏' : '收藏声音' }}
          </button>
        </div>
        <div class="player">
          <div class="player-bar">
            <span :style="{ width: `${progress}%` }"></span>
          </div>
          <div class="player-meta">
            <span>{{ currentLabel }}</span>
            <input type="range" min="0" max="100" :value="progress" @input="onSeek" />
            <span>{{ durationLabel }}</span>
          </div>
        </div>
      </div>
      <div class="hero-panel">
        <div class="wave-panel">
          <p>声波预览</p>
          <div class="wave-bars">
            <span v-for="index in 12" :key="index"></span>
          </div>
        </div>
        <div class="stat-panel">
          <div>
            <p class="stat-value">{{ sound.plays }}</p>
            <p class="stat-label">播放</p>
          </div>
          <div>
            <p class="stat-value">{{ sound.likes }}</p>
            <p class="stat-label">收藏</p>
          </div>
          <div>
            <p class="stat-value">{{ sound.duration }}</p>
            <p class="stat-label">时长</p>
          </div>
        </div>
        <div class="map-panel">
          <p>地图坐标</p>
          <span>{{ sound.coords.lat.toFixed(4) }}, {{ sound.coords.lng.toFixed(4) }}</span>
          <AMapView :points="[sound]" height="180px" />
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <div>
          <h2>评论与回应</h2>
          <p>来自社区的即时反馈与补充线索。</p>
        </div>
        <button class="ghost-button">写评论</button>
      </div>
      <div class="comment-grid">
        <article v-for="comment in comments" :key="comment.name + comment.time" class="comment-card">
          <div class="comment-head">
            <span>{{ comment.name }}</span>
            <small>{{ comment.time }}</small>
          </div>
          <p>{{ comment.text }}</p>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <div>
          <h2>同类声音</h2>
          <p>更多来自 {{ sound.city }} 的 {{ sound.tag }} 声音。</p>
        </div>
        <RouterLink class="ghost-button" to="/sounds">回到列表</RouterLink>
      </div>
      <div class="sound-grid">
        <SoundCard
          v-for="item in relatedSounds"
          :key="item.id"
          :sound="item"
        />
      </div>
    </section>
  </div>

  <div v-else class="empty">
    <h2>没有找到这个声音</h2>
    <p>它可能被移除或尚未发布。</p>
    <RouterLink class="primary-button" to="/sounds">返回声景库</RouterLink>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  gap: 2.5rem;
}

.back {
  width: fit-content;
}

.detail-hero {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 2rem;
  align-items: start;
}

.tag {
  background: rgba(11, 107, 111, 0.12);
  color: var(--sea);
  padding: 0.2rem 0.7rem;
  border-radius: 999px;
  font-size: 0.75rem;
  width: fit-content;
}

.hero-main h1 {
  font-family: var(--font-display);
  font-size: clamp(2.2rem, 3vw, 3rem);
  margin: 0.6rem 0 0.4rem;
}

.hero-location {
  color: var(--muted);
}

.hero-story {
  margin: 1rem 0;
}

.hero-meta {
  display: grid;
  gap: 0.4rem;
  color: var(--muted);
  font-size: 0.9rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.4rem;
  flex-wrap: wrap;
}

.player {
  margin-top: 1.2rem;
  display: grid;
  gap: 0.6rem;
}

.player-bar {
  height: 6px;
  background: rgba(17, 17, 17, 0.1);
  border-radius: 999px;
  overflow: hidden;
}

.player-bar span {
  display: block;
  height: 100%;
  background: var(--sea);
  width: 0%;
  transition: width 0.2s ease;
}

.player-meta {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.8rem;
  align-items: center;
  font-size: 0.85rem;
  color: var(--muted);
}

.player-meta input[type='range'] {
  width: 100%;
}

.hero-panel {
  display: grid;
  gap: 1rem;
}

.wave-panel {
  background: #121212;
  color: #f6f3ec;
  border-radius: 22px;
  padding: 1.4rem;
  box-shadow: var(--shadow-strong);
}

.wave-bars {
  display: flex;
  gap: 6px;
  align-items: flex-end;
  margin-top: 1rem;
}

.wave-bars span {
  width: 8px;
  height: 36px;
  background: var(--sun);
  border-radius: 999px;
  animation: bounce 1.4s ease infinite;
}

.wave-bars span:nth-child(2) {
  height: 16px;
  animation-delay: 0.2s;
}

.wave-bars span:nth-child(3) {
  height: 28px;
  animation-delay: 0.4s;
}

.wave-bars span:nth-child(4) {
  height: 20px;
  animation-delay: 0.6s;
}

.wave-bars span:nth-child(5) {
  height: 34px;
  animation-delay: 0.3s;
}

.wave-bars span:nth-child(6) {
  height: 24px;
  animation-delay: 0.5s;
}

.wave-bars span:nth-child(7) {
  height: 30px;
  animation-delay: 0.7s;
}

.wave-bars span:nth-child(8) {
  height: 18px;
  animation-delay: 0.9s;
}

.wave-bars span:nth-child(9) {
  height: 26px;
  animation-delay: 0.6s;
}

.wave-bars span:nth-child(10) {
  height: 22px;
  animation-delay: 0.8s;
}

.wave-bars span:nth-child(11) {
  height: 30px;
  animation-delay: 1s;
}

.wave-bars span:nth-child(12) {
  height: 20px;
  animation-delay: 1.2s;
}

.stat-panel {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 20px;
  padding: 1.2rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  text-align: center;
  box-shadow: var(--shadow-soft);
}

.stat-value {
  font-weight: 700;
  font-size: 1.2rem;
}

.stat-label {
  color: var(--muted);
  font-size: 0.8rem;
}

.map-panel {
  background: #fff;
  border-radius: 20px;
  padding: 1.2rem;
  display: grid;
  gap: 0.6rem;
  box-shadow: var(--shadow-soft);
}


.comment-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.comment-card {
  background: #fff;
  padding: 1.2rem 1.4rem;
  border-radius: 18px;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 0.6rem;
}

.comment-head {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
}

.comment-head small {
  color: var(--muted);
  font-weight: 400;
}

.sound-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.empty {
  display: grid;
  place-items: center;
  gap: 1rem;
  text-align: center;
  padding: 4rem 0;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}
</style>
