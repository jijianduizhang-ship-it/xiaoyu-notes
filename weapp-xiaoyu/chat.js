// AI对话页面
const { post, get } = require('../../utils/request.js');
const { chat, scene } = require('../../utils/api.js');
const { STORAGE_KEYS, EVENTS } = require('../../utils/constants.js');
const { formatDate } = require('../../utils/common.js');

Page({
  data: {
    // 场景信息
    sceneTitle: 'AI口语陪练',
    sceneId: null,
    courseId: null,
    
    // AI角色信息
    aiName: 'AI',
    aiIntro: '',
    
    // 用户信息
    userInfo: null,
    isLogin: false,
    
    // 剩余时间
    remainMinutes: 3,
    isVip: false,
    
    // 聊天记录
    messages: [],
    
    // 欢迎提示
    showWelcome: true,
    welcomeTip: '选择一个场景，开始和AI练习对话吧！',
    
    // 输入状态
    inputValue: '',
    sending: false,
    showFuncBar: false,
    
    // 底部区域
    bottomSafeArea: 0,
    keyboardHeight: 0,
    
    // 滚动
    scrollTop: 0,
    scrollIntoView: '',
    
    // 加载状态
    loading: false,
    loadingMore: false,
    hasMore: true,
    page: 1
  },
  
  onLoad(options) {
    // 获取参数
    if (options.sceneId) {
      const sceneId = parseInt(options.sceneId);
      if (sceneId && !isNaN(sceneId)) {
        this.setData({ sceneId });
        this.loadSceneConfig(sceneId);
      }
    }
    
    if (options.courseId) {
      const courseId = parseInt(options.courseId);
      if (courseId && !isNaN(courseId)) {
        this.setData({ 
          courseId,
          sceneTitle: decodeURIComponent(options.title || '课程对话')
        });
      }
    }
    
    // 初始化聊天
    this.initChat();
    
    // 获取系统信息
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ 
      bottomSafeArea: sysInfo.safeArea.bottom,
      keyboardHeight: sysInfo.safeArea.bottom
    });
    
    // 初始化键盘监听
    this.initKeyboardListener();
    
    // 监听事件
    this.onEventUpdate = this.handleEventUpdate.bind(this);
  },
  
  onShow() {
    const app = getApp();
    const userInfo = app.globalData.userInfo;
    this.setData({
      userInfo,
      isLogin: app.globalData.isLogin || false,
      isVip: app.globalData.isVip || false,
      remainMinutes: app.globalData.isVip ? 999 : 3
    });
  },
  
  onUnload() {
    this.saveChatHistoryLocal();
    if (this.keyboardListener) this.keyboardListener.close();
  },
  
  // 加载场景配置
  async loadSceneConfig(sceneId) {
    const validSceneId = parseInt(sceneId);
    if (!validSceneId || isNaN(validSceneId)) return;
    
    try {
      const app = getApp();
      const data = await get('/api/chat/scene-config', {
        sceneId: validSceneId,
        lang: app.globalData.currentLang,
        level: app.globalData.currentLevel
      }, { showLoading: false, showError: false });
      
      if (data && data.title) {
        this.setData({
          sceneTitle: data.title || this.data.sceneTitle,
          aiName: data.aiName || 'AI',
          aiIntro: data.aiIntro || '',
          welcomeTip: data.welcomeCn || '你好！'
        });
      }
    } catch (e) {
      console.log('加载场景配置失败（静默）', e);
    }
  },
  
  // 初始化键盘监听
  initKeyboardListener() {
    this.keyboardListener = wx.onKeyboardHeightChange(res => {
      this.setData({
        keyboardHeight: res.height > 0 ? res.height : this.data.bottomSafeArea
      });
    });
  },
  
  // 初始化聊天
  async initChat() {
    this.setData({ loading: true, page: 1, hasMore: true });
    
    try {
      const history = await get(chat.history, {
        sceneId: this.data.sceneId,
        courseId: this.data.courseId,
        page: 1,
        pageSize: 50
      }, { showLoading: false, showError: false });
      
      // 如果是未登录错误，不显示错误，直接加载欢迎消息
      if (history === null) {
        this.loadWelcomeMessage();
      } else if (history.list && history.list.length > 0) {
        this.setData({ 
          messages: history.list,
          showWelcome: false,
          hasMore: history.total > history.list.length
        });
      } else {
        this.loadWelcomeMessage();
      }
    } catch (e) {
      console.log('加载历史失败（静默）', e);
      this.loadWelcomeMessage();
    }
    
    this.setData({ loading: false });
    this.scrollToBottom();
  },
  
  // 加载欢迎消息
  loadWelcomeMessage() {
    const app = getApp();
    const lang = app.globalData.currentLang || 'korean';
    const level = app.globalData.currentLevel || 1;
    
    const welcomes = {
      korean: { text: '안녕하세요! 반가워요! 한국어로 편하게 말해보세요.', cn: '你好！很高兴认识你！请用韩语跟我说话吧。' },
      japanese: { text: 'こんにちは！一緒に日本語を練習しましょう！', cn: '你好！让我们一起练习日语吧！' },
      english: { text: 'Hi! Let\'s practice English together!', cn: '你好！让我们一起练习英语吧！' },
      french: { text: 'Bonjour! Pratiquons le français ensemble!', cn: '你好！让我们一起练习法语吧！' },
      cantonese: { text: '你好！我哋一齐學廣東話啦！', cn: '你好！我们一起学广东话吧！' }
    };
    
    const welcome = welcomes[lang] || welcomes.korean;
    
    // 如果有自定义欢迎提示，使用它
    if (this.data.welcomeTip && this.data.welcomeTip !== '选择一个场景，开始和AI练习对话吧！') {
      welcome.cn = this.data.welcomeTip;
    }
    
    // 如果有AI名字，设置欢迎消息
    const aiName = this.data.aiName || 'AI';
    
    this.setData({
      showWelcome: true,
      messages: [{
        id: Date.now(),
        type: 'receive',
        text: welcome.text,
        cn: welcome.cn,
        time: formatDate(new Date())
      }]
    });
  },
  
  // 返回
  onBack() {
    wx.navigateBack();
  },
  
  // 更多操作
  onMore() {
    wx.showActionSheet({
      itemList: ['清空对话', '分享给好友'],
      success: (res) => {
        if (res.tapIndex === 0) this.onClearChat();
        else if (res.tapIndex === 1) this.onShareAppMessage();
      }
    });
  },
  
  // 切换功能栏
  toggleFuncBar() {
    this.setData({ showFuncBar: !this.data.showFuncBar });
  },
  
  // 输入事件
  onInput(e) {
    this.setData({ inputValue: e.detail.value });
  },
  
  // 输入框获焦
  onInputFocus() {
    this.setData({ showFuncBar: false });
  },
  
  // 输入框失焦
  onInputBlur() {
    setTimeout(() => this.setData({ showFuncBar: false }), 200);
  },
  
  // 发送消息
  async onSend() {
    const { inputValue, sending, isLogin } = this.data;
    
    // 检查输入
    if (!inputValue || !inputValue.trim()) {
      wx.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }
    
    // 检查登录状态
    if (!isLogin) {
      wx.showModal({
        title: '提示',
        content: '登录后可以使用AI对话功能',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({ url: '/pages/mine/mine' });
          }
        }
      });
      return;
    }
    
    if (sending) return;
    
    const text = inputValue.trim();
    const tempId = Date.now();
    
    // 清空输入框，更新UI
    this.setData({ 
      sending: true, 
      inputValue: '',
      showWelcome: false 
    });
    
    // 添加用户消息到列表
    const userMsg = { 
      id: tempId, 
      type: 'send', 
      text, 
      time: formatDate(new Date()) 
    };
    
    this.setData(prev => ({
      messages: [...prev.messages, userMsg]
    }));
    
    this.scrollToBottom();
    
    try {
      const app = getApp();
      const response = await post(chat.send, {
        message: text,
        sceneId: this.data.sceneId,
        courseId: this.data.courseId,
        lang: app.globalData.currentLang || 'korean',
        level: app.globalData.currentLevel || 1
      }, { showLoading: false, showError: false });
      
      // 添加AI回复
      const aiMsg = {
        id: Date.now(),
        type: 'receive',
        text: response.text || '抱歉，我没有理解您的话，请再说一次。',
        cn: response.cn || '',
        time: formatDate(new Date())
      };
      
      this.setData(prev => ({
        messages: [...prev.messages, aiMsg],
        sending: false,
        remainMinutes: this.data.isVip ? 999 : Math.max(0, this.data.remainMinutes - 1)
      }));
      
      this.scrollToBottom('msg-' + aiMsg.id);
      
    } catch (e) {
      console.error('发送失败', e);
      
      // 标记消息发送失败
      this.setData(prev => ({
        messages: prev.messages.map(m => 
          m.id === tempId ? { ...m, failed: true } : m
        ),
        sending: false
      }));
      
      wx.showToast({ title: e.msg || '发送失败，请重试', icon: 'none' });
    }
  },
  
  // 重发消息
  onRetry(e) {
    const { id, text } = e.currentTarget.dataset;
    if (!text) return;
    
    // 移除失败消息
    this.setData(prev => ({
      messages: prev.messages.filter(m => m.id !== id)
    }));
    
    // 重新设置输入值并发送
    this.setData({ inputValue: text });
    this.onSend();
  },
  
  // 滚动到底部
  scrollToBottom(viewId) {
    setTimeout(() => {
      if (viewId) {
        this.setData({ scrollIntoView: viewId });
      } else {
        this.setData({ scrollTop: Date.now() });
      }
    }, 100);
  },
  
  // 加载更多历史
  async onScrollUpper() {
    if (this.data.loadingMore || !this.data.hasMore) return;
    
    this.setData({ loadingMore: true });
    
    try {
      const nextPage = this.data.page + 1;
      const history = await get(chat.history, {
        sceneId: this.data.sceneId,
        courseId: this.data.courseId,
        page: nextPage,
        pageSize: 20
      }, { showLoading: false, showError: false });
      
      if (history && history.list && history.list.length > 0) {
        this.setData(prev => ({
          messages: [...history.list, ...prev.messages],
          page: nextPage,
          hasMore: history.total > history.list.length * nextPage,
          loadingMore: false
        }));
      } else {
        this.setData({ hasMore: false, loadingMore: false });
      }
    } catch (e) {
      console.error('加载更多失败', e);
      this.setData({ loadingMore: false });
    }
  },
  
  // 保存本地历史
  saveChatHistoryLocal() {
    const { messages, sceneId, courseId } = this.data;
    if (messages.length <= 1) return;
    const key = `${STORAGE_KEYS.CHAT_HISTORY}_${sceneId || 'general'}_${courseId || '0'}`;
    wx.setStorageSync(key, messages.slice(-50));
  },
  
  // 清空对话
  onClearChat() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空当前对话吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ messages: [], page: 1, hasMore: true, showWelcome: true });
          this.loadWelcomeMessage();
          
          // 清空服务器记录
          if (this.data.isLogin) {
            post(chat.clear, { 
              sceneId: this.data.sceneId, 
              courseId: this.data.courseId 
            }, { showLoading: false, showError: false });
          }
          
          // 清空本地记录
          const key = `${STORAGE_KEYS.CHAT_HISTORY}_${this.data.sceneId || 'general'}_${this.data.courseId || '0'}`;
          wx.removeStorageSync(key);
        }
      }
    });
  },
  
  // 语音输入（暂未实现）
  onVoiceInput() {
    wx.showToast({ title: '语音功能开发中', icon: 'none' });
  },
  
  // 事件处理
  handleEventUpdate(eventName, data) {
    if (eventName === EVENTS.VIP_UPDATE) {
      this.setData({ isVip: data.isVip, remainMinutes: data.isVip ? 999 : 3 });
    } else if (eventName === EVENTS.USER_UPDATE) {
      this.setData({ userInfo: data, isLogin: true });
    } else if (eventName === EVENTS.LOGOUT) {
      this.setData({ userInfo: null, isLogin: false, isVip: false });
    }
  },
  
  // 分享
  onShareAppMessage() {
    return {
      title: `小语笔记 - ${this.data.sceneTitle}`,
      path: `/pages/chat/chat?sceneId=${this.data.sceneId}`
    };
  }
});
