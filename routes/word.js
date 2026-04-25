const express = require('express');
const router = express.Router();
const { success, error } = require('../utils/response');
const { authMiddleware } = require('../middleware/auth');

// 获取单词书列表
router.get('/books', async (req, res) => {
  try {
    const { lang } = req.query;
    
    let sql = 'SELECT * FROM word_books WHERE status = 1';
    
    if (lang) {
      sql += ' AND lang = ?';
    }
    
    sql += ' ORDER BY sort ASC';
    
    const books = lang 
      ? req.db.prepare(sql).all(lang)
      : req.db.prepare(sql).all();
    
    res.json(success({
      list: books.map(book => ({
        id: book.id,
        name: book.name,
        desc: book.description,
        count: book.word_count,
        icon: book.icon,
        cover: book.cover
      }))
    }));
    
  } catch (err) {
    console.error('获取单词书列表错误:', err);
    res.json(error('获取失败'));
  }
});

// 获取单词列表
router.get('/list', async (req, res) => {
  try {
    const { bookId, page = 1, pageSize = 20 } = req.query;
    
    let sql = 'SELECT * FROM words WHERE 1=1';
    const params = [];
    
    if (bookId) {
      sql += ' AND book_id = ?';
      params.push(bookId);
    }
    
    sql += ' ORDER BY id ASC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize));
    
    const words = req.db.prepare(sql).all(...params);
    
    res.json(success({
      list: words.map(w => ({
        id: w.id,
        word: w.word,
        pronunciation: w.pronunciation,
        meaning: w.meaning,
        example: w.example,
        translation: w.translation
      })),
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }));
    
  } catch (err) {
    console.error('获取单词列表错误:', err);
    res.json(error('获取失败'));
  }
});

// 收藏单词
router.post('/favor', authMiddleware, async (req, res) => {
  try {
    const { wordId } = req.body;
    
    if (!wordId) {
      return res.json(error('缺少单词ID'));
    }
    
    try {
      req.db.prepare(
        'INSERT INTO favorites (user_id, type, target_id) VALUES (?, ?, ?)'
      ).run(req.user.id, 'word', wordId);
    } catch (e) {
      // 忽略重复收藏错误
    }
    
    res.json(success());
    
  } catch (err) {
    console.error('收藏单词错误:', err);
    res.json(error('收藏失败'));
  }
});

// 获取收藏的单词
router.get('/favorites', authMiddleware, async (req, res) => {
  try {
    const favorites = req.db.prepare(
      `SELECT w.* FROM words w 
       INNER JOIN favorites f ON w.id = f.target_id 
       WHERE f.user_id = ? AND f.type = 'word'`
    ).all(req.user.id);
    
    res.json(success({
      list: favorites.map(w => ({
        id: w.id,
        word: w.word,
        pronunciation: w.pronunciation,
        meaning: w.meaning
      }))
    }));
    
  } catch (err) {
    console.error('获取收藏单词错误:', err);
    res.json(error('获取失败'));
  }
});

module.exports = router;
