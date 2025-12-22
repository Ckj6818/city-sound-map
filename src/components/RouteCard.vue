<script setup>
defineProps({
  route: {
    type: Object,
    required: true
  },
  showAction: {
    type: Boolean,
    default: true
  },
  active: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['preview']);

const onPreview = () => {
  emit('preview');
};
</script>

<template>
  <article
    class="route-card"
    :class="{ active, clickable: showAction }"
    @click="showAction ? onPreview() : null"
  >
    <div class="route-header">
      <div>
        <h3>{{ route.title }}</h3>
        <p class="route-meta">{{ route.distance }} · {{ route.duration }} · {{ route.tone }}</p>
      </div>
      <button v-if="showAction" class="text-button" @click.stop="onPreview">预览</button>
    </div>
    <ul class="route-stops">
      <li v-for="stop in route.stops" :key="stop">
        <span class="route-dot"></span>
        <span>{{ stop }}</span>
      </li>
    </ul>
  </article>
</template>

<style scoped>
.route-card {
  background: #fff;
  padding: 1.5rem;
  border-radius: 22px;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 1rem;
  border: 1px solid transparent;
  transition: border 0.3s ease, box-shadow 0.3s ease;
}

.route-card.clickable {
  cursor: pointer;
}

.route-card.active {
  border-color: rgba(11, 107, 111, 0.35);
  box-shadow: 0 18px 36px rgba(11, 107, 111, 0.12);
}

.route-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.route-meta {
  color: var(--muted);
  font-size: 0.9rem;
}

.text-button {
  background: transparent;
  border: none;
  color: var(--sea);
  cursor: pointer;
  padding: 0;
  font-weight: 600;
}

.route-stops {
  list-style: none;
  display: grid;
  gap: 0.8rem;
  padding: 0;
  margin: 0;
}

.route-stops li {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.route-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--sea);
}
</style>
