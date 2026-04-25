const express = require('express');
const router = express.Router();
const { success, error } = require('../utils/response');
const { authMiddleware } = require('../middleware/auth');

// 获取课程列表
router.get('/list', async (req, res) => {
  try {
    const { lang } = req.query;
    
    let sql = 'SELECT * FROM courses WHERE status = 1';
    
    if (lang) {
      sql += ' AND lang = ?';
    }
    
    sql += ' ORDER BY sort ASC';
    
    const courses = lang 
      ? req.db.prepare(sql).all(lang)
      : req.db.prepare(sql).all();
    
    // 按单元分组
    const units = {};
    courses.forEach(course => {
      if (!units[course.unit]) {
        units[course.unit] = [];
      }
      units[course.unit].push({
        id: course.id,
        name: course.name,
        desc: course.description,
        day: course.day,
        free: course.is_free == 1
      });
    });
    
    res.json(success({
      list: courses.map(c => ({
        id: c.id,
        name: c.name,
        desc: c.description,
        day: c.day,
        free: c.is_free == 1
      }))
    }));
    
  } catch (err) {
    console.error('获取课程列表错误:', err);
    res.json(error('获取失败'));
  }
});

// 获取课程详情
router.get('/detail', async (req, res) => {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.json(error('缺少课程ID'));
    }
    
    const course = req.db.prepare('SELECT * FROM courses WHERE id = ? AND status = 1').get(id);
    
    if (!course) {
      return res.json(error('课程不存在'));
    }
    
    res.json(success({
      id: course.id,
      unit: course.unit,
      name: course.name,
      description: course.description,
      day: course.day,
      isFree: course.is_free == 1,
      lang: course.lang
    }));
    
  } catch (err) {
    console.error('获取课程详情错误:', err);
    res.json(error('获取失败'));
  }
});

// 获取学习进度
router.get('/progress', authMiddleware, async (req, res) => {
  try {
    const progress = req.db.prepare(
      'SELECT * FROM course_progress WHERE user_id = ?'
    ).all(req.user.id);
    
    res.json(success({
      completedIds: progress.map(p => p.course_id)
    }));
    
  } catch (err) {
    console.error('获取学习进度错误:', err);
    res.json(error('获取失败'));
  }
});

// 保存学习进度
router.post('/save-progress', authMiddleware, async (req, res) => {
  try {
    const { courseId, status } = req.body;
    
    if (!courseId) {
      return res.json(error('缺少课程ID'));
    }
    
    // upsert
    const existing = req.db.prepare(
      'SELECT * FROM course_progress WHERE user_id = ? AND course_id = ?'
    ).get(req.user.id, courseId);
    
    if (existing) {
      req.db.prepare(
        `UPDATE course_progress SET status = ?, learn_times = learn_times + 1, last_learn_time = datetime('now') WHERE user_id = ? AND course_id = ?`
      ).run(status || 1, req.user.id, courseId);
    } else {
      req.db.prepare(
        `INSERT INTO course_progress (user_id, course_id, status, learn_times, last_learn_time) VALUES (?, ?, ?, 1, datetime('now'))`
      ).run(req.user.id, courseId, status || 1);
    }
    
    res.json(success());
    
  } catch (err) {
    console.error('保存学习进度错误:', err);
    res.json(error('保存失败'));
  }
});

module.exports = router;
