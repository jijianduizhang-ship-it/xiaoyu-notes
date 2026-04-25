// 小程序 siteinfo 配置
// 请根据实际部署情况修改
module.exports = {
  name: '小语笔记',
  version: '1.0.0',
  // 后端API地址
  apiBase: 'https://language.imoons.cn',
  // 后端API地址 - 生产环境（切换时请修改）
  // apiBase: 'https://api.imoons.cn',
  
  // 小程序appid
  appid: 'wx4db11b7d5f57ae27',
  
  // 是否开启调试
  debug: true,
  
  // AI模型配置
  ai: {
    // 默认语言
    defaultLang: 'korean',
    // 支持的语言
    langs: ['korean', 'japanese', 'english', 'french', 'cantonese'],
    // 语言名称映射
    langNames: {
      korean: '韩语',
      japanese: '日语',
      english: '英语',
      french: '法语',
      cantonese: '粤语'
    },
    // TOPIK等级
    topikLevels: [1, 2, 3, 4, 5, 6]
  },
  
  // 学习场景配置
  scenes: [
    { id: 1, title: '办理登机', desc: '在机场办理登机手续', hot: true },
    { id: 2, title: '商场购物', desc: '如何在商场内顺利购物并与店员交流', hot: true },
    { id: 3, title: '免税便利店', desc: '在免税便利店购物并了解相关政策', hot: true },
    { id: 4, title: '研究生面试', desc: '准备并顺利通过研究生的面试', hot: true },
    { id: 5, title: '医院挂号流程', desc: '了解医院的挂号流程并顺利', hot: false },
    { id: 6, title: '七夕情人节', desc: '庆祝七夕情人节，表达爱意', hot: false }
  ],
  
  // 会员套餐
  vipPackages: [
    { id: 1, name: '三个月', price: 89, monthPrice: 29.67, benefit: '不限时长', tag: '早鸟价' },
    { id: 2, name: '一年', price: 159, monthPrice: 12.08, benefit: '不限时长', tag: '加送1个月' },
    { id: 3, name: '永久', price: 278, monthPrice: 598, benefit: '不限时长', tag: '限时特惠' }
  ]
};
