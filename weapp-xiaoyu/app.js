// 小语笔记 - app.js
const { wxLogin, getUserInfo } = require('./utils/auth.js');
const { EVENTS, STORAGE_KEYS } = require('./utils/constants.js');

App({
  onLaunch() {
    console.log('小语笔记小程序启动');
    
    // 初始化应用
    this.initApp();
  },
  
  // 全局数据
  globalData: {
    userInfo: null,
    token: null,
    isLogin: false,
    currentLang: 'korean',
    currentLevel: 1,
    isVip: false,
    vipExpireTime: null
  },
  
  // 初始化
  async initApp() {
    // 检查登录状态
    const token = wx.getStorageSync(STORAGE_KEYS.TOKEN);
    const userInfo = wx.getStorageSync(STORAGE_KEYS.USER_INFO);
    
    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
      this.globalData.isLogin = true;
      
      // 获取最新用户信息
      this.refreshUserInfo();
    } else {
      // 无登录状态，先静默登录
      try {
        await wxLogin();
        this.globalData.isLogin = true;
      } catch (e) {
        console.error('静默登录失败', e);
      }
    }
    
    // 加载语言和等级设置
    const lang = wx.getStorageSync(STORAGE_KEYS.LANG);
    const level = wx.getStorageSync(STORAGE_KEYS.LEVEL);
    
    if (lang) this.globalData.currentLang = lang;
    if (level) this.globalData.currentLevel = level;
  },
  
  // 刷新用户信息
  async refreshUserInfo() {
    const { get } = require('./utils/request.js');
    const { user } = require('./utils/api.js');
    
    try {
      const userInfo = await get(user.info);
      this.globalData.userInfo = userInfo;
      this.globalData.isVip = userInfo.isVip || false;
      this.globalData.vipExpireTime = userInfo.vipExpireTime;
      wx.setStorageSync(STORAGE_KEYS.USER_INFO, userInfo);
      
      // 通知页面更新
      this.triggerEvent(EVENTS.USER_UPDATE, userInfo);
    } catch (e) {
      console.error('刷新用户信息失败', e);
    }
  },
  
  // 触发事件
  triggerEvent(eventName, data) {
    const pages = getCurrentPages();
    pages.forEach(page => {
      if (page.onEventUpdate) {
        page.onEventUpdate(eventName, data);
      }
    });
  },
  
  // 登录成功回调
  onLoginSuccess(userInfo) {
    this.globalData.isLogin = true;
    this.globalData.userInfo = userInfo;
    this.globalData.token = wx.getStorageSync(STORAGE_KEYS.TOKEN);
    
    // 通知更新
    this.triggerEvent(EVENTS.LOGIN_SUCCESS, userInfo);
  },
  
  // 退出登录
  onLogout() {
    this.globalData.isLogin = false;
    this.globalData.userInfo = null;
    this.globalData.token = null;
    this.globalData.isVip = false;
    this.globalData.vipExpireTime = null;
    
    // 通知更新
    this.triggerEvent(EVENTS.LOGOUT);
  },
  
  // 更新全局语言设置
  setCurrentLang(lang) {
    this.globalData.currentLang = lang;
    wx.setStorageSync(STORAGE_KEYS.LANG, lang);
    this.triggerEvent(EVENTS.LANG_CHANGE, lang);
  },
  
  // 更新全局等级设置
  setCurrentLevel(level) {
    this.globalData.currentLevel = level;
    wx.setStorageSync(STORAGE_KEYS.LEVEL, level);
  }
});
