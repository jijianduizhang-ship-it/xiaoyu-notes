// 单词页面
const { get } = require('../../utils/request.js');
const { word } = require('../../utils/api.js');

Page({
  data: {
    // 单词书列表
    wordList: [],
    
    // 当前选中
    currentBookId: null,
    
    // 加载状态
    loading: true,
    
    // 搜索关键词
    searchKey: ''
  },
  
  onLoad() {
    this.loadWordBooks();
  },
  
  onPullDownRefresh() {
    this.loadWordBooks().finally(() => {
      wx.stopPullDownRefresh();
    });
  },
  
  // 加载单词书列表
  async loadWordBooks() {
    this.setData({ loading: true });
    
    try {
      const data = await get(word.books);
      
      this.setData({
        wordList: data.list || this.getDefaultWordList(),
        loading: false
      });
    } catch (e) {
      // 使用默认数据
      this.setData({
        wordList: this.getDefaultWordList(),
        loading: false
      });
    }
  },
  
  // 默认单词书数据
  getDefaultWordList() {
    return [
      { id: 1, name: '主题单词库', desc: '30+日常生活实用主题', count: 1500, icon: 'book' },
      { id: 2, name: '维他命韩语', desc: '宋雨琦推荐的韩语词书！', count: 800, icon: 'star' },
      { id: 3, name: '金龙一乱序', desc: '包含初级、中高级的Topik高频词', count: 2000, icon: 'fire' },
      { id: 4, name: '延世韩国语', desc: '旧版《延世韩国语》1-6册单词', count: 3000, icon: 'book' },
      { id: 5, name: 'topik语料库', desc: '大作文语料库', count: 500, icon: 'file' }
    ];
  },
  
  // 点击单词书
  onBookTap(e) {
    const { id } = e.currentTarget.dataset;
    const book = this.data.wordList.find(item => item.id === id);
    
    if (!book) return;
    
    // 保存当前选中的书
    this.setData({ currentBookId: id });
    
    // 暂时显示功能开发中，后续可以扩展
    wx.showToast({ 
      title: `${book.name} 功能开发中`, 
      icon: 'none',
      duration: 2000
    });
  },
  
  // 搜索
  onSearch(e) {
    const key = e.detail.value;
    this.setData({ searchKey: key });
    
    if (key) {
      wx.showToast({ title: '搜索功能开发中', icon: 'none' });
    }
  },
  
  // 收藏单词书
  onFavorBook(e) {
    const { id } = e.currentTarget.dataset;
    wx.showToast({ title: '收藏功能开发中', icon: 'none' });
  },
  
  // 分享
  onShareAppMessage() {
    return {
      title: '小语笔记 - 单词学习',
      path: '/pages/word/word'
    };
  }
});
