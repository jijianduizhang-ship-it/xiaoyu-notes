<template>
  <div>
    <!-- VIP 介绍卡片 -->
    <div class="vip-hero">
      <div class="vip-icon">👑</div>
      <div class="vip-title">小语笔记会员</div>
      <div class="vip-desc">解锁全部课程、无限单词、场景对话</div>
    </div>

    <!-- 套餐列表 -->
    <div class="packages">
      <div
        v-for="pkg in user.vipPackages"
        :key="pkg.id"
        class="package-item"
        :class="{ recommended: pkg.tag }"
        @click="selectPackage(pkg)"
      >
        <div class="pkg-header">
          <span class="pkg-name">{{ pkg.name }}</span>
          <span class="tag tag-vip" v-if="pkg.tag">{{ pkg.tag }}</span>
        </div>
        <div class="pkg-benefit">{{ pkg.benefit }}</div>
        <div class="pkg-price">
          <span class="price">¥{{ pkg.price }}</span>
          <span class="original" v-if="pkg.original_price">¥{{ pkg.original_price }}</span>
        </div>
      </div>
    </div>

    <!-- 会员权益 -->
    <div class="benefits">
      <div class="section-title">会员权益</div>
      <div class="benefit-list">
        <div class="benefit-item">
          <span class="benefit-icon">✅</span>
          <span>解锁全部付费课程</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">✅</span>
          <span>无限单词书学习</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">✅</span>
          <span>全部场景对话练习</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">✅</span>
          <span>AI 口语陪练不限次</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">✅</span>
          <span>专属学习数据报告</span>
        </div>
      </div>
    </div>

    <!-- 提示 -->
    <div class="notice">
      <p>会员服务为虚拟商品，支付成功后不支持退款</p>
      <p>如有疑问请联系客服</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '../stores/user'

const user = useUserStore()

function selectPackage(pkg) {
  alert(`您选择了：${pkg.name}，¥${pkg.price}\n（支付功能待接入）`)
}

onMounted(async () => {
  await user.fetchVipPackages()
})
</script>

<style scoped>
.vip-hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px 20px;
  text-align: center;
  color: white;
  margin-bottom: 20px;
}

.vip-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.vip-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
}

.vip-desc {
  font-size: 14px;
  opacity: 0.85;
}

.packages {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}

.package-item {
  background: white;
  border-radius: 12px;
  padding: 16px 18px;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
}

.package-item:active {
  transform: scale(0.98);
}

.package-item.recommended {
  border-color: #667eea;
  position: relative;
}

.pkg-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.pkg-name {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.pkg-benefit {
  font-size: 13px;
  color: #a0aec0;
  margin-bottom: 8px;
}

.pkg-price {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.price {
  font-size: 22px;
  font-weight: 700;
  color: #667eea;
}

.original {
  font-size: 13px;
  color: #cbd5e0;
  text-decoration: line-through;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 12px;
}

.benefit-list {
  background: white;
  border-radius: 12px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #4a5568;
}

.benefit-icon {
  font-size: 16px;
}

.notice {
  text-align: center;
  font-size: 12px;
  color: #cbd5e0;
  line-height: 1.8;
  padding-bottom: 20px;
}
</style>
