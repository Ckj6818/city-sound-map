<!-- 姓名：陈柯杰，学号：25230810129，日期：2025-12-21 -->
<script setup>
import { computed } from 'vue';
import useAuth from './composables/useAuth';

const navItems = [
  { name: '首页', path: '/' },
  { name: '声景库', path: '/sounds' },
  { name: '路线', path: '/routes' },
  { name: '上传', path: '/upload' },
  { name: '社区', path: '/community' }
];

const { state, logout } = useAuth();
const initials = computed(() => {
  if (!state.user?.name) return '';
  return state.user.name.trim().slice(0, 1).toUpperCase();
});
</script>

<template>
  <div class="app-shell">
    <header class="site-header">
      <RouterLink class="brand" to="/">
        <span class="brand-mark"></span>
        <div>
          <p class="brand-name">City Sound Map</p>
          <p class="brand-sub">城市声音地图</p>
        </div>
      </RouterLink>
      <nav class="nav">
        <RouterLink v-for="item in navItems" :key="item.path" :to="item.path">
          {{ item.name }}
        </RouterLink>
      </nav>
      <div class="auth-actions">
        <RouterLink v-if="!state.user" class="text-link" to="/login">登录</RouterLink>
        <RouterLink v-if="!state.user" class="ghost-button" to="/register">注册</RouterLink>
        <RouterLink v-if="!state.user" class="ghost-button" to="/sounds">立即体验</RouterLink>
        <div v-else class="user-chip">
          <span class="avatar">{{ initials }}</span>
          <div>
            <p class="user-name">{{ state.user.name }}</p>
            <p class="user-email">{{ state.user.email }}</p>
          </div>
          <button class="text-button" @click="logout">退出</button>
        </div>
      </div>
    </header>

    <main class="content">
      <RouterView />
    </main>

    <footer class="site-footer">
      <div>
        <p class="footer-title">城市声音地图</p>
        <p class="footer-desc">一个用声音记录城市记忆的探索平台。</p>
      </div>
      <div class="footer-links">
        <RouterLink to="/">地图探索</RouterLink>
        <RouterLink to="/upload">声音上传</RouterLink>
        <RouterLink to="/community">社区互动</RouterLink>
      </div>
      <p class="footer-note">© 2025 City Sound Map · Vue 3 Frontend Demo</p>
    </footer>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 3rem;
  padding: 2.5rem clamp(1.5rem, 3vw, 4rem) 3rem;
}

.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 1rem 0;
  background: rgba(247, 242, 232, 0.72);
  backdrop-filter: blur(12px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  background: conic-gradient(from 120deg, var(--sea), var(--sun), var(--coral));
  box-shadow: 0 8px 18px rgba(24, 41, 34, 0.2);
}

.brand-name {
  font-family: var(--font-display);
  font-size: 1.05rem;
  letter-spacing: 1px;
}

.brand-sub {
  font-size: 0.9rem;
  color: var(--muted);
}

.nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-size: 0.95rem;
}

.nav a {
  color: inherit;
  opacity: 0.8;
}

.nav a.router-link-active {
  color: var(--sea);
  opacity: 1;
}

.content {
  flex: 1;
  display: grid;
}

.auth-actions {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.text-link {
  color: var(--sea);
  font-weight: 600;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 999px;
  padding: 0.4rem 0.8rem;
  border: 1px solid rgba(17, 17, 17, 0.1);
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--sea);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 600;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 600;
}

.user-email {
  font-size: 0.75rem;
  color: var(--muted);
}

.site-footer {
  display: grid;
  gap: 1.2rem;
  border-top: 1px solid rgba(17, 17, 17, 0.1);
  padding-top: 2rem;
}

.footer-title {
  font-family: var(--font-display);
  font-size: 1.3rem;
}

.footer-links {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.footer-note {
  font-size: 0.85rem;
  color: var(--muted);
}

@media (max-width: 900px) {
  .nav {
    display: none;
  }
}

@media (max-width: 720px) {
  .site-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
