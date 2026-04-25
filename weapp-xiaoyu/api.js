// API 接口配置
const { apiBase } = require('../siteinfo.js');

module.exports = {
  // 基础地址
  baseUrl: apiBase,
  
  // 用户相关
  user: {
    // 微信登录
    login: `${apiBase}/api/user/login`,
    // 获取用户信息
    info: `${apiBase}/api/user/info`,
    // 更新用户信息
    update: `${apiBase}/api/user/update`,
    // 检查会员状态
    vipStatus: `${apiBase}/api/user/vip`
  },
  
  // 课程相关
  course: {
    // 课程列表
    list: `${apiBase}/api/course/list`,
    // 课程详情
    detail: `${apiBase}/api/course/detail`,
    // 学习进度
    progress: `${apiBase}/api/course/progress`,
    // 保存学习进度
    saveProgress: `${apiBase}/api/course/save-progress`
  },
  
  // 单词相关
  word: {
    // 单词书列表
    books: `${apiBase}/api/word/books`,
    // 单词列表
    list: `${apiBase}/api/word/list`,
    // 收藏单词
    favor: `${apiBase}/api/word/favor`,
    // 单词本
    favorites: `${apiBase}/api/word/favorites`
  },
  
  // 场景相关
  scene: {
    // 场景列表
    list: `${apiBase}/api/scene/list`,
    // 场景详情
    detail: `${apiBase}/api/scene/detail`,
    // 收藏场景
    favor: `${apiBase}/api/scene/favor`,
    // 我的收藏
    favorites: `${apiBase}/api/scene/favorites`
  },
  
  // AI对话
  chat: {
    // 发送消息
    send: `${apiBase}/api/chat/send`,
    // 对话历史
    history: `${apiBase}/api/chat/history`,
    // 清空对话
    clear: `${apiBase}/api/chat/clear`
  },
  
  // 会员相关
  vip: {
    // 会员套餐
    packages: `${apiBase}/api/vip/packages`,
    // 创建订单
    createOrder: `${apiBase}/api/vip/create-order`,
    // 支付回调
    notify: `${apiBase}/api/vip/notify`,
    // 我的会员
    myVip: `${apiBase}/api/vip/my`
  },
  
  // 通用
  common: {
    // 获取学习数据统计
    stats: `${apiBase}/api/common/stats`,
    // 反馈建议
    feedback: `${apiBase}/api/common/feedback`
  },
  
  // AI配置（动态获取）
  aiConfig: `${apiBase}/api/ai-config`
};
