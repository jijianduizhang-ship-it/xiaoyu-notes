<template>
  <div>
    <!-- 用户卡片 -->
    <div class="profile-card">
      <div class="avatar-lg">{{ userInitial }}</div>
      <div class="profile-info">
        <div class="profile-name">{{ auth.userInfo.nickname || '管理员' }}</div>
        <div class="profile-role">管理员</div>
      </div>
    </div>

    <!-- 学习数据 -->
    <div class="card data-card">
      <div class="data-title">学习数据</div>
      <div class="data-grid">
        <div class="data-item">
          <div class="data-num">{{ stats?.totalMinutes || 0 }}</div>
          <div class="data-label">累计分钟</div>
        </div>
        <div class="data-item">
          <div class="data-num">{{ stats?.todayMinutes || 0 }}</div>
          <div class="data-label">今日分钟</div>
        </div>
        <div class="data-item">
          <div class="data-num">{{ stats?.wordsCount || 0 }}</div>
          <div class="data-label">已学单词</div>
        </div>
        <div class="data-item">
          <div class="data-num">{{ stats?.level || 1 }}</div>
          <div class="data-label">当前等级</div>
        </div>
      </div>
    </div>

    <!-- 菜单列表 -->
    <div class="menu-list">
      <div class="menu-item" @click="router.push('/vip')">
        <span class="menu-icon">👑</span>
        <span class="menu-text">会员中心</span>
        <span class="menu-arrow">&gt;</span>
      </div>
      <div class="menu-item" @click="goAdmin">
        <span class="menu-icon">⚙️</span>
        <span class="menu-text">管理后台</span>
        <span class="menu-arrow">&gt;</span>
      </div>
    </div>

    <!-- 退出登录 -->
    <button class="btn-logout" @click="handleLogout">退出登录</button>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUserStore } from '../stores/user'

const router = useRouter()
const auth = useAuthStore()
const user = useUserStore()

const stats = computed(() => user.stats)

const userInitial = computed(() => {
  const name = auth.userInfo.nickname || 'A'
  return name.charAt(0).toUpperCase()
})

function goAdmin() {
  window.open('/admin/', '_blank')
}

function handleLogout() {
  if (confirm('确定要退出登录吗？')) {
    auth.logout()
    router.push('/login')
  }
}

onMounted(async () => {
  await user.fetchStats()
})
</script>

<style scoped>
.profile-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: white;
  margin-bottom: 16px;
}

.avatar-lg {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
}

.profile-name {
  font-size: 18px;
  font-weight: 600;
}

.profile-role {
  font-size: 13px;
  opacity: 0.8;
  margin-top: 2px;
}

.data-card {
  margin-bottom: 16px;
}

.data-title {
  font-size: 15px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 14px;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.data-item {
  text-align: center;
}

.data-num {
  font-size: 18px;
  font-weight: 700;
  color: #667eea;
}

.data-label {
  font-size: 11px;
  color: #a0aec0;
  margin-top: 2px;
}

.menu-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 16px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f7fafc;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: #f7fafc;
}

.menu-icon {
  font-size: 18px;
}

.menu-text {
  flex: 1;
  font-size: 15px;
  color: #2d3748;
}

.menu-arrow {
  color: #cbd5e0;
  font-size: 16px;
}

.btn-logout {
  width: 100%;
  padding: 14px;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  color: #e53e3e;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-logout:active {
  background: #fff5f5;
  border-color: #feb2b2;
}
</style>
