<template>
  <div class="page">
    <div class="login-bg">
      <div class="login-header">
        <div class="logo-icon">🌏</div>
        <h1>小语笔记</h1>
        <p>轻松掌握多语言</p>
      </div>

      <div class="card login-card">
        <h2>管理员登录</h2>

        <div class="form-group">
          <label>账号</label>
          <input
            v-model="username"
            type="text"
            class="input-field"
            placeholder="请输入账号"
            autocomplete="off"
          />
        </div>

        <div class="form-group">
          <label>密码</label>
          <input
            v-model="password"
            type="password"
            class="input-field"
            placeholder="请输入密码"
            @keyup.enter="handleLogin"
          />
        </div>

        <div v-if="errorMsg" class="error-tip">{{ errorMsg }}</div>

        <button class="btn-primary" :disabled="loading" @click="handleLogin">
          <span v-if="loading" class="spinner" style="width:18px;height:18px;border-width:2px;margin-right:8px"></span>
          {{ loading ? '登录中...' : '登 录' }}
        </button>

        <div class="divider">
          <span>或</span>
        </div>

        <button class="btn-vip" :disabled="vipLoading" @click="handleVipLogin">
          <span v-if="vipLoading" class="spinner" style="width:16px;height:16px;border-width:2px;margin-right:6px;border-color:rgba(255,255,255,0.3);border-top-color:#fff"></span>
          👑 VIP体验登录
        </button>
        <p class="vip-tip">使用VIP测试账号登录，解锁全部功能</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { publicApi } from '../api'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const vipLoading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  if (!username.value || !password.value) {
    errorMsg.value = '请输入账号和密码'
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    await auth.adminLogin(username.value, password.value)
    router.push('/')
  } catch (e) {
    errorMsg.value = e.message || '登录失败，请检查账号密码'
  } finally {
    loading.value = false
  }
}

async function handleVipLogin() {
  vipLoading.value = true
  try {
    const res = await publicApi.vipLogin()
    auth.token = res.data.token
    auth.userInfo = res.data.userInfo
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('userInfo', JSON.stringify(res.data.userInfo))
    router.push('/')
  } catch (e) {
    errorMsg.value = e.message || 'VIP登录失败'
  } finally {
    vipLoading.value = false
  }
}
</script>

<style scoped>
.login-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.login-header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
}

.logo-icon {
  font-size: 56px;
  margin-bottom: 12px;
}

.login-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 6px;
}

.login-header p {
  font-size: 14px;
  opacity: 0.85;
}

.login-card {
  width: 100%;
  max-width: 380px;
  padding: 32px 28px;
}

.login-card h2 {
  font-size: 20px;
  color: #2d3748;
  text-align: center;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #4a5568;
  margin-bottom: 8px;
  font-weight: 500;
}

.error-tip {
  color: #e53e3e;
  font-size: 13px;
  margin-bottom: 14px;
  text-align: center;
}

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
  color: #a0aec0;
  font-size: 13px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}

.btn-vip {
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg, #f6e05e 0%, #ed8936 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s;
}

.btn-vip:active {
  opacity: 0.85;
}

.btn-vip:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.vip-tip {
  text-align: center;
  font-size: 12px;
  color: #a0aec0;
  margin-top: 10px;
}
</style>
