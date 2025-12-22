<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import StoryCard from '../components/StoryCard.vue';
import CreatorCard from '../components/CreatorCard.vue';
import { stories, creators } from '../data/demo';
import useAuth from '../composables/useAuth';
import { topics, events, gallery } from '../data/community';

const topicList = ref(topics);

const topicQuery = ref('');
const activeTag = ref('全部');
const topicSort = ref('活跃');

const activeTopicId = ref(topics[0]?.id || '');
const joinedTopics = ref([]);
const detailRef = ref(null);
const commentInput = ref('');
const submitHint = ref('');
const savedTopics = ref([]);

const { state } = useAuth();
const loginRequired = computed(() => !state.user);

const topicTags = computed(() => {
  const set = new Set();
  topicList.value.forEach((topic) => topic.tags.forEach((tag) => set.add(tag)));
  return ['全部', ...Array.from(set)];
});

const statsByTopicId = computed(() => {
  const map = {};
  topicList.value.forEach((topic) => {
    const extra = joinedTopics.value.includes(topic.id) ? 1 : 0;
    map[topic.id] = {
      ...topic.stats,
      members: topic.stats.members + extra,
      today: topic.stats.today + extra
    };
  });
  return map;
});

const activeTopicStats = computed(() => {
  if (!activeTopic.value) return null;
  return statsByTopicId.value[activeTopic.value.id] || activeTopic.value.stats;
});

const filteredTopics = computed(() => {
  const keyword = topicQuery.value.trim();
  let list = topicList.value.filter((topic) => {
    const hitTag = activeTag.value === '全部' || topic.tags.includes(activeTag.value);
    const hitKeyword =
      !keyword || topic.title.includes(keyword) || topic.desc.includes(keyword);
    return hitTag && hitKeyword;
  });
  if (topicSort.value === '活跃') {
    list = [...list].sort((a, b) => b.stats.today - a.stats.today);
  } else if (topicSort.value === '参与人数') {
    list = [...list].sort(
      (a, b) =>
        statsByTopicId.value[b.id].members - statsByTopicId.value[a.id].members
    );
  } else if (topicSort.value === '声音数') {
    list = [...list].sort((a, b) => b.stats.sounds - a.stats.sounds);
  }
  return list;
});

const communityStats = computed(() => {
  const totalMembers = topicList.value.reduce(
    (sum, item) => sum + statsByTopicId.value[item.id].members,
    0
  );
  const totalToday = topicList.value.reduce((sum, item) => sum + item.stats.today, 0);
  const totalSounds = topicList.value.reduce((sum, item) => sum + item.stats.sounds, 0);
  return [
    { label: '社区成员', value: totalMembers },
    { label: '今日新增', value: totalToday },
    { label: '声音累计', value: totalSounds }
  ];
});

const rankingTopics = computed(() =>
  [...topicList.value].sort((a, b) => b.stats.today - a.stats.today).slice(0, 3)
);

const activeTopic = computed(
  () => topicList.value.find((topic) => topic.id === activeTopicId.value) || null
);

const isJoined = computed(() => joinedTopics.value.includes(activeTopicId.value));
const isSaved = computed(() => savedTopics.value.includes(activeTopicId.value));

const viewTopic = async (topic) => {
  activeTopicId.value = topic.id;
  await nextTick();
  detailRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const toggleJoin = () => {
  if (!activeTopicId.value) return;
  if (isJoined.value) {
    joinedTopics.value = joinedTopics.value.filter((id) => id !== activeTopicId.value);
  } else {
    joinedTopics.value = [...joinedTopics.value, activeTopicId.value];
  }
};

const toggleSave = () => {
  if (loginRequired.value) {
    submitHint.value = '请先登录后收藏话题。';
    return;
  }
  if (!activeTopicId.value) return;
  if (isSaved.value) {
    savedTopics.value = savedTopics.value.filter((id) => id !== activeTopicId.value);
  } else {
    savedTopics.value = [...savedTopics.value, activeTopicId.value];
  }
};

const submitComment = () => {
  if (loginRequired.value) {
    submitHint.value = '请先登录后再提交。';
    return;
  }
  if (!activeTopic.value) return;
  const text = commentInput.value.trim();
  if (!text) {
    submitHint.value = '请输入评论内容。';
    return;
  }
  activeTopic.value.discussions.unshift({
    name: state.user?.name || '我',
    time: '刚刚',
    text
  });
  commentInput.value = '';
  submitHint.value = '已提交';
  persistDiscussions();
  setTimeout(() => {
    submitHint.value = '';
  }, 2000);
};

const loadLocalState = () => {
  try {
    joinedTopics.value = JSON.parse(localStorage.getItem('csm_joined_topics') || '[]');
    savedTopics.value = JSON.parse(localStorage.getItem('csm_saved_topics') || '[]');
  } catch {
    joinedTopics.value = [];
    savedTopics.value = [];
  }
};

const persistJoined = () => {
  localStorage.setItem('csm_joined_topics', JSON.stringify(joinedTopics.value));
};

const persistSaved = () => {
  localStorage.setItem('csm_saved_topics', JSON.stringify(savedTopics.value));
};

loadLocalState();

watch(joinedTopics, persistJoined, { deep: true });
watch(savedTopics, persistSaved, { deep: true });

const storedDiscussions = ref({});

const hydrateDiscussions = () => {
  try {
    const data = JSON.parse(localStorage.getItem('csm_topic_discussions') || '{}');
    storedDiscussions.value = data || {};
  } catch {
    storedDiscussions.value = {};
  }
  topics.forEach((topic) => {
    if (storedDiscussions.value[topic.id]) {
      topic.discussions = storedDiscussions.value[topic.id];
    }
  });
};

const persistDiscussions = () => {
  const payload = {};
  topicList.value.forEach((topic) => {
    payload[topic.id] = topic.discussions;
  });
  localStorage.setItem('csm_topic_discussions', JSON.stringify(payload));
};

hydrateDiscussions();
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1>社区与共创</h1>
        <p>与城市记录者一起，共同完善这张声音地图。</p>
      </div>
      <RouterLink v-if="loginRequired" class="primary-button" to="/login">登录后发布</RouterLink>
      <button v-else class="primary-button">发布话题</button>
    </header>

    <section class="community-layout">
      <div class="community-main">
        <div class="community-stats">
          <div v-for="stat in communityStats" :key="stat.label" class="stat-card">
            <p class="stat-value">{{ stat.value }}</p>
            <p class="stat-label">{{ stat.label }}</p>
          </div>
        </div>
        <div class="section-head">
          <div>
            <h2>精选故事</h2>
            <p>来自创作者的声音故事与灵感。</p>
          </div>
        </div>
        <div class="story-grid">
          <StoryCard v-for="story in stories" :key="story.name" :story="story" />
        </div>
        <div class="section-head">
          <div>
            <h2>热门话题</h2>
            <p>参与讨论，贡献你的声音视角。</p>
          </div>
        </div>
        <div class="topic-filter">
          <label>
            搜索话题
            <input v-model="topicQuery" type="text" placeholder="输入关键字" />
          </label>
          <div class="filter-row">
            <span>标签</span>
            <div class="filter-chips">
              <button
                v-for="tag in topicTags"
                :key="tag"
                class="chip"
                :class="{ active: activeTag === tag }"
                @click="activeTag = tag"
              >
                {{ tag }}
              </button>
            </div>
          </div>
          <label>
            排序
            <select v-model="topicSort">
              <option>活跃</option>
              <option>参与人数</option>
              <option>声音数</option>
            </select>
          </label>
        </div>
        <div class="topic-grid">
          <article
            v-for="topic in filteredTopics"
            :key="topic.id"
            class="topic-card"
            :class="{ active: activeTopicId === topic.id }"
          >
            <img
              class="topic-image"
              :src="topic.image"
              :alt="topic.title"
              loading="lazy"
              decoding="async"
            />
            <h3>{{ topic.title }}</h3>
            <p>{{ topic.desc }}</p>
            <div class="topic-tags">
              <span v-for="tag in topic.tags" :key="tag">{{ tag }}</span>
            </div>
            <RouterLink class="text-button" :to="`/community/topics/${topic.id}`">
              查看话题
            </RouterLink>
          </article>
        </div>
        <div v-if="!filteredTopics.length" class="topic-empty">
          <p>没有匹配的话题，请调整筛选条件。</p>
        </div>
        <div class="gallery-block">
          <div class="section-head">
            <div>
              <h2>社区图集</h2>
              <p>记录采集瞬间与现场氛围。</p>
            </div>
          </div>
          <div class="gallery-grid">
            <article v-for="item in gallery" :key="item.title" class="gallery-card">
              <img :src="item.image" :alt="item.title" loading="lazy" decoding="async" />
              <div>
                <h4>{{ item.title }}</h4>
                <p>{{ item.meta }}</p>
              </div>
            </article>
          </div>
        </div>
        <section ref="detailRef" class="topic-detail">
          <div v-if="activeTopic" class="detail-card">
            <div class="detail-head">
              <div>
                <h3>{{ activeTopic.title }}</h3>
                <p>{{ activeTopic.desc }}</p>
              </div>
              <div class="detail-actions">
                <button class="ghost-button" @click="toggleSave">
                  {{ isSaved ? '已收藏' : '收藏话题' }}
                </button>
                <button class="primary-button" @click="toggleJoin">
                  {{ isJoined ? '已加入' : '参与话题' }}
                </button>
              </div>
            </div>
            <div class="detail-stats">
              <div>
                <strong>{{ activeTopicStats?.members }}</strong>
                <span>参与者</span>
              </div>
              <div>
                <strong>{{ activeTopicStats?.today }}</strong>
                <span>今日新增</span>
              </div>
              <div>
                <strong>{{ activeTopicStats?.sounds }}</strong>
                <span>声音数量</span>
              </div>
            </div>
            <div class="detail-body">
              <div class="detail-block">
                <h4>采集建议</h4>
                <p>{{ activeTopic.guideline }}</p>
              </div>
              <div class="detail-block">
                <h4>最新动态</h4>
                <ul>
                  <li v-for="update in activeTopic.updates" :key="update.title + update.time">
                    <span>{{ update.title }}</span>
                    <small>{{ update.author }} · {{ update.time }}</small>
                  </li>
                </ul>
              </div>
            </div>
            <div class="detail-block">
              <h4>最新评论</h4>
              <ul class="comment-list">
                <li
                  v-for="comment in activeTopic.discussions"
                  :key="comment.name + comment.time + comment.text"
                >
                  <strong>{{ comment.name }}</strong>
                  <small>{{ comment.time }}</small>
                  <p>{{ comment.text }}</p>
                </li>
              </ul>
            </div>
            <div class="detail-input">
              <h4>发布讨论</h4>
              <textarea
                v-model="commentInput"
                rows="3"
                placeholder="分享你的声音线索或采集心得"
              ></textarea>
              <div class="comment-actions">
                <span class="submit-hint">{{ submitHint }}</span>
                <button class="ghost-button" :disabled="loginRequired" @click="submitComment">
                  提交讨论
                </button>
              </div>
            </div>
          </div>
          <div v-else class="detail-empty">
            <p>请选择一个话题查看详情。</p>
          </div>
        </section>
      </div>
      <aside class="community-side">
        <div class="side-card">
          <h3>本月活动</h3>
          <ul>
            <li v-for="event in events" :key="event.title">
              <span>{{ event.date }}</span>
              <strong>{{ event.title }}</strong>
            </li>
          </ul>
        </div>
        <div class="side-card">
          <h3>我的话题</h3>
          <p v-if="!savedTopics.length" class="muted">暂无收藏话题</p>
          <ul v-else class="topic-list">
            <li v-for="topicId in savedTopics" :key="topicId">
              <RouterLink class="text-button" :to="`/community/topics/${topicId}`">
                {{ topicList.find(t => t.id === topicId)?.title }}
              </RouterLink>
            </li>
          </ul>
        </div>
        <div class="side-card">
          <h3>话题榜单</h3>
          <ol class="rank-list">
            <li v-for="(topic, index) in rankingTopics" :key="topic.id">
              <span class="rank-index">{{ index + 1 }}</span>
              <div>
                <strong>{{ topic.title }}</strong>
                <p>
                  {{ topic.stats.today }} 今日新增 ·
                  {{ statsByTopicId[topic.id].members }} 人参与
                </p>
              </div>
            </li>
          </ol>
        </div>
        <div class="side-card goal-card">
          <h3>本周目标</h3>
          <p>收集 60 条新声音</p>
          <div class="goal-progress">
            <span style="width: 68%"></span>
          </div>
          <p class="goal-meta">已完成 41/60</p>
          <button class="ghost-button">参与挑战</button>
        </div>
        <div class="side-card">
          <h3>推荐创作者</h3>
          <div class="creator-grid">
            <CreatorCard v-for="creator in creators" :key="creator.name" :creator="creator" />
          </div>
        </div>
      </aside>
    </section>
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

.community-layout {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 2rem;
}

.community-main {
  display: grid;
  gap: 2rem;
}

.community-stats {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.stat-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 1rem;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 0.4rem;
}

.stat-value {
  font-weight: 700;
  font-size: 1.4rem;
}

.stat-label {
  color: var(--muted);
  font-size: 0.85rem;
}

.story-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.topic-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.topic-filter {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 18px;
  padding: 1.2rem;
  display: grid;
  gap: 1rem;
  box-shadow: var(--shadow-soft);
}

.topic-filter label {
  display: grid;
  gap: 0.4rem;
  font-size: 0.85rem;
}

.topic-filter input,
.topic-filter select {
  border: 1px solid rgba(17, 17, 17, 0.2);
  border-radius: 12px;
  padding: 0.6rem 0.8rem;
  font-family: inherit;
}

.filter-row {
  display: grid;
  gap: 0.6rem;
  font-size: 0.85rem;
}

.filter-chips {
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
  font-size: 0.8rem;
}

.chip.active {
  background: var(--sea);
  color: #fff;
  border-color: transparent;
}

.topic-empty {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 1rem;
  color: var(--muted);
}

.topic-card {
  background: #fff;
  border-radius: 18px;
  padding: 1.2rem 1.4rem;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 0.6rem;
}

.topic-image {
  width: 100%;
  height: 120px;
  border-radius: 14px;
  object-fit: cover;
  background: #f7f2e8;
}

.topic-card.active {
  border: 1px solid rgba(11, 107, 111, 0.3);
  box-shadow: 0 16px 36px rgba(11, 107, 111, 0.12);
}

.topic-tags {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.topic-tags span {
  background: rgba(11, 107, 111, 0.12);
  color: var(--sea);
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
}

.topic-detail {
  display: grid;
}

.gallery-block {
  display: grid;
  gap: 1rem;
}

.gallery-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.gallery-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-soft);
  display: grid;
}

.gallery-card img {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.gallery-card div {
  padding: 0.8rem 1rem 1rem;
}

.gallery-card p {
  color: var(--muted);
  font-size: 0.85rem;
  margin-top: 0.3rem;
}

.detail-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 1.6rem;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 1.2rem;
}

.detail-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.detail-actions {
  display: flex;
  gap: 0.8rem;
  align-items: center;
}

.detail-head p {
  color: var(--muted);
  margin-top: 0.4rem;
}

.detail-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.detail-stats div {
  background: #f7f2e8;
  border-radius: 14px;
  padding: 0.8rem;
  display: grid;
  gap: 0.2rem;
  text-align: center;
}

.detail-stats strong {
  font-size: 1.2rem;
}

.detail-stats span {
  color: var(--muted);
  font-size: 0.8rem;
}

.detail-body {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.detail-block {
  background: #fff;
  border-radius: 16px;
  padding: 1rem;
  border: 1px solid rgba(17, 17, 17, 0.08);
}

.detail-block h4 {
  margin-bottom: 0.6rem;
}

.detail-block ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.6rem;
}

.detail-block li {
  display: grid;
  gap: 0.2rem;
  font-size: 0.9rem;
}

.detail-block small {
  color: var(--muted);
  font-size: 0.75rem;
}

.comment-list li {
  background: #f7f2e8;
  border-radius: 12px;
  padding: 0.6rem 0.8rem;
  display: grid;
  gap: 0.3rem;
}

.comment-list p {
  margin: 0;
  font-size: 0.9rem;
}

.detail-input {
  display: grid;
  gap: 0.6rem;
}

.detail-input textarea {
  border: 1px solid rgba(17, 17, 17, 0.2);
  border-radius: 12px;
  padding: 0.6rem 0.8rem;
  font-family: inherit;
}

.comment-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.comment-actions button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-hint {
  color: var(--muted);
  font-size: 0.85rem;
}

.detail-empty {
  padding: 1.2rem;
  color: var(--muted);
}

.community-side {
  display: grid;
  gap: 1.5rem;
}

.side-card {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 18px;
  padding: 1.2rem 1.4rem;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 1rem;
}

.side-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.8rem;
}

.side-card li {
  display: grid;
  gap: 0.2rem;
  font-size: 0.9rem;
}

.side-card span {
  color: var(--muted);
  font-size: 0.8rem;
}

.creator-grid {
  display: grid;
  gap: 0.8rem;
}

.topic-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.6rem;
}

.topic-list .text-button {
  text-align: left;
  padding: 0;
}

.muted {
  color: var(--muted);
  font-size: 0.85rem;
}

.rank-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.8rem;
}

.rank-list li {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.8rem;
  align-items: start;
}

.rank-index {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(11, 107, 111, 0.12);
  color: var(--sea);
  display: grid;
  place-items: center;
  font-weight: 600;
}

.rank-list p {
  color: var(--muted);
  font-size: 0.8rem;
  margin-top: 0.3rem;
}

.goal-card p {
  color: var(--muted);
}

.goal-progress {
  height: 8px;
  border-radius: 999px;
  background: rgba(17, 17, 17, 0.1);
  overflow: hidden;
}

.goal-progress span {
  display: block;
  height: 100%;
  background: var(--sea);
  width: 0;
}

.goal-meta {
  font-size: 0.85rem;
}

@media (max-width: 900px) {
  .community-layout {
    grid-template-columns: 1fr;
  }
}
</style>
