const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const Database = require('better-sqlite3');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 初始化SQLite数据库
const dbPath = path.join(__dirname, 'xiaoyu.db');
const db = new Database(dbPath);

// 启用外键约束
db.pragma('foreign_keys = ON');

// 初始化数据库表
initDatabase();

// 挂载数据库到req
app.use((req, res, next) => {
  req.db = db;
  next();
});

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 路由
const userRoutes = require('./routes/user');
const courseRoutes = require('./routes/course');
const wordRoutes = require('./routes/word');
const sceneRoutes = require('./routes/scene');
const chatRoutes = require('./routes/chat');
const vipRoutes = require('./routes/vip');
const commonRoutes = require('./routes/common');

app.use('/api/user', userRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/word', wordRoutes);
app.use('/api/scene', sceneRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/vip', vipRoutes);
app.use('/api/common', commonRoutes);

// 获取默认AI配置（公开接口，供小程序调用）
app.get('/api/ai-config', (req, res) => {
  try {
    const config = db.prepare('SELECT * FROM ai_configs WHERE is_default = 1 AND status = 1').get();
    if (config) {
      res.json({ 
        code: 200, 
        data: { 
          api_base: config.api_base, 
          api_key: config.api_key, 
          model: config.model 
        } 
      });
    } else {
      // 兜底：使用环境变量
      res.json({ 
        code: 200, 
        data: { 
          api_base: process.env.AI_API_BASE || 'https://api.minimax.chat/v1', 
          api_key: process.env.AI_API_KEY || '',
          model: process.env.AI_MODEL || 'abab6.5s-chat'
        },
        fallback: true
      });
    }
  } catch (e) {
    res.json({ code: 500, msg: '获取失败' });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ code: 200, msg: 'OK' });
});

// 根路径
app.get('/', (req, res) => {
  res.json({ 
    name: '小语笔记API', 
    version: '1.0.0',
    status: 'running'
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ code: 500, msg: '服务器错误' });
});

// 数据库初始化函数
function initDatabase() {
  // 用户表
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      openid TEXT UNIQUE NOT NULL,
      unionid TEXT,
      nickname TEXT DEFAULT '',
      avatar TEXT DEFAULT '',
      gender INTEGER DEFAULT 0,
      phone TEXT,
      lang TEXT DEFAULT 'korean',
      level INTEGER DEFAULT 1,
      is_vip INTEGER DEFAULT 0,
      vip_expire_time TEXT,
      total_minutes INTEGER DEFAULT 0,
      today_minutes INTEGER DEFAULT 0,
      today_date TEXT,
      words_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // 会员套餐表
  db.exec(`
    CREATE TABLE IF NOT EXISTS vip_packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      months INTEGER NOT NULL,
      price REAL NOT NULL,
      original_price REAL,
      tag TEXT,
      benefit TEXT,
      sort INTEGER DEFAULT 0,
      status INTEGER DEFAULT 1
    )
  `);

  // 会员订单表
  db.exec(`
    CREATE TABLE IF NOT EXISTS vip_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_no TEXT UNIQUE NOT NULL,
      user_id INTEGER,
      package_id INTEGER,
      price REAL NOT NULL,
      status INTEGER DEFAULT 0,
      pay_time TEXT,
      pay_type TEXT,
      transaction_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // 课程表
  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      day INTEGER,
      is_free INTEGER DEFAULT 0,
      lang TEXT DEFAULT 'korean',
      sort INTEGER DEFAULT 0,
      status INTEGER DEFAULT 1
    )
  `);

  // 学习进度表
  db.exec(`
    CREATE TABLE IF NOT EXISTS course_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      status INTEGER DEFAULT 0,
      learn_times INTEGER DEFAULT 0,
      last_learn_time TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, course_id)
    )
  `);

  // 单词书表
  db.exec(`
    CREATE TABLE IF NOT EXISTS word_books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      cover TEXT,
      word_count INTEGER DEFAULT 0,
      lang TEXT DEFAULT 'korean',
      icon TEXT DEFAULT 'book',
      sort INTEGER DEFAULT 0,
      status INTEGER DEFAULT 1
    )
  `);

  // 单词表
  db.exec(`
    CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      word TEXT NOT NULL,
      pronunciation TEXT,
      meaning TEXT NOT NULL,
      example TEXT,
      translation TEXT
    )
  `);

  // 场景表
  db.exec(`
    CREATE TABLE IF NOT EXISTS scenes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      cover TEXT,
      category TEXT,
      is_hot INTEGER DEFAULT 0,
      view_count INTEGER DEFAULT 0,
      favor_count INTEGER DEFAULT 0,
      lang TEXT DEFAULT 'korean',
      sort INTEGER DEFAULT 0,
      status INTEGER DEFAULT 1
    )
  `);

  // 聊天记录表
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      scene_id INTEGER,
      course_id INTEGER,
      role TEXT NOT NULL,
      lang TEXT DEFAULT 'korean',
      level INTEGER DEFAULT 1,
      content TEXT NOT NULL,
      cn_content TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // 收藏表
  db.exec(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      target_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, type, target_id)
    )
  `);

  // 初始化套餐数据
  const pkgCount = db.prepare('SELECT COUNT(*) as c FROM vip_packages').get();
  if (pkgCount.c === 0) {
    const insertPkg = db.prepare('INSERT INTO vip_packages (name, months, price, tag, benefit, sort) VALUES (?, ?, ?, ?, ?, ?)');
    insertPkg.run('三个月', 3, 89, '早鸟价', '不限时长', 1);
    insertPkg.run('一年', 12, 159, '加送1个月', '不限时长', 2);
    insertPkg.run('永久', 999, 278, '限时特惠', '不限时长', 3);
  }

  // 初始化课程数据
  const courseCount = db.prepare('SELECT COUNT(*) as c FROM courses').get();
  if (courseCount.c === 0) {
    const insertCourse = db.prepare('INSERT INTO courses (unit, name, description, day, is_free, lang, sort) VALUES (?, ?, ?, ?, ?, ?, ?)');
    insertCourse.run('Unit 1 问候与介绍', '嗨，新朋友', '与新朋友进行简单的自我介绍', 1, 1, 'korean', 1);
    insertCourse.run('Unit 1 问候与介绍', '自我介绍', '学习如何用日语进行简单的自我介绍', 2, 0, 'korean', 2);
    insertCourse.run('Unit 1 问候与介绍', '我的好朋友', '介绍你的好朋友并谈论你们的友谊', 3, 0, 'korean', 3);
    insertCourse.run('Unit 2 颜色与形状', '身边的颜色', '学习描述和识别身边的颜色', 4, 0, 'korean', 4);
    insertCourse.run('Unit 2 颜色与形状', '数数', '学习基本的数数技巧，掌握从1到100', 5, 0, 'korean', 5);
  }

  // 初始化单词书数据
  const bookCount = db.prepare('SELECT COUNT(*) as c FROM word_books').get();
  if (bookCount.c === 0) {
    const insertBook = db.prepare('INSERT INTO word_books (name, description, word_count, lang, icon, sort) VALUES (?, ?, ?, ?, ?, ?)');
    insertBook.run('主题单词库', '30+日常生活实用主题', 1500, 'korean', 'book', 1);
    insertBook.run('维他命韩语', '宋雨琦推荐的韩语词书！', 800, 'korean', 'star', 2);
    insertBook.run('金龙一乱序', '包含初级、中高级的Topik高频词', 2000, 'korean', 'fire', 3);
    insertBook.run('延世韩国语', '旧版《延世韩国语》1-6册单词', 3000, 'korean', 'book', 4);
    insertBook.run('topik语料库', '大作文语料库', 500, 'korean', 'file', 5);
  }

  // 初始化场景数据
  const sceneCount = db.prepare('SELECT COUNT(*) as c FROM scenes').get();
  if (sceneCount.c === 0) {
    const insertScene = db.prepare('INSERT INTO scenes (title, description, category, is_hot, view_count, lang, sort) VALUES (?, ?, ?, ?, ?, ?, ?)');
    insertScene.run('办理登机', '在机场办理登机手续', 'travel', 1, 1500, 'korean', 1);
    insertScene.run('商场购物', '如何在商场内顺利购物并与店员交流', 'shopping', 1, 207, 'korean', 2);
    insertScene.run('免税便利店', '在免税便利店购物并了解相关政策', 'shopping', 1, 81, 'korean', 3);
    insertScene.run('研究生面试', '准备并顺利通过研究生的面试', 'academic', 1, 71, 'korean', 4);
    insertScene.run('医院挂号流程', '了解医院的挂号流程并顺利', 'medical', 0, 52, 'korean', 5);
    insertScene.run('七夕情人节', '庆祝七夕情人节，表达爱意', 'romance', 0, 38, 'korean', 6);
  }

  console.log('数据库初始化完成');
}

// 启动服务
app.listen(PORT, '0.0.0.0', () => {
  console.log(`小语笔记API服务已启动，端口: ${PORT}`);
});

module.exports = app;
