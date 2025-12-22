<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useAuth from '../composables/useAuth';
import { topics } from '../data/community';

const route = useRoute();
const router = useRouter();
const { state } = useAuth();

const topic = computed(() => topics.find((item) => item.id === route.params.id));
const joined = ref(false);
const saved = ref(false);
const commentInput = ref('');
const submitHint = ref('');

const stats = computed(() => {
  if (!topic.value) return null;
  const extra = joined.value ? 1 : 0;
  return {
    members: topic.value.stats.members + extra,
    today: topic.value.stats.today + extra,
    sounds: topic.value.stats.sounds
  };
});

const toggleJoin = () => {
  if (!state.user) {
    submitHint.value = '请先登录后参与话题。';
    return;
  }
  joined.value = !joined.value;
};

const toggleSave = () => {
  if (!state.user) {
    submitHint.value = '请先登录后收藏话题。';
    return;
  }
  saved.value = !saved.value;
};

const submitComment = () => {
  if (!state.user) {
    submitHint.value = '请先登录后再提交。';
    return;
  }
  const text = commentInput.value.trim();
  if (!text) {
    submitHint.value = '请输入评论内容。';
    return;
  }
  topic.value.discussions.unshift({
    name: state.user?.name || '我',
    time: '刚刚',
    text
  });
  commentInput.value = '';
  submitHint.value = '已提交';
  setTimeout(() => {
    submitHint.value = '';
  }, 2000);
};

const goBack = () => {
  router.push('/community');
};
</script>

<template>
  <div v-if="topic" class="page">
    <button class="text-button back" @click="goBack">返回社区</button>

    <section class="hero">
      <div class="hero-text">
        <span class="tag">话题</span>
        <h1>{{ topic.title }}</h1>
        <p>{{ topic.desc }}</p>
        <div class="hero-actions">
          <button class="ghost-button" @click="toggleSave">
            {{ saved ? '已收藏' : '收藏话题' }}
          </button>
          <button class="primary-button" @click="toggleJoin">
            {{ joined ? '已加入' : '参与话题' }}
          </button>
        </div>
      </div>
      <div class="hero-image">
        <img :src="topic.image" :alt="topic.title" loading="lazy" decoding="async" />
      </div>
    </section>

    <section class="stats">
      <div>
        <strong>{{ stats?.members }}</strong>
        <span>参与者</span>
      </div>
      <div>
        <strong>{{ stats?.today }}</strong>
        <span>今日新增</span>
      </div>
      <div>
        <strong>{{ stats?.sounds }}</strong>
        <span>声音数量</span>
      </div>
    </section>

    <section class="detail-grid">
      <div class="detail-card">
        <h3>采集建议</h3>
        <p>{{ topic.guideline }}</p>
      </div>
      <div class="detail-card">
        <h3>最新动态</h3>
        <ul>
          <li v-for="update in topic.updates" :key="update.title + update.time">
            <span>{{ update.title }}</span>
            <small>{{ update.author }} · {{ update.time }}</small>
          </li>
        </ul>
      </div>
    </section>

    <section class="detail-card">
      <h3>最新评论</h3>
      <ul class="comment-list">
        <li v-for="comment in topic.discussions" :key="comment.name + comment.time + comment.text">
          <strong>{{ comment.name }}</strong>
          <small>{{ comment.time }}</small>
          <p>{{ comment.text }}</p>
        </li>
      </ul>
      <div class="comment-box">
        <textarea v-model="commentInput" rows="3" placeholder="分享你的声音线索或采集心得"></textarea>
        <div class="comment-actions">
          <span class="submit-hint">{{ submitHint }}</span>
          <button class="ghost-button" @click="submitComment">提交讨论</button>
        </div>
      </div>
    </section>
  </div>

  <div v-else class="empty">
    <h2>话题不存在</h2>
    <p>该话题可能已下线或未发布。</p>
    <RouterLink class="primary-button" to="/community">返回社区</RouterLink>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  gap: 2rem;
}

.back {
  width: fit-content;
}

.hero {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 2rem;
  align-items: center;
}

.hero-text h1 {
  font-family: var(--font-display);
  font-size: clamp(2.2rem, 3vw, 3rem);
  margin: 0.6rem 0;
}

.tag {
  background: rgba(11, 107, 111, 0.12);
  color: var(--sea);
  padding: 0.2rem 0.7rem;
  border-radius: 999px;
  font-size: 0.75rem;
}

.hero-actions {
  display: flex;
  gap: 0.8rem;
  margin-top: 1.2rem;
  flex-wrap: wrap;
}

.hero-image img {
  width: 100%;
  border-radius: 22px;
  object-fit: cover;
  max-height: 260px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
}

.stats div {
  background: #fff;
  border-radius: 16px;
  padding: 1rem;
  text-align: center;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 0.2rem;
}

.stats strong {
  font-size: 1.3rem;
}

.stats span {
  color: var(--muted);
  font-size: 0.85rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.detail-card {
  background: #fff;
  border-radius: 18px;
  padding: 1.2rem 1.4rem;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 0.6rem;
}

.detail-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.6rem;
}

.detail-card small {
  color: var(--muted);
  font-size: 0.8rem;
}

.comment-list li {
  background: #f7f2e8;
  border-radius: 12px;
  padding: 0.6rem 0.8rem;
  display: grid;
  gap: 0.3rem;
}

.comment-box {
  margin-top: 1rem;
  display: grid;
  gap: 0.6rem;
}

.comment-box textarea {
  border: 1px solid rgba(17, 17, 17, 0.2);
  border-radius: 12px;
  padding: 0.6rem 0.8rem;
  font-family: inherit;
}

.comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.submit-hint {
  color: var(--muted);
  font-size: 0.85rem;
}

.empty {
  display: grid;
  place-items: center;
  padding: 4rem 0;
  text-align: center;
  gap: 1rem;
}
</style>
