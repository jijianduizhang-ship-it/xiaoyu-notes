const express = require('express');
const router = express.Router();
const { success, error } = require('../utils/response');
const { authMiddleware } = require('../middleware/auth');

// 获取场景列表
router.get('/list', async (req, res) => {
  try {
    const { lang, category } = req.query;

    let sql = 'SELECT * FROM scenes WHERE status = 1';
    const params = [];

    if (lang) {
      sql += ' AND lang = ?';
      params.push(lang);
    }

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY is_hot DESC, sort ASC';

    const scenes = req.db.prepare(sql).all(...params);

    res.json(success({
      list: scenes.map(scene => ({
        id: scene.id,
        title: scene.title,
        desc: scene.description,
        category: scene.category,
        hot: scene.is_hot == 1,
        count: scene.view_count
      }))
    }));

  } catch (err) {
    console.error('获取场景列表错误:', err);
    res.json(error('获取失败'));
  }
});

// 获取场景详情
router.get('/detail', async (req, res) => {
  try {
    const { id } = req.query;
    console.log('[DEBUG] detail called, id:', id, 'type:', typeof id);

    if (!id) {
      return res.json(error('缺少场景ID'));
    }

    const scene = req.db.prepare('SELECT * FROM scenes WHERE id = ? AND status = 1').get(id);
    console.log('[DEBUG] scene result:', scene);

    if (!scene) {
      return res.json(error('场景不存在'));
    }

    req.db.prepare('UPDATE scenes SET view_count = view_count + 1 WHERE id = ?').run(id);

    res.json(success({
      id: scene.id,
      title: scene.title,
      description: scene.description,
      category: scene.category,
      isHot: scene.is_hot == 1,
      viewCount: scene.view_count + 1,
      lang: scene.lang
    }));

  } catch (err) {
    console.error('[DEBUG] 获取场景详情错误:', err);
    res.json(error('获取失败'));
  }
});

// 收藏场景
router.post('/favor', authMiddleware, async (req, res) => {
  try {
    const { sceneId } = req.body;

    if (!sceneId) {
      return res.json(error('缺少场景ID'));
    }

    try {
      req.db.prepare(
        'INSERT INTO favorites (user_id, type, target_id) VALUES (?, ?, ?)'
      ).run(req.user.id, 'scene', sceneId);

      req.db.prepare('UPDATE scenes SET favor_count = favor_count + 1 WHERE id = ?').run(sceneId);
    } catch (e) {
      // 忽略重复收藏
    }

    res.json(success());

  } catch (err) {
    console.error('收藏场景错误:', err);
    res.json(error('收藏失败'));
  }
});

// 获取收藏的场景
router.get('/favorites', authMiddleware, async (req, res) => {
  try {
    const favorites = req.db.prepare(
      `SELECT s.* FROM scenes s
       INNER JOIN favorites f ON s.id = f.target_id
       WHERE f.user_id = ? AND f.type = 'scene'`
    ).all(req.user.id);

    res.json(success({
      list: favorites.map(s => ({
        id: s.id,
        title: s.title,
        description: s.description,
        category: s.category
      }))
    }));

  } catch (err) {
    console.error('获取收藏场景错误:', err);
    res.json(error('获取失败'));
  }
});

module.exports = router;
