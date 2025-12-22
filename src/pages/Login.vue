<script setup>
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import useAuth from '../composables/useAuth';

const router = useRouter();
const { login } = useAuth();

const form = reactive({
  email: '',
  password: ''
});

const message = ref('');
const isValid = computed(() => form.email && form.password.length >= 6);

const submit = () => {
  if (!isValid.value) {
    message.value = '请输入正确的邮箱和至少 6 位密码。';
    return;
  }
  const result = login({ email: form.email.trim(), password: form.password });
  if (!result.ok) {
    message.value = result.message;
    return;
  }
  router.push('/sounds');
};
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1>登录</h1>
        <p>登录后可以保存路线与参与社区讨论。</p>
      </div>
    </header>

    <section class="auth-card">
      <form class="auth-form" @submit.prevent="submit">
        <label>
          邮箱
          <input v-model="form.email" type="email" placeholder="name@example.com" />
        </label>
        <label>
          密码
          <input v-model="form.password" type="password" placeholder="至少 6 位" />
        </label>
        <button class="primary-button full" type="submit">登录</button>
        <p v-if="message" class="status warn">{{ message }}</p>
        <p class="helper">
          没有账号？
          <RouterLink to="/register">去注册</RouterLink>
        </p>
      </form>
    </section>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  gap: 2rem;
}

.page-header h1 {
  font-family: var(--font-display);
  font-size: clamp(2rem, 3vw, 2.8rem);
}

.page-header p {
  color: var(--muted);
  margin-top: 0.4rem;
}

.auth-card {
  background: #fff;
  border-radius: 22px;
  padding: 2rem;
  box-shadow: var(--shadow-soft);
  max-width: 520px;
}

.auth-form {
  display: grid;
  gap: 1rem;
}

.auth-form label {
  font-size: 0.85rem;
  display: grid;
  gap: 0.4rem;
}

.auth-form input {
  border: 1px solid rgba(17, 17, 17, 0.2);
  border-radius: 12px;
  padding: 0.6rem 0.8rem;
  font-family: inherit;
}

.full {
  width: 100%;
}

.helper {
  font-size: 0.85rem;
  color: var(--muted);
}

.helper a {
  color: var(--sea);
}

.status.warn {
  color: #d0713f;
  font-size: 0.85rem;
}
</style>
