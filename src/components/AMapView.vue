<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import AMapLoader from '@amap/amap-jsapi-loader';

const props = defineProps({
  points: {
    type: Array,
    default: () => []
  },
  path: {
    type: Array,
    default: () => []
  },
  showIndex: {
    type: Boolean,
    default: false
  },
  center: {
    type: Array,
    default: null
  },
  zoom: {
    type: Number,
    default: 11
  },
  height: {
    type: String,
    default: '360px'
  }
});

const mapEl = ref(null);
const mapInstance = ref(null);
const markers = ref([]);
const polyline = ref(null);
const amap = ref(null);

const key = import.meta.env.VITE_AMAP_KEY;
const security = import.meta.env.VITE_AMAP_SECURITY;
const hasKey = Boolean(key);

const getCenter = (list) => {
  if (props.center && props.center.length === 2) return props.center;
  if (!list.length) return [116.397428, 39.90923];
  const sum = list.reduce(
    (acc, item) => {
      const coords = item.coords || item;
      const lng = Array.isArray(coords) ? coords[0] : coords.lng;
      const lat = Array.isArray(coords) ? coords[1] : coords.lat;
      return [acc[0] + lng, acc[1] + lat];
    },
    [0, 0]
  );
  return [sum[0] / list.length, sum[1] / list.length];
};

const toLngLat = (coords) => {
  if (!coords) return null;
  if (Array.isArray(coords)) return coords;
  return [coords.lng, coords.lat];
};

const clearMarkers = () => {
  markers.value.forEach((marker) => marker.setMap(null));
  markers.value = [];
};

const clearPolyline = () => {
  if (polyline.value) {
    polyline.value.setMap(null);
    polyline.value = null;
  }
};

const setMarkers = () => {
  if (!amap.value || !mapInstance.value) return;
  clearMarkers();
  const list = props.points || [];
  if (!list.length) return;
  markers.value = list
    .map((item, index) => {
      const coords = item.coords || item;
      const point = toLngLat(coords);
      if (!point) return null;
      const labelIndex = item.order ?? index + 1;
      const content = props.showIndex
        ? `<div style="width:26px;height:26px;border-radius:50%;background:#0b6b6f;color:#fff;font-size:12px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(11,107,111,0.35);">${labelIndex}</div>`
        : undefined;
      return new amap.value.Marker({
        position: point,
        title: item.title || item.name || '',
        content,
        offset: content ? new amap.value.Pixel(-13, -13) : undefined
      });
    })
    .filter(Boolean);
  mapInstance.value.add(markers.value);
};

const setPolyline = () => {
  if (!amap.value || !mapInstance.value) return;
  clearPolyline();
  const path = (props.path || []).map((item) => toLngLat(item)).filter(Boolean);
  if (path.length < 2) return;
  polyline.value = new amap.value.Polyline({
    path,
    strokeColor: '#0b6b6f',
    strokeOpacity: 0.85,
    strokeWeight: 5,
    strokeStyle: 'solid'
  });
  mapInstance.value.add(polyline.value);
};

const fitView = () => {
  const overlays = [];
  if (markers.value.length) overlays.push(...markers.value);
  if (polyline.value) overlays.push(polyline.value);
  if (overlays.length) {
    mapInstance.value.setFitView(overlays, true, [40, 40, 40, 40]);
  } else {
    mapInstance.value.setCenter(getCenter(props.points || []));
  }
};

const refresh = () => {
  setMarkers();
  setPolyline();
  fitView();
};

const initMap = async () => {
  if (!hasKey || !mapEl.value) return;
  if (security) {
    window._AMapSecurityConfig = { securityJsCode: security };
  }
  amap.value = await AMapLoader.load({
    key,
    version: '2.0',
    plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.Geolocation']
  });
  mapInstance.value = new amap.value.Map(mapEl.value, {
    zoom: props.zoom,
    center: getCenter(props.points || []),
    mapStyle: 'amap://styles/macaron'
  });
  mapInstance.value.addControl(new amap.value.Scale());
  mapInstance.value.addControl(new amap.value.ToolBar({ position: 'RB' }));
  refresh();
};

onMounted(initMap);

watch(
  () => [props.points, props.path],
  () => refresh(),
  { deep: true }
);

onBeforeUnmount(() => {
  clearMarkers();
  clearPolyline();
  if (mapInstance.value) {
    mapInstance.value.destroy();
  }
});
</script>

<template>
  <div class="map-wrapper" :style="{ height }">
    <div v-if="hasKey" ref="mapEl" class="map-canvas"></div>
    <div v-else class="map-placeholder">
      <p>尚未配置高德地图 Key</p>
      <span>请在 .env.local 设置 `VITE_AMAP_KEY` 与 `VITE_AMAP_SECURITY`</span>
    </div>
  </div>
</template>

<style scoped>
.map-wrapper {
  border-radius: 24px;
  overflow: hidden;
  box-shadow: var(--shadow-strong);
  background: #f5f1e8;
  border: 1px solid rgba(17, 17, 17, 0.08);
}

.map-canvas {
  width: 100%;
  height: 100%;
}

.map-placeholder {
  height: 100%;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 2rem;
  background:
    radial-gradient(circle at 20% 20%, rgba(244, 162, 89, 0.2), transparent 50%),
    radial-gradient(circle at 80% 30%, rgba(11, 107, 111, 0.2), transparent 45%),
    #f5f1e8;
  color: var(--muted);
}

.map-placeholder p {
  font-weight: 700;
  color: var(--ink);
}

.map-placeholder span {
  font-size: 0.85rem;
}
</style>
