const express = require('express');
const router = express.Router();
const axios = require('axios');
const { success, error } = require('../utils/response');
const { authMiddleware } = require('../middleware/auth');

// 获取AI配置
function getAiConfig(db) {
  try {
    const config = db.prepare('SELECT * FROM ai_configs WHERE is_default = 1 AND status = 1').get();
    if (config) {
      return {
        api_base: config.api_base,
        api_key: config.api_key,
        model: config.model
      };
    }
  } catch (e) {
    console.log('从数据库读取AI配置失败:', e.message);
  }
  return {
    api_base: process.env.AI_API_BASE || 'https://api.minimax.chat/v1',
    api_key: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || 'abab6.5s-chat'
  };
}

// 获取场景配置
function getSceneConfig(db, sceneId) {
  if (!sceneId) return null;
  try {
    const scene = db.prepare('SELECT * FROM scenes WHERE id = ? AND status = 1').get(sceneId);
    if (scene) {
      db.prepare('UPDATE scenes SET view_count = view_count + 1 WHERE id = ?').run(sceneId);
      return scene;
    }
  } catch (e) {
    console.log('获取场景配置失败:', e.message);
  }
  return null;
}

// 获取课程配置
function getCourseConfig(db, courseId) {
  if (!courseId) return null;
  try {
    return db.prepare('SELECT * FROM courses WHERE id = ? AND status = 1').get(courseId) || null;
  } catch (e) {
    return null;
  }
}

// 语言名称映射
const langNames = {
  korean: '韩语',
  japanese: '日语',
  english: '英语',
  french: '法语',
  cantonese: '粤语'
};

// 默认系统提示
function getDefaultSystemPrompt(lang, level, aiName = '정우성', aiIntro = '阳光开朗的韩国大学生') {
  const langName = langNames[lang] || '韩语';
  const levelName = 'TOPIK ' + (level || 1);
  return '你是用户的' + langName + '口语陪练老师，名字叫' + aiName + '，' + aiIntro + '。你需要用' + langName + '和用户对话，帮助用户练习' + langName + '口语。对话要自然、有趣，结合' + levelName + '水平的词汇和语法。如果用户用中文，你先用' + langName + '回复，然后翻译成中文。请保持回复简洁，每条消息不超过50字。';
}

// 获取欢迎消息
function getWelcomeMessage(sceneConfig, courseConfig, lang, level) {
  if (sceneConfig && sceneConfig.welcome_msg) {
    return { text: sceneConfig.welcome_msg, cn: sceneConfig.welcome_cn || '你好！' };
  }
  if (courseConfig) {
    return {
      text: '안녕하세요! ' + courseConfig.name + ' 수업을 시작합니다!',
      cn: '你好！开始学习 ' + courseConfig.name + '！'
    };
  }
  const defaults = {
    korean: { text: '안녕하세요! 반가워요! 한국어로 편하게 말해보세요.', cn: '你好！很高兴认识你！请用韩语跟我说话吧。' },
    japanese: { text: 'こんにちは！一緒に日本語を練習しましょう！', cn: '你好！让我们一起练习日语吧！' },
    english: { text: 'Hi! Let\'s practice English together!', cn: '你好！让我们一起练习英语吧！' },
    french: { text: 'Bonjour! Pratiquons le français ensemble!', cn: '你好！让我们一起练习法语吧！' },
    cantonese: { text: '你好！我哋一齐學廣東話啦！', cn: '你好！我们一起学广东话吧！' }
  };
  return defaults[lang] || defaults.korean;
}

// 发送消息给AI
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { message, sceneId, courseId, lang, level } = req.body;
    if (!message) return res.json(error('消息不能为空'));
    
    const aiConfig = getAiConfig(req.db);
    const sceneConfig = getSceneConfig(req.db, sceneId);
    const courseConfig = getCourseConfig(req.db, courseId);
    
    let systemPrompt, aiName = '정우성', aiIntro = '阳光开朗的韩国大学生';
    if (sceneConfig && sceneConfig.system_prompt) {
      systemPrompt = sceneConfig.system_prompt;
      aiName = sceneConfig.ai_name || aiName;
      aiIntro = sceneConfig.ai_intro || aiIntro;
    } else {
      aiIntro = sceneConfig?.ai_intro || courseConfig?.description || aiIntro;
      aiName = sceneConfig?.ai_name || aiName;
      systemPrompt = getDefaultSystemPrompt(lang, level, aiName, aiIntro);
    }
    
    let aiResponse = '';
    try {
      const apiUrl = aiConfig.api_base.includes('minimax')
        ? aiConfig.api_base + '/text/chatcompletion_v2?GroupId=1845392974'
        : aiConfig.api_base + '/chat/completions';
      
      const requestBody = aiConfig.api_base.includes('minimax')
        ? { model: aiConfig.model || 'abab6.5s-chat', tokens_to_generate: 256, temperature: 0.8, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }] }
        : { model: aiConfig.model || 'gpt-3.5-turbo', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }], temperature: 0.8, max_tokens: 256 };
      
      const response = await axios.post(apiUrl, requestBody, { headers: { 'Authorization': 'Bearer ' + aiConfig.api_key, 'Content-Type': 'application/json' }, timeout: 30000 });
      
      if (aiConfig.api_base.includes('minimax')) {
        aiResponse = response.data.choices?.[0]?.messages?.[0]?.text || '';
      } else {
        aiResponse = response.data.choices?.[0]?.message?.content || '';
      }
      if (!aiResponse) aiResponse = getDefaultResponse(message, lang);
    } catch (aiErr) {
      console.error('AI API调用失败:', aiErr.message);
      aiResponse = getDefaultResponse(message, lang);
    }
    
    req.db.prepare('INSERT INTO chat_messages (user_id, scene_id, course_id, role, lang, level, content) VALUES (?, ?, ?, ?, ?, ?, ?)').run(req.user.id, sceneId || null, courseId || null, 'user', lang || 'korean', level || 1, message);
    req.db.prepare('INSERT INTO chat_messages (user_id, scene_id, course_id, role, lang, level, content) VALUES (?, ?, ?, ?, ?, ?, ?)').run(req.user.id, sceneId || null, courseId || null, 'assistant', lang || 'korean', level || 1, aiResponse);
    req.db.prepare('UPDATE users SET total_minutes = total_minutes + 1, today_minutes = today_minutes + 1 WHERE id = ?').run(req.user.id);
    
    res.json(success({ text: aiResponse, cn: '' }));
  } catch (err) {
    console.error('发送消息错误:', err);
    res.json(error('发送失败'));
  }
});

// 获取聊天历史
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { sceneId, courseId, page = 1, pageSize = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    
    let sql = 'SELECT * FROM chat_messages WHERE user_id = ?';
    let countSql = 'SELECT COUNT(*) as c FROM chat_messages WHERE user_id = ?';
    const params = [req.user.id];
    const countParams = [req.user.id];
    
    if (sceneId) { sql += ' AND scene_id = ?'; countSql += ' AND scene_id = ?'; params.push(sceneId); countParams.push(sceneId); }
    if (courseId) { sql += ' AND course_id = ?'; countSql += ' AND course_id = ?'; params.push(courseId); countParams.push(courseId); }
    
    sql += ' ORDER BY created_at ASC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), offset);
    
    const messages = req.db.prepare(sql).all(...params);
    const total = req.db.prepare(countSql).get(...countParams).c;
    
    res.json(success({
      list: messages.map(m => ({ id: m.id, type: m.role === 'user' ? 'send' : 'receive', text: m.content, cn: m.cn_content || '', time: m.created_at })),
      total, page: parseInt(page), pageSize: parseInt(pageSize)
    }));
  } catch (err) {
    console.error('获取聊天历史错误:', err);
    res.json(error('获取失败'));
  }
});

// 清空聊天
router.post('/clear', authMiddleware, async (req, res) => {
  try {
    const { sceneId, courseId } = req.body;
    let sql = 'DELETE FROM chat_messages WHERE user_id = ?';
    const params = [req.user.id];
    if (sceneId) { sql += ' AND scene_id = ?'; params.push(sceneId); }
    if (courseId) { sql += ' AND course_id = ?'; params.push(courseId); }
    req.db.prepare(sql).run(...params);
    res.json(success());
  } catch (err) {
    console.error('清空聊天错误:', err);
    res.json(error('清空失败'));
  }
});

// 获取场景欢迎语
router.get('/scene-config', authMiddleware, async (req, res) => {
  try {
    const sceneId = req.query.sceneId || req.query.id;
    if (!sceneId) return res.json(error('缺少场景ID'));
    
    const scene = req.db.prepare('SELECT * FROM scenes WHERE id = ? AND status = 1').get(sceneId);
    if (!scene) return res.json(error('场景不存在'));
    
    const lang = req.query.lang || scene.lang || 'korean';
    const level = parseInt(req.query.level) || 1;
    const welcome = getWelcomeMessage(scene, null, lang, level);
    
    res.json(success({
      id: scene.id,
      title: scene.title,
      aiName: scene.ai_name || '정우성',
      aiIntro: scene.ai_intro || '',
      welcome: welcome.text,
      welcomeCn: welcome.cn
    }));
  } catch (err) {
    console.error('获取场景配置错误:', err);
    res.json(error('获取失败'));
  }
});

function getDefaultResponse(message, lang) {
  const responses = {
    korean: ['그래요? 정말 INTERESTING! 더 이야기해 주세요!', '네, 맞아요! 일상적인 표현을 연습해보면 좋아요.', '재미있네요! 앞으로 어떤 표현을 배울까요?'],
    japanese: ['そうですね！一緒に練習しましょう！', 'いい響きですね！もっと話してください！']
  };
  const langResponses = responses[lang] || responses.korean;
  return langResponses[Math.floor(Math.random() * langResponses.length)];
}

module.exports = router;
