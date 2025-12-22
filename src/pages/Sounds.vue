<script setup>
import { computed, ref } from 'vue';
import SoundCard from '../components/SoundCard.vue';
import { sounds } from '../data/demo';

const search = ref('');
const activeTag = ref('全部');
const activeCity = ref('全部');
const sortKey = ref('默认');

const tags = computed(() => ['全部', ...new Set(sounds.map((item) => item.tag))]);
const cities = computed(() => ['全部', ...new Set(sounds.map((item) => item.city))]);

const parseDuration = (value) => {
  if (!value) return 0;
  const parts = value.split(':').map((item) => Number(item));
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
};

const parseDate = (value) => {
  if (!value) return 0;
  return new Date(value.replace(' ', 'T')).getTime();
};

const filteredSounds = computed(() => {
  const keyword = search.value.trim();
  let list = sounds.filter((item) => {
    const hitTag = activeTag.value === '全部' || item.tag === activeTag.value;
    const hitCity = activeCity.value === '全部' || item.city === activeCity.value;
    const hitKeyword =
      !keyword ||
      item.title.includes(keyword) ||
      item.location.includes(keyword) ||
      item.mood.includes(keyword);
    return hitTag && hitCity && hitKeyword;
  });

  if (sortKey.value === '热度') {
    list = [...list].sort((a, b) => b.heat - a.heat);
  } else if (sortKey.value === '最新') {
    list = [...list].sort((a, b) => parseDate(b.recordedAt) - parseDate(a.recordedAt));
  } else if (sortKey.value === '播放') {
    list = [...list].sort((a, b) => (b.plays || 0) - (a.plays || 0));
  } else if (sortKey.value === '收藏') {
    list = [...list].sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } else if (sortKey.value === '时长(长-短)') {
    list = [...list].sort((a, b) => parseDuration(b.duration) - parseDuration(a.duration));
  } else if (sortKey.value === '时长(短-长)') {
    list = [...list].sort((a, b) => parseDuration(a.duration) - parseDuration(b.duration));
  } else if (sortKey.value === '标题') {
    list = [...list].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortKey.value === '城市') {
    list = [...list].sort((a, b) => a.city.localeCompare(b.city));
  }
  return list;
});

</script>

<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1>城市声景库</h1>
        <p>按地点、情绪与标签筛选声音片段，建立你的城市声音收藏。</p>
        <p class="count">共 {{ filteredSounds.length }} 条声音</p>
      </div>
      <RouterLink class="primary-button" to="/upload">新增采集</RouterLink>
    </header>

    <section class="filter-panel">
      <label class="search">
        <span>关键词</span>
        <input v-model="search" type="text" placeholder="搜索标题、地点或描述" />
      </label>
      <div class="filter-group">
        <span>标签</span>
        <div class="chips">
          <button
            v-for="tag in tags"
            :key="tag"
            class="chip"
            :class="{ active: activeTag === tag }"
            @click="activeTag = tag"
          >
            {{ tag }}
          </button>
        </div>
      </div>
      <div class="filter-group">
        <span>城市</span>
        <div class="chips">
          <button
            v-for="city in cities"
            :key="city"
            class="chip"
            :class="{ active: activeCity === city }"
            @click="activeCity = city"
          >
            {{ city }}
          </button>
        </div>
      </div>
      <label class="search">
        <span>排序</span>
        <select v-model="sortKey">
          <option>默认</option>
          <option>热度</option>
          <option>最新</option>
          <option>播放</option>
          <option>收藏</option>
          <option>时长(长-短)</option>
          <option>时长(短-长)</option>
          <option>标题</option>
          <option>城市</option>
        </select>
      </label>
    </section>

    <section v-if="filteredSounds.length" class="sound-grid">
      <SoundCard
        v-for="sound in filteredSounds"
        :key="sound.id"
        :sound="sound"
      />
    </section>
    <div v-else class="empty">
      <h3>没有匹配的声音</h3>
      <p>尝试调整关键词或标签筛选。</p>
    </div>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  gap: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.page-header h1 {
  font-family: var(--font-display);
  font-size: clamp(2rem, 3vw, 2.8rem);
}

.page-header p {
  color: var(--muted);
  margin-top: 0.4rem;
}

.count {
  color: var(--muted);
  font-size: 0.9rem;
  margin-top: 0.4rem;
}

.filter-panel {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 24px;
  padding: 1.5rem;
  display: grid;
  gap: 1.2rem;
  box-shadow: var(--shadow-soft);
}

.search {
  display: grid;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.search input,
.search select {
  border: 1px solid rgba(17, 17, 17, 0.2);
  border-radius: 12px;
  padding: 0.6rem 0.8rem;
}

.filter-group {
  display: grid;
  gap: 0.6rem;
  font-size: 0.85rem;
}

.chips {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.chip {
  border: 1px solid rgba(17, 17, 17, 0.2);
  background: transparent;
  padding: 0.3rem 0.9rem;
  border-radius: 999px;
  cursor: pointer;
}

.chip.active {
  background: var(--sea);
  color: #fff;
  border-color: transparent;
}

.sound-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.empty {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  color: var(--muted);
  box-shadow: var(--shadow-soft);
}
</style>
