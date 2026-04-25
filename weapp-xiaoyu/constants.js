// 常量配置
module.exports = {
  // 事件名称
  EVENTS: {
    // 用户信息更新
    USER_UPDATE: 'userUpdate',
    // 登录成功
    LOGIN_SUCCESS: 'loginSuccess',
    // 退出登录
    LOGOUT: 'logout',
    // 会员状态更新
    VIP_UPDATE: 'vipUpdate',
    // 切换语言
    LANG_CHANGE: 'langChange',
    // 学习数据更新
    STATS_UPDATE: 'statsUpdate'
  },
  
  // 存储键名
  STORAGE_KEYS: {
    TOKEN: 'token',
    OPENID: 'openid',
    USER_INFO: 'userInfo',
    LANG: 'currentLang',
    LEVEL: 'currentLevel',
    CHAT_HISTORY: 'chatHistory',
    SETTINGS: 'settings'
  },
  
  // 页面路径
  PAGES: {
    INDEX: '/pages/index/index',
    COURSE: '/pages/course/course',
    WORD: '/pages/word/word',
    MINE: '/pages/mine/mine',
    LANGUAGE: '/pages/language/language',
    CHAT: '/pages/chat/chat',
    MEMBER: '/pages/member/member'
  },
  
  // TabBar索引
  TAB_BAR_INDEX: {
    INDEX: 0,
    COURSE: 1,
    WORD: 2,
    MINE: 3
  },
  
  // 语言代码
  LANG_CODES: {
    KR: 'korean',   // 韩语
    JP: 'japanese', // 日语
    EN: 'english',  // 英语
    FR: 'french',   // 法语
    CT: 'cantonese' // 粤语
  },
  
  // TOPIK等级名称
  TOPIK_NAMES: {
    1: 'TOPIK 1',
    2: 'TOPIK 2',
    3: 'TOPIK 3',
    4: 'TOPIK 4',
    5: 'TOPIK 5',
    6: 'TOPIK 6'
  },
  
  // 会员等级
  VIP_LEVELS: {
    NONE: 0,
    THREE_MONTH: 1,
    ONE_YEAR: 2,
    FOREVER: 3
  },
  
  // 错误码
  ERROR_CODES: {
    SUCCESS: 200,
    PARAM_ERROR: 400,
    UNAUTH: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500
  }
};
