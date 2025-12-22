<script setup>
defineProps({
  story: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <article class="story-card">
    <p class="story-quote">“{{ story.quote }}”</p>
    <p class="story-name">{{ story.name }}</p>
    <p class="story-role">{{ story.role }}</p>
  </article>
</template>

<style scoped>
.story-card {
  background: #fff;
  border-radius: 18px;
  padding: 1.2rem 1.4rem;
  box-shadow: var(--shadow-soft);
}

.story-quote {
  font-style: italic;
}

.story-name {
  font-weight: 700;
  margin-top: 0.8rem;
}

.story-role {
  color: var(--muted);
  font-size: 0.9rem;
}
</style>
