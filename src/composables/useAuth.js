import { reactive } from 'vue';

const USERS_KEY = 'csm_users';
const CURRENT_USER_KEY = 'csm_current_user';

const state = reactive({
  user: null,
  users: []
});

const load = () => {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
    state.users = Array.isArray(users) ? users : [];
    state.user = user;
  } catch {
    state.users = [];
    state.user = null;
  }
};

const saveUsers = () => {
  localStorage.setItem(USERS_KEY, JSON.stringify(state.users));
};

const saveCurrentUser = () => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(state.user));
};

const register = ({ name, email, password }) => {
  const exists = state.users.some((item) => item.email === email);
  if (exists) {
    return { ok: false, message: '该邮箱已注册，请直接登录。' };
  }
  const user = {
    id: `user-${Date.now()}`,
    name,
    email,
    password,
    createdAt: new Date().toISOString()
  };
  state.users = [user, ...state.users];
  saveUsers();
  state.user = { id: user.id, name: user.name, email: user.email };
  saveCurrentUser();
  return { ok: true };
};

const login = ({ email, password }) => {
  const user = state.users.find((item) => item.email === email);
  if (!user) {
    return { ok: false, message: '账号不存在，请先注册。' };
  }
  if (user.password !== password) {
    return { ok: false, message: '密码错误，请重试。' };
  }
  state.user = { id: user.id, name: user.name, email: user.email };
  saveCurrentUser();
  return { ok: true };
};

const logout = () => {
  state.user = null;
  saveCurrentUser();
};

const ensureLoaded = () => {
  if (state.users.length || state.user) return;
  load();
};

export default function useAuth() {
  ensureLoaded();
  return {
    state,
    register,
    login,
    logout
  };
}
