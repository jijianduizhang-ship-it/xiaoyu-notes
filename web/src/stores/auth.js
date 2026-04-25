import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { publicApi } from '../api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

  const isLoggedIn = computed(() => !!token.value)

  async function adminLogin(username, password) {
    const res = await publicApi.adminLogin(username, password)
    token.value = res.data.token
    userInfo.value = res.data.userInfo || { nickname: username }
    localStorage.setItem('token', token.value)
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    return res
  }

  function logout() {
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return { token, userInfo, isLoggedIn, adminLogin, logout }
})
