<script setup>
import { computed, ref } from 'vue';
import SoundCard from '../components/SoundCard.vue';
import RouteCard from '../components/RouteCard.vue';
import StoryCard from '../components/StoryCard.vue';
import CreatorCard from '../components/CreatorCard.vue';
import AMapView from '../components/AMapView.vue';
import { stats, sounds, routes, modules, stories, uploadSteps, creators } from '../data/demo';

const spotlightSounds = computed(() => sounds.slice(0, 4));
const activeRouteId = ref(routes[0]?.id || '');

const activeRoute = computed(
  () => routes.find((route) => route.id === activeRouteId.value) || routes[0]
);

const routePoints = computed(() => {
  const ids = activeRoute.value?.pointIds || [];
  return ids
    .map((id, index) => {
      const item = sounds.find((sound) => sound.id === id);
      if (!item) return null;
      return { ...item, order: index + 1 };
    })
    .filter(Boolean);
});

const routePath = computed(() => routePoints.value.map((item) => item.coords));

const previewRoute = (route) => {
  activeRouteId.value = route.id;
};
</script>

<template>
  <div class="page">
    <section class="hero">
      <div class="hero-text">
        <span class="eyebrow">听见城市的纹理</span>
        <h1>把城市声音，变成一张可探索的地图。</h1>
        <p>
          记录街巷雨声、夜市喧闹、地铁提示音与风声树影。每一个点位都是
          一个故事，你可以用声音串起一座城市的记忆。
        </p>
        <div class="hero-actions">
          <RouterLink class="primary-button" to="/sounds">开始探索</RouterLink>
          <RouterLink class="ghost-button" to="/upload">上传我的声音</RouterLink>
        </div>
        <div class="stats">
          <div v-for="stat in stats" :key="stat.label" class="stat">
            <p class="stat-value">{{ stat.value }}</p>
            <p class="stat-label">{{ stat.label }}</p>
          </div>
        </div>
      </div>
      <div class="hero-visual">
        <div class="map-block">
          <AMapView :points="sounds" height="260px" />
          <div class="map-note">
            <p class="map-note-title">实时声景</p>
            <p class="map-note-desc">今日新增 18 个采集点</p>
            <div class="mini-wave">
              <span></span><span></span><span></span><span></span><span></span>
            </div>
          </div>
        </div>
        <div class="wave-card">
          <p class="wave-title">正在播放</p>
          <h3>街角电台 · 夜市</h3>
          <p class="wave-meta">02:45 / 05:10 · 音频卡片</p>
          <div class="waveform">
            <span></span><span></span><span></span><span></span><span></span>
            <span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <div>
          <h2>今日声景</h2>
          <p>来自城市各个角落的声音片段，按地点与故事整理。</p>
        </div>
        <RouterLink class="ghost-button" to="/sounds">查看全部声音</RouterLink>
      </div>
      <div class="sound-grid">
        <SoundCard
          v-for="sound in spotlightSounds"
          :key="sound.id"
          :sound="sound"
          :show-link="true"
        />
      </div>
    </section>

    <section class="section route-section">
      <div class="section-head">
        <div>
          <h2>声音路线生成器</h2>
          <p>把多个声音点位组合成路线，适合旅行、散步或主题采集。</p>
        </div>
        <RouterLink class="primary-button" to="/routes">创建路线</RouterLink>
      </div>
      <div class="route-layout">
        <div class="route-cards">
          <RouteCard
            v-for="route in routes"
            :key="route.id"
            :route="route"
            :active="activeRouteId === route.id"
            @preview="previewRoute(route)"
          />
        </div>
        <div class="route-map">
          <div class="route-map-header">
            <h3>路线预览</h3>
            <p>当前：{{ activeRoute?.title || '未选择' }} · 真实坐标预览</p>
          </div>
          <AMapView :points="routePoints" :path="routePath" :show-index="true" height="220px" />
          <RouteCard :route="activeRoute" :show-action="false" />
        </div>
      </div>
    </section>

    <section class="section upload-section">
      <div class="upload-card">
        <div class="upload-text">
          <h2>上传你的声音</h2>
          <p>
            让城市听见你的视角。上传一段声音，标注地点和故事，成为城市声景的创作者。
          </p>
          <div class="upload-steps">
            <div v-for="step in uploadSteps" :key="step.title" class="upload-step">
              <h4>{{ step.title }}</h4>
              <p>{{ step.desc }}</p>
            </div>
          </div>
        </div>
        <div class="upload-form">
          <label>
            声音标题
            <input type="text" placeholder="比如：河岸夜风" />
          </label>
          <label>
            选择标签
            <select>
              <option>自然</option>
              <option>交通</option>
              <option>人声</option>
              <option>音乐</option>
            </select>
          </label>
          <label>
            地点描述
            <input type="text" placeholder="城市 + 地点" />
          </label>
          <label>
            简短故事
            <textarea rows="4" placeholder="这段声音背后的故事"></textarea>
          </label>
          <button class="primary-button full">立即发布</button>
        </div>
      </div>
    </section>

    <section class="section feature-section">
      <div class="section-head">
        <div>
          <h2>核心模块</h2>
          <p>围绕声音采集、探索与分享，构建完整的城市声音生态。</p>
        </div>
      </div>
      <div class="feature-grid">
        <article v-for="module in modules" :key="module.title" class="feature-card">
          <h3>{{ module.title }}</h3>
          <p>{{ module.desc }}</p>
        </article>
      </div>
    </section>

    <section class="section community-section">
      <div class="community-grid">
        <div class="community-text">
          <h2>社区与故事</h2>
          <p>这里聚集了热爱城市的记录者。每一个声音都可以成为一次新的连接。</p>
          <RouterLink class="ghost-button" to="/community">加入创作者</RouterLink>
        </div>
        <div class="story-cards">
          <StoryCard v-for="story in stories" :key="story.name" :story="story" />
        </div>
      </div>
      <div class="creator-strip">
        <CreatorCard v-for="creator in creators" :key="creator.name" :creator="creator" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  gap: 4.5rem;
}

.hero {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2.5rem;
  align-items: center;
}

.hero-text h1 {
  font-family: var(--font-display);
  font-size: clamp(2.3rem, 3.4vw, 3.6rem);
  line-height: 1.1;
  margin: 0.6rem 0 1rem;
}

.hero-text p {
  color: var(--muted);
  font-size: 1.05rem;
}

.eyebrow {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--sea);
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin: 1.6rem 0;
  flex-wrap: wrap;
}

.stats {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.stat {
  background: rgba(255, 255, 255, 0.65);
  padding: 0.8rem 1.2rem;
  border-radius: 16px;
  box-shadow: var(--shadow-soft);
  min-width: 120px;
}

.stat-value {
  font-weight: 700;
  font-size: 1.2rem;
}

.stat-label {
  color: var(--muted);
  font-size: 0.85rem;
}

.hero-visual {
  display: grid;
  gap: 1.2rem;
}

.map-block {
  position: relative;
}

.map-note {
  position: relative;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 20px;
  padding: 1rem 1.2rem;
  max-width: 220px;
  margin-left: auto;
  margin-top: -4.4rem;
  box-shadow: var(--shadow-soft);
  z-index: 2;
}

.map-note-title {
  font-weight: 700;
}

.map-note-desc {
  color: var(--muted);
  font-size: 0.9rem;
  margin: 0.3rem 0 0.6rem;
}

.mini-wave {
  display: flex;
  gap: 4px;
  align-items: flex-end;
}

.mini-wave span {
  width: 6px;
  height: 14px;
  background: var(--sea);
  border-radius: 8px;
  animation: bounce 1.6s ease infinite;
}

.mini-wave span:nth-child(2) {
  height: 22px;
  animation-delay: 0.1s;
}

.mini-wave span:nth-child(3) {
  height: 18px;
  animation-delay: 0.2s;
}

.mini-wave span:nth-child(4) {
  height: 26px;
  animation-delay: 0.3s;
}

.mini-wave span:nth-child(5) {
  height: 16px;
  animation-delay: 0.4s;
}

.wave-card {
  background: #121212;
  color: #f6f3ec;
  padding: 1.6rem 1.8rem;
  border-radius: 26px;
  box-shadow: var(--shadow-strong);
}

.wave-title {
  color: rgba(246, 243, 236, 0.7);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.wave-meta {
  color: rgba(246, 243, 236, 0.7);
  font-size: 0.85rem;
  margin-top: 0.4rem;
}

.waveform {
  display: flex;
  gap: 6px;
  align-items: flex-end;
  margin-top: 1.2rem;
}

.waveform span {
  width: 8px;
  height: 36px;
  background: var(--sun);
  border-radius: 999px;
  animation: bounce 1.4s ease infinite;
}

.waveform span:nth-child(2) {
  height: 16px;
  animation-delay: 0.2s;
}

.waveform span:nth-child(3) {
  height: 28px;
  animation-delay: 0.4s;
}

.waveform span:nth-child(4) {
  height: 20px;
  animation-delay: 0.6s;
}

.waveform span:nth-child(5) {
  height: 34px;
  animation-delay: 0.3s;
}

.waveform span:nth-child(6) {
  height: 24px;
  animation-delay: 0.5s;
}

.waveform span:nth-child(7) {
  height: 30px;
  animation-delay: 0.7s;
}

.waveform span:nth-child(8) {
  height: 18px;
  animation-delay: 0.9s;
}

.waveform span:nth-child(9) {
  height: 26px;
  animation-delay: 0.6s;
}

.waveform span:nth-child(10) {
  height: 22px;
  animation-delay: 0.8s;
}

.sound-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.route-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

.route-map {
  background: linear-gradient(160deg, #f2ede3, #fdf7ef);
  border-radius: 26px;
  padding: 1.6rem;
  box-shadow: var(--shadow-strong);
  display: grid;
  gap: 1rem;
}

.route-map-header p {
  color: var(--muted);
}

.upload-section {
  background: linear-gradient(120deg, #1d3f3b, #11323c);
  color: #fdf7ef;
  padding: 0;
  border-radius: 32px;
}

.upload-card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 2rem;
  padding: 2.5rem;
}

.upload-text p {
  color: rgba(253, 247, 239, 0.75);
  margin: 1rem 0 2rem;
}

.upload-steps {
  display: grid;
  gap: 1rem;
}

.upload-step {
  background: rgba(255, 255, 255, 0.08);
  padding: 1rem;
  border-radius: 16px;
}

.upload-form {
  background: #fdf7ef;
  color: var(--ink);
  padding: 1.8rem;
  border-radius: 20px;
  display: grid;
  gap: 1rem;
}

.upload-form label {
  font-size: 0.85rem;
  display: grid;
  gap: 0.4rem;
}

.upload-form input,
.upload-form select,
.upload-form textarea {
  border: 1px solid rgba(17, 17, 17, 0.2);
  border-radius: 12px;
  padding: 0.6rem 0.8rem;
  font-family: inherit;
}

.upload-form .full {
  width: 100%;
  margin-top: 0.4rem;
}

.feature-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.feature-card {
  background: #fff;
  padding: 1.6rem;
  border-radius: 18px;
  box-shadow: var(--shadow-soft);
}

.community-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 2rem;
  align-items: center;
}

.story-cards {
  display: grid;
  gap: 1rem;
}

.creator-strip {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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

@media (max-width: 720px) {
  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .stats {
    width: 100%;
  }
}
</style>
