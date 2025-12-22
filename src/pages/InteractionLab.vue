<script setup>
import { computed, ref } from 'vue';

const showTips = ref(true);
const tips = [
  {
    title: 'Collect clean ambience',
    detail: 'Find a quiet corner and hold the mic steady for 20-30 seconds.'
  },
  {
    title: 'Mark the location',
    detail: 'Write down street names or landmarks to help map the sound later.'
  }
];

const taskInput = ref('');
const tasks = ref([
  { id: 1, text: 'Record a short rain ambience', done: false },
  { id: 2, text: 'Tag the sound with a category', done: true }
]);

const remaining = computed(() => tasks.value.filter((task) => !task.done).length);

const addTask = () => {
  const text = taskInput.value.trim();
  if (!text) return;
  tasks.value.unshift({ id: Date.now(), text, done: false });
  taskInput.value = '';
};

const removeTask = (id) => {
  tasks.value = tasks.value.filter((task) => task.id !== id);
};

const toggleTask = (id) => {
  const item = tasks.value.find((task) => task.id === id);
  if (item) item.done = !item.done;
};
</script>

<template>
  <section class="lab">
    <header class="lab-header">
      <div>
        <h1>Interaction Lab</h1>
        <p>Two interactions: show/hide tips and a simple todo list.</p>
      </div>
      <button class="ghost-button" type="button" @click="showTips = !showTips">
        {{ showTips ? 'Hide tips' : 'Show tips' }}
      </button>
    </header>

    <div class="lab-grid">
      <article class="panel">
        <h2>Quick Tips</h2>
        <p class="panel-desc">Click the button to show or hide the tips list.</p>
        <ul v-if="showTips" class="tips">
          <li v-for="tip in tips" :key="tip.title">
            <strong>{{ tip.title }}</strong>
            <span>{{ tip.detail }}</span>
          </li>
        </ul>
        <p v-else class="muted">Tips are hidden.</p>
      </article>

      <article class="panel">
        <h2>Todo List</h2>
        <p class="panel-desc">Add or remove tasks to track your capture plan.</p>
        <form class="task-form" @submit.prevent="addTask">
          <input v-model="taskInput" type="text" placeholder="Add a new task" />
          <button type="submit">Add</button>
        </form>
        <div class="task-meta">
          <span>{{ remaining }} remaining</span>
          <span>{{ tasks.length }} total</span>
        </div>
        <ul class="task-list">
          <li v-for="task in tasks" :key="task.id" :class="{ done: task.done }">
            <button type="button" class="check" @click="toggleTask(task.id)">
              {{ task.done ? 'Done' : 'Todo' }}
            </button>
            <span>{{ task.text }}</span>
            <button type="button" class="remove" @click="removeTask(task.id)">
              Remove
            </button>
          </li>
        </ul>
      </article>
    </div>
  </section>
</template>

<style scoped>
.lab {
  display: grid;
  gap: 1.8rem;
}

.lab-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.lab-header h1 {
  margin: 0 0 0.3rem;
}

.lab-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.panel {
  background: #fff;
  padding: 1.6rem;
  border-radius: 20px;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 1rem;
}

.panel-desc {
  color: var(--muted);
  font-size: 0.95rem;
}

.tips {
  display: grid;
  gap: 0.8rem;
  padding-left: 1rem;
}

.tips strong {
  display: block;
}

.tips span {
  color: var(--muted);
  font-size: 0.9rem;
}

.task-form {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.task-form input {
  flex: 1;
  min-width: 180px;
  padding: 0.6rem 0.8rem;
  border-radius: 12px;
  border: 1px solid rgba(17, 17, 17, 0.2);
}

.task-meta {
  display: flex;
  gap: 1rem;
  color: var(--muted);
  font-size: 0.9rem;
}

.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.7rem;
}

.task-list li {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.8rem;
  border-radius: 12px;
  background: rgba(17, 17, 17, 0.04);
}

.task-list li.done span {
  text-decoration: line-through;
  color: var(--muted);
}

.check {
  border: none;
  background: rgba(11, 107, 111, 0.12);
  color: var(--sea);
  border-radius: 999px;
  padding: 0.2rem 0.7rem;
  font-weight: 600;
  cursor: pointer;
}

.remove {
  border: none;
  background: transparent;
  color: var(--coral);
  cursor: pointer;
  font-weight: 600;
}

.muted {
  color: var(--muted);
}

@media (max-width: 720px) {
  .lab-header {
    align-items: stretch;
  }
}
</style>
