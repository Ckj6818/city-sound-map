<script setup>
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import useAuth from '../composables/useAuth';

const router = useRouter();
const { register } = useAuth();

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirm: ''
});

const message = ref('');

const isValid = computed(() => {
  return (
    form.name.trim().length >= 2 &&
    form.email &&
    form.password.length >= 6 &&
    form.password === form.confirm
  );
});

const submit = () => {
  if (!isValid.value) {
    message.value = '请完整填写信息并确认密码一致。';
    return;
  }
  const result = register({
    name: form.name.trim(),
    email: form.email.trim(),
    password: form.password
  });
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
        <h1>注册</h1>
        <p>创建账号，开始上传与记录你的城市声音。</p>
      </div>
    </header>

    <section class="auth-card">
      <form class="auth-form" @submit.prevent="submit">
        <label>
          昵称
          <input v-model="form.name" type="text" placeholder="至少 2 个字符" />
        </label>
        <label>
          邮箱
          <input v-model="form.email" type="email" placeholder="name@example.com" />
        </label>
        <label>
          密码
          <input v-model="form.password" type="password" placeholder="至少 6 位" />
        </label>
        <label>
          确认密码
          <input v-model="form.confirm" type="password" placeholder="再次输入密码" />
        </label>
        <button class="primary-button full" type="submit">注册并登录</button>
        <p v-if="message" class="status warn">{{ message }}</p>
        <p class="helper">
          已有账号？
          <RouterLink to="/login">去登录</RouterLink>
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
