<script setup>
defineProps({
  creator: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <article class="creator-card">
    <div class="creator-avatar">{{ creator.name.slice(0, 1) }}</div>
    <div>
      <p class="creator-name">{{ creator.name }}</p>
      <p class="creator-role">{{ creator.role }}</p>
      <div class="creator-badges">
        <span v-for="badge in creator.badges" :key="badge">{{ badge }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.creator-card {
  display: flex;
  gap: 1rem;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 1rem 1.2rem;
  box-shadow: var(--shadow-soft);
}

.creator-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: var(--sea);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
}

.creator-name {
  font-weight: 700;
}

.creator-role {
  color: var(--muted);
  font-size: 0.9rem;
}

.creator-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.4rem;
}

.creator-badges span {
  background: rgba(11, 107, 111, 0.12);
  color: var(--sea);
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
}
</style>
