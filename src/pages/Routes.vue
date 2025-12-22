<script setup>
import { computed, ref } from 'vue';
import RouteCard from '../components/RouteCard.vue';
import AMapView from '../components/AMapView.vue';
import { routes, sounds } from '../data/demo';
import useAuth from '../composables/useAuth';

const routeTitle = ref('我的新路线');
const tone = ref('舒缓');
const selected = ref(sounds.slice(0, 3).map((item) => item.id));
const saveHint = ref('');

const selectedSounds = computed(() =>
  selected.value
    .map((id, index) => {
      const item = sounds.find((sound) => sound.id === id);
      if (!item) return null;
      return { ...item, order: index + 1 };
    })
    .filter(Boolean)
);

const previewRoute = computed(() => ({
  title: routeTitle.value || '未命名路线',
  distance: `${(selected.value.length * 1.2 + 1.5).toFixed(1)} km`,
  duration: `${selected.value.length * 12 + 18} min`,
  tone: tone.value,
  stops: selectedSounds.value.map((item) => item.title)
}));

const polylinePath = computed(() => selectedSounds.value.map((item) => item.coords));

const routePreviewId = ref(routes[0]?.id || '');

const previewTemplate = computed(
  () => routes.find((route) => route.id === routePreviewId.value) || routes[0]
);

const previewPoints = computed(() => {
  const ids = previewTemplate.value?.pointIds || [];
  return ids.map((id, index) => {
    const item = sounds.find((sound) => sound.id === id);
    if (!item) return null;
    return { ...item, order: index + 1 };
  }).filter(Boolean);
});

const previewPath = computed(() => previewPoints.value.map((item) => item.coords));

const toggleSelect = (id) => {
  if (selected.value.includes(id)) {
    selected.value = selected.value.filter((item) => item !== id);
  } else {
    selected.value = [...selected.value, id];
  }
};

const moveItem = (from, delta) => {
  const to = from + delta;
  if (to < 0 || to >= selected.value.length) return;
  const next = [...selected.value];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  selected.value = next;
};

const dragIndex = ref(null);
const overIndex = ref(null);

const onDragStart = (index) => {
  dragIndex.value = index;
};

const onDragOver = (index) => {
  overIndex.value = index;
};

const onDrop = (index) => {
  if (dragIndex.value === null || dragIndex.value === index) {
    dragIndex.value = null;
    overIndex.value = null;
    return;
  }
  const next = [...selected.value];
  const [item] = next.splice(dragIndex.value, 1);
  next.splice(index, 0, item);
  selected.value = next;
  dragIndex.value = null;
  overIndex.value = null;
};

const onDragEnd = () => {
  dragIndex.value = null;
  overIndex.value = null;
};

const viewPreview = (route) => {
  routePreviewId.value = route.id;
};

const { state } = useAuth();
const loginRequired = computed(() => !state.user);

const savedRoutes = ref([]);

const loadSavedRoutes = () => {
  try {
    const data = JSON.parse(localStorage.getItem('csm_routes') || '[]');
    savedRoutes.value = Array.isArray(data) ? data : [];
  } catch {
    savedRoutes.value = [];
  }
};

const saveRoutes = () => {
  localStorage.setItem('csm_routes', JSON.stringify(savedRoutes.value));
};

const saveRoute = () => {
  if (loginRequired.value) {
    saveHint.value = '请先登录后再保存路线。';
    return;
  }
  const route = {
    id: `custom-${Date.now()}`,
    title: routeTitle.value || '未命名路线',
    tone: tone.value,
    stops: selectedSounds.value.map((item) => item.title),
    pointIds: selected.value,
    distance: previewRoute.value.distance,
    duration: previewRoute.value.duration,
    createdAt: new Date().toISOString()
  };
  savedRoutes.value = [route, ...savedRoutes.value].slice(0, 6);
  saveRoutes();
  saveHint.value = '已保存到我的路线。';
  setTimeout(() => {
    saveHint.value = '';
  }, 2000);
};

const importToBuilder = (route) => {
  routeTitle.value = route.title;
  tone.value = route.tone;
  selected.value = [...route.pointIds];
};

const clearSelection = () => {
  selected.value = [];
};

const resetBuilder = () => {
  routeTitle.value = '我的新路线';
  tone.value = '舒缓';
  selected.value = sounds.slice(0, 3).map((item) => item.id);
};

loadSavedRoutes();
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1>声音路线工作台</h1>
        <p>拖拽或勾选声音点位，快速生成你的主题路线。</p>
      </div>
      <div class="header-actions">
        <span class="save-hint">{{ saveHint }}</span>
        <button class="ghost-button" @click="clearSelection">清空</button>
        <button class="ghost-button" @click="resetBuilder">重置</button>
        <button class="primary-button" :disabled="loginRequired" @click="saveRoute">
          保存路线
        </button>
      </div>
    </header>

    <section class="builder">
      <div class="builder-form">
        <label>
          路线标题
          <input v-model="routeTitle" type="text" />
        </label>
        <label>
          路线氛围
          <select v-model="tone">
            <option>舒缓</option>
            <option>热闹</option>
            <option>清醒</option>
            <option>浪漫</option>
          </select>
        </label>
        <div class="selected-panel">
          <div class="selected-head">
            <p>已选点位</p>
            <span>{{ selectedSounds.length }} 个</span>
          </div>
          <ul class="selected-list">
            <li
              v-for="(sound, index) in selectedSounds"
              :key="sound.id"
              draggable="true"
              :class="{
                dragging: dragIndex === index,
                over: overIndex === index && dragIndex !== index
              }"
              @dragstart="onDragStart(index)"
              @dragover.prevent="onDragOver(index)"
              @drop.prevent="onDrop(index)"
              @dragend="onDragEnd"
            >
              <span class="drag-handle" title="拖拽排序">⠿</span>
              <span class="order-pill">{{ index + 1 }}</span>
              <div class="selected-info">
                <strong>{{ sound.title }}</strong>
                <small>{{ sound.city }}</small>
              </div>
              <div class="order-actions">
                <button class="text-button" @click="moveItem(index, -1)">上移</button>
                <button class="text-button" @click="moveItem(index, 1)">下移</button>
                <button class="text-button" @click="toggleSelect(sound.id)">移除</button>
              </div>
            </li>
          </ul>
        </div>
        <div class="builder-list">
          <p>可选声音点位</p>
          <div class="builder-items">
            <button
              v-for="sound in sounds"
              :key="sound.id"
              class="builder-item"
              :class="{ active: selected.includes(sound.id) }"
              @click="toggleSelect(sound.id)"
            >
              <span>{{ sound.title }}</span>
              <small>{{ sound.city }}</small>
            </button>
          </div>
        </div>
      </div>
      <div class="builder-preview">
        <div class="preview-panel">
          <div class="preview-head">
            <h3>路线预览</h3>
            <p>拖拽已选点位，实时生成轨迹。</p>
          </div>
          <AMapView
            :points="selectedSounds"
            :path="polylinePath"
            :show-index="true"
            height="260px"
          />
        </div>
        <RouteCard :route="previewRoute" :show-action="false" />
      </div>
    </section>

    <section v-if="savedRoutes.length" class="section saved-section">
      <div class="section-head">
        <div>
          <h2>我的路线</h2>
          <p>保存的路线可一键导入编辑器。</p>
        </div>
      </div>
      <div class="saved-grid">
        <RouteCard
          v-for="route in savedRoutes"
          :key="route.id"
          :route="route"
          :show-action="false"
          @click="importToBuilder(route)"
        />
        <button class="ghost-button full" @click="resetBuilder">新建路线</button>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <div>
          <h2>热门路线</h2>
          <p>来自社区创作者的精选路线模板。</p>
        </div>
        <RouterLink class="ghost-button" to="/routes">浏览全部路线</RouterLink>
      </div>
      <div class="route-showcase">
        <div class="route-grid">
          <RouteCard
            v-for="route in routes"
            :key="route.id"
            :route="route"
            :active="routePreviewId === route.id"
            @preview="viewPreview(route)"
          />
        </div>
        <aside class="route-preview">
          <div class="preview-head">
            <h3>线路预览</h3>
            <p>当前：{{ previewTemplate?.title || '未选择' }}</p>
          </div>
          <AMapView
            :points="previewPoints"
            :path="previewPath"
            :show-index="true"
            height="240px"
          />
          <RouteCard :route="previewTemplate" :show-action="false" />
        </aside>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  gap: 2.5rem;
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.save-hint {
  color: var(--muted);
  font-size: 0.85rem;
  min-width: 150px;
}

.header-actions button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.builder {
  display: grid;
  grid-template-columns: minmax(320px, 1.2fr) minmax(280px, 1fr);
  gap: 2rem;
  align-items: start;
}

.builder-form {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 24px;
  padding: 1.6rem;
  display: grid;
  gap: 1.2rem;
  box-shadow: var(--shadow-soft);
}

.builder-form label {
  display: grid;
  gap: 0.4rem;
  font-size: 0.85rem;
}

.builder-form input,
.builder-form select {
  border: 1px solid rgba(17, 17, 17, 0.2);
  border-radius: 12px;
  padding: 0.6rem 0.8rem;
}

.selected-panel {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 18px;
  padding: 1rem;
  border: 1px solid rgba(17, 17, 17, 0.08);
}

.selected-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: var(--muted);
  margin-bottom: 0.8rem;
}

.selected-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.6rem;
}

.selected-list li {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  align-items: center;
  gap: 0.6rem;
  background: #fff;
  border-radius: 14px;
  padding: 0.6rem 0.8rem;
  border: 1px solid rgba(17, 17, 17, 0.08);
}

.selected-list li.dragging {
  opacity: 0.6;
  background: #f7f2e8;
}

.selected-list li.over {
  border-color: rgba(11, 107, 111, 0.35);
}

.drag-handle {
  cursor: grab;
  color: var(--muted);
  font-size: 1rem;
  user-select: none;
}

.drag-handle:active {
  cursor: grabbing;
}

.order-pill {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(11, 107, 111, 0.12);
  color: var(--sea);
  display: grid;
  place-items: center;
  font-size: 0.8rem;
  font-weight: 600;
}

.selected-info {
  display: grid;
  gap: 0.2rem;
}

.selected-info small {
  color: var(--muted);
  font-size: 0.8rem;
}

.order-actions {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.builder-list p {
  font-weight: 600;
  margin-bottom: 0.6rem;
}

.builder-items {
  display: grid;
  gap: 0.6rem;
  max-height: 280px;
  overflow: auto;
  padding-right: 0.4rem;
}

.builder-item {
  border: 1px solid rgba(17, 17, 17, 0.15);
  background: #fff;
  border-radius: 14px;
  padding: 0.6rem 0.8rem;
  text-align: left;
  display: grid;
  gap: 0.2rem;
  cursor: pointer;
}

.builder-item small {
  color: var(--muted);
}

.builder-item.active {
  border-color: transparent;
  background: rgba(11, 107, 111, 0.12);
  color: var(--sea);
}

.builder-preview {
  display: grid;
  gap: 1.2rem;
}

.preview-panel {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 22px;
  padding: 1.2rem;
  display: grid;
  gap: 1rem;
  box-shadow: var(--shadow-soft);
}

.preview-head h3 {
  font-size: 1.1rem;
}

.preview-head p {
  color: var(--muted);
  margin-top: 0.3rem;
  font-size: 0.9rem;
}

.route-showcase {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: 1.6rem;
  align-items: start;
}

.route-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.route-preview {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 22px;
  padding: 1.4rem;
  display: grid;
  gap: 1rem;
  box-shadow: var(--shadow-soft);
  position: sticky;
  top: 120px;
}

.preview-head h3 {
  font-size: 1.1rem;
}

.preview-head p {
  color: var(--muted);
  margin-top: 0.4rem;
  font-size: 0.9rem;
}

.saved-section .section-head {
  margin-bottom: 0.4rem;
}

.saved-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.saved-grid .full {
  width: 100%;
  justify-content: center;
}

@media (max-width: 1024px) {
  .route-showcase {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .builder {
    grid-template-columns: 1fr;
  }
}
</style>
