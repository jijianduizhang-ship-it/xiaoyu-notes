<template>
  <div>
    <div class="lang-tabs">
      <div
        v-for="lang in langs"
        :key="lang.value"
        class="lang-tab"
        :class="{ active: currentLang === lang.value }"
        @click="switchLang(lang.value)"
      >
        {{ lang.label }}
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else>
      <!-- 热门场景 -->
      <div v-if="hotScenes.length" class="section">
        <div class="section-title">🔥 热门场景</div>
        <div class="scene-grid">
          <div
            v-for="scene in hotScenes"
            :key="scene.id"
            class="scene-card hot"
            @click="goScene(scene)"
          >
            <div class="scene-cover">{{ sceneEmoji(scene.category) }}</div>
            <div class="scene-title">{{ scene.title }}</div>
            <div class="scene-desc">{{ scene.description }}</div>
            <div class="scene-views">👁 {{ scene.count || 0 }}</div>
          </div>
        </div>
      </div>

      <!-- 全部场景 -->
      <div class="section">
        <div class="section-title">📚 全部场景</div>
        <div class="scene-list">
          <div
            v-for="scene in normalScenes"
            :key="scene.id"
            class="scene-row"
            @click="goScene(scene)"
          >
            <div class="scene-row-icon">{{ sceneEmoji(scene.category) }}</div>
            <div class="scene-row-info">
              <div class="scene-row-title">{{ scene.title }}</div>
              <div class="scene-row-desc">{{ scene.description }}</div>
            </div>
            <div class="scene-arrow">&gt;</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const user = useUserStore()

const loading = ref(false)
const currentLang = ref(user.currentLang)

const langs = [
  { label: '🇰🇷 韩语', value: 'korean' },
  { label: '🇯🇵 日语', value: 'japanese' },
  { label: '🇺🇸 英语', value: 'english' },
]

const hotScenes = computed(() => user.scenes.filter(s => s.hot))
const normalScenes = computed(() => user.scenes.filter(s => !s.hot))

function sceneEmoji(category) {
  const map = {
    travel: '✈️', shopping: '🛍️', medical: '🏥', academic: '🎓',
    romance: '💕', food: '🍜', work: '💼', daily: '🏠',
  }
  return map[category] || '💬'
}

async function switchLang(lang) {
  currentLang.value = lang
  user.currentLang = lang
  loading.value = true
  await user.fetchScenes(lang)
  loading.value = false
}

function goScene(scene) {
  router.push(`/scene/${scene.id}`)
}

onMounted(async () => {
  loading.value = true
  await user.fetchScenes(currentLang.value)
  loading.value = false
})
</script>

<style scoped>
.lang-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.lang-tab {
  flex: 1;
  text-align: center;
  padding: 8px;
  border-radius: 10px;
  background: white;
  font-size: 14px;
  color: #718096;
  cursor: pointer;
  transition: all 0.2s;
}

.lang-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 12px;
}

.scene-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.scene-card.hot {
  background: white;
  border-radius: 12px;
  padding: 16px 12px;
  cursor: pointer;
  transition: transform 0.15s;
}

.scene-card.hot:active {
  transform: scale(0.97);
}

.scene-cover {
  font-size: 36px;
  margin-bottom: 8px;
}

.scene-title {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.scene-desc {
  font-size: 12px;
  color: #a0aec0;
  margin-bottom: 6px;
  line-height: 1.4;
}

.scene-views {
  font-size: 11px;
  color: #cbd5e0;
}

.scene-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.scene-row {
  background: white;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.15s;
}

.scene-row:active {
  transform: scale(0.98);
}

.scene-row-icon {
  font-size: 28px;
  width: 44px;
  height: 44px;
  background: rgba(102, 126, 234, 0.06);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scene-row-info {
  flex: 1;
}

.scene-row-title {
  font-size: 15px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 2px;
}

.scene-row-desc {
  font-size: 12px;
  color: #a0aec0;
}

.scene-arrow {
  color: #cbd5e0;
  font-size: 18px;
}
</style>
