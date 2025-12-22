<script setup>
import { computed, onBeforeUnmount, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import useAuth from '../composables/useAuth';

const form = reactive({
  title: '',
  tag: '自然',
  city: '',
  location: '',
  mood: '',
  story: ''
});

const status = ref('');
const audioFile = ref(null);
const audioUrl = ref('');
const audioDuration = ref(0);
const audioCurrent = ref(0);
const audioPlaying = ref(false);
const audioHint = ref('');
const fileInputRef = ref(null);
const audio = new Audio();

const router = useRouter();
const { state } = useAuth();
const loginRequired = computed(() => !state.user);

const submit = () => {
  if (loginRequired.value) {
    status.value = '请先登录后再保存。';
    return;
  }
  status.value = '已保存为草稿，可继续补充后发布。';
  setTimeout(() => {
    status.value = '';
  }, 3000);
};

const formatTime = (value) => {
  const minutes = Math.floor((value || 0) / 60);
  const seconds = Math.floor((value || 0) % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const formatSize = (size) => {
  if (!size) return '0 KB';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
};

const durationLabel = computed(() => formatTime(audioDuration.value));
const currentLabel = computed(() => formatTime(audioCurrent.value));
const progress = computed(() => {
  if (!audioDuration.value) return 0;
  return (audioCurrent.value / audioDuration.value) * 100;
});

const resetAudio = () => {
  audio.pause();
  audioPlaying.value = false;
  audioCurrent.value = 0;
  audioDuration.value = 0;
  audioHint.value = '';
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
  }
  audioUrl.value = '';
  audioFile.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const onAudioUpdate = () => {
  audioCurrent.value = audio.currentTime || 0;
  audioDuration.value = Number.isFinite(audio.duration) ? audio.duration : 0;
};

const onAudioEnded = () => {
  audioPlaying.value = false;
};

const onAudioError = () => {
  audioHint.value = '音频加载失败，请尝试其他格式。';
};

const handleFileChange = (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    resetAudio();
    return;
  }
  if (!file.type.startsWith('audio/')) {
    audioHint.value = '请选择音频文件（mp3/wav/aac 等）。';
    resetAudio();
    return;
  }
  audioHint.value = '';
  audioFile.value = file;
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
  }
  audioUrl.value = URL.createObjectURL(file);
  audio.src = audioUrl.value;
  audio.load();
};

const togglePlay = async () => {
  if (!audioUrl.value) {
    audioHint.value = '请先选择音频文件。';
    return;
  }
  if (audioPlaying.value) {
    audio.pause();
    audioPlaying.value = false;
    return;
  }
  try {
    await audio.play();
    audioPlaying.value = true;
  } catch {
    audioPlaying.value = false;
    audioHint.value = '浏览器阻止自动播放，请点击按钮再次播放。';
  }
};

const onSeek = (event) => {
  const percent = Number(event.target.value) / 100;
  if (!audioDuration.value) return;
  audio.currentTime = audioDuration.value * percent;
};

audio.addEventListener('timeupdate', onAudioUpdate);
audio.addEventListener('loadedmetadata', onAudioUpdate);
audio.addEventListener('ended', onAudioEnded);
audio.addEventListener('error', onAudioError);

onBeforeUnmount(() => {
  audio.removeEventListener('timeupdate', onAudioUpdate);
  audio.removeEventListener('loadedmetadata', onAudioUpdate);
  audio.removeEventListener('ended', onAudioEnded);
  audio.removeEventListener('error', onAudioError);
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
  }
});
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1>上传声音</h1>
        <p>补充地点、故事与情绪，让声音更有记忆点。</p>
      </div>
      <div class="page-actions">
        <RouterLink v-if="loginRequired" class="ghost-button" to="/login">登录后上传</RouterLink>
        <button v-else class="ghost-button">查看上传指南</button>
      </div>
    </header>

    <section class="upload-layout">
      <form class="upload-form" @submit.prevent="submit">
        <div v-if="loginRequired" class="login-alert">
          <p>登录后可上传声音并保存草稿。</p>
          <RouterLink class="text-button" to="/login">去登录</RouterLink>
        </div>
        <label class="file-field">
          音频文件
          <input
            ref="fileInputRef"
            type="file"
            accept="audio/*"
            @change="handleFileChange"
          />
          <span class="file-hint">建议 10MB 以内，支持 mp3/wav/aac。</span>
        </label>
        <div v-if="audioFile" class="file-meta">
          <div>
            <strong>{{ audioFile.name }}</strong>
            <p>{{ formatSize(audioFile.size) }} · {{ durationLabel }}</p>
          </div>
          <button type="button" class="text-button" @click="resetAudio">移除</button>
        </div>
        <p v-if="audioHint" class="status warn">{{ audioHint }}</p>
        <label>
          声音标题
          <input v-model="form.title" type="text" placeholder="比如：河岸夜风" />
        </label>
        <label>
          标签
          <select v-model="form.tag">
            <option>自然</option>
            <option>交通</option>
            <option>人声</option>
            <option>音乐</option>
            <option>环境</option>
          </select>
        </label>
        <label>
          城市
          <input v-model="form.city" type="text" placeholder="例如：杭州" />
        </label>
        <label>
          具体地点
          <input v-model="form.location" type="text" placeholder="如：拱宸桥河岸" />
        </label>
        <label>
          情绪标签
          <input v-model="form.mood" type="text" placeholder="安静、轻快、温暖…" />
        </label>
        <label>
          故事描述
          <textarea v-model="form.story" rows="5" placeholder="这段声音背后的故事"></textarea>
        </label>
        <button class="primary-button full" type="submit" :disabled="loginRequired">
          保存为草稿
        </button>
        <p v-if="status" class="status">{{ status }}</p>
      </form>

      <div class="preview">
        <div class="preview-card">
          <p class="preview-title">声音预览</p>
          <h3>{{ form.title || '未命名声音' }}</h3>
          <p class="preview-meta">
            {{ form.city || '城市' }} · {{ form.location || '地点' }}
          </p>
          <span class="preview-tag">{{ form.tag }}</span>
          <p class="preview-mood">{{ form.mood || '情绪标签待补充' }}</p>
          <p class="preview-story">{{ form.story || '故事描述待补充' }}</p>
          <div class="audio-player">
            <button class="primary-button ghost" type="button" @click="togglePlay">
              {{ audioPlaying ? '暂停' : '试听预览' }}
            </button>
            <div class="player-bar">
              <span :style="{ width: `${progress}%` }"></span>
            </div>
            <div class="player-meta">
              <span>{{ currentLabel }}</span>
              <input type="range" min="0" max="100" :value="progress" @input="onSeek" />
              <span>{{ durationLabel }}</span>
            </div>
          </div>
        </div>
        <div class="tips">
          <h4>上传小贴士</h4>
          <ul>
            <li>录音时避开强风，尽量靠近声音源。</li>
            <li>描述中写下“时间 + 场景”，更利于检索。</li>
            <li>添加照片或小故事，声音会更有温度。</li>
          </ul>
        </div>
      </div>
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

.page-actions {
  display: flex;
  gap: 0.8rem;
}

.upload-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 2rem;
}

.upload-form {
  background: #fff;
  padding: 1.8rem;
  border-radius: 22px;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 1rem;
}

.upload-form label {
  font-size: 0.85rem;
  display: grid;
  gap: 0.4rem;
}

.upload-form input,
.upload-form select,
.upload-form textarea {
  border: 1px solid rgba(17, 17, 17, 0.2);
  border-radius: 12px;
  padding: 0.6rem 0.8rem;
  font-family: inherit;
}

.file-field input[type='file'] {
  border: 1px dashed rgba(17, 17, 17, 0.25);
  background: rgba(245, 242, 232, 0.4);
}

.file-hint {
  color: var(--muted);
  font-size: 0.8rem;
}

.file-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: rgba(245, 242, 232, 0.6);
  border-radius: 12px;
  padding: 0.6rem 0.8rem;
}

.file-meta p {
  margin-top: 0.2rem;
  color: var(--muted);
  font-size: 0.85rem;
}

.upload-form .full {
  width: 100%;
  margin-top: 0.4rem;
}

.upload-form button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.status {
  color: var(--sea);
  font-size: 0.85rem;
}

.status.warn {
  color: #d0713f;
}

.login-alert {
  background: rgba(11, 107, 111, 0.08);
  border-radius: 14px;
  padding: 0.8rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.85rem;
}

.preview {
  display: grid;
  gap: 1.2rem;
}

.preview-card {
  background: linear-gradient(140deg, #fdf7ef, #f4efe6);
  border-radius: 22px;
  padding: 1.6rem;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 0.6rem;
}

.preview-title {
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.75rem;
  color: var(--muted);
}

.preview-meta {
  color: var(--muted);
}

.preview-tag {
  background: rgba(11, 107, 111, 0.12);
  color: var(--sea);
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  width: fit-content;
}

.preview-mood {
  font-weight: 600;
}

.audio-player {
  display: grid;
  gap: 0.6rem;
  margin-top: 0.6rem;
}

.primary-button.ghost {
  background: #fff;
  color: var(--sea);
  border: 1px solid rgba(11, 107, 111, 0.2);
  box-shadow: none;
}

.player-bar {
  height: 6px;
  background: rgba(17, 17, 17, 0.1);
  border-radius: 999px;
  overflow: hidden;
}

.player-bar span {
  display: block;
  height: 100%;
  background: var(--sea);
  width: 0%;
  transition: width 0.2s ease;
}

.player-meta {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.8rem;
  align-items: center;
  font-size: 0.85rem;
  color: var(--muted);
}

.player-meta input[type='range'] {
  width: 100%;
}

.tips {
  background: rgba(255, 255, 255, 0.75);
  border-radius: 18px;
  padding: 1.2rem 1.4rem;
  box-shadow: var(--shadow-soft);
}

.tips ul {
  padding-left: 1.2rem;
  margin: 0.6rem 0 0;
  display: grid;
  gap: 0.4rem;
  color: var(--muted);
  font-size: 0.9rem;
}
</style>
