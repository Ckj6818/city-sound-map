import { createRouter, createWebHistory } from 'vue-router';

const Home = () => import('../pages/Home.vue');
const Sounds = () => import('../pages/Sounds.vue');
const SoundDetail = () => import('../pages/SoundDetail.vue');
const Routes = () => import('../pages/Routes.vue');
const Upload = () => import('../pages/Upload.vue');
const Community = () => import('../pages/Community.vue');
const Login = () => import('../pages/Login.vue');
const Register = () => import('../pages/Register.vue');
const TopicDetail = () => import('../pages/TopicDetail.vue');
const InteractionLab = () => import('../pages/InteractionLab.vue');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/sounds', name: 'sounds', component: Sounds },
    { path: '/sounds/:id', name: 'sound-detail', component: SoundDetail },
    { path: '/routes', name: 'routes', component: Routes },
    { path: '/upload', name: 'upload', component: Upload },
    { path: '/community', name: 'community', component: Community },
    { path: '/community/topics/:id', name: 'topic-detail', component: TopicDetail },
    { path: '/login', name: 'login', component: Login },
    { path: '/register', name: 'register', component: Register },
    { path: '/interaction', name: 'interaction', component: InteractionLab }
  ],
  scrollBehavior() {
    return { top: 0 };
  }
});

export default router;
