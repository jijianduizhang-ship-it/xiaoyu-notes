// 登录授权模块
const { get, post } = require('./request.js');
const { apiBase } = require('../siteinfo.js');

/**
 * 微信登录
 */
function wxLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      timeout: 10000,
      success: async (res) => {
        if (res.code) {
          try {
            // 将 code 发送到后端换取 openid
            const data = await post('/api/user/login', { code: res.code });
            
            // 保存 token 和用户信息
            wx.setStorageSync('token', data.token);
            wx.setStorageSync('openid', data.openid);
            
            // 如果后端返回了用户信息，一并保存
            if (data.userInfo) {
              wx.setStorageSync('userInfo', data.userInfo);
            }
            
            resolve(data);
          } catch (err) {
            reject(err);
          }
        } else {
          reject(new Error('获取code失败'));
        }
      },
      fail(err) {
        reject(err);
      }
    });
  });
}

/**
 * 获取用户信息（带授权检查）
 */
async function getUserInfo() {
  // 先检查本地缓存
  let userInfo = wx.getStorageSync('userInfo');
  
  if (!userInfo) {
    // 无缓存，尝试登录
    try {
      await wxLogin();
      userInfo = wx.getStorageSync('userInfo');
    } catch (e) {
      console.error('登录失败', e);
    }
  }
  
  return userInfo;
}

/**
 * 确保已登录
 */
async function ensureLogin() {
  const token = wx.getStorageSync('token');
  
  if (!token) {
    await wxLogin();
  }
  
  return true;
}

/**
 * 微信授权获取用户信息
 */
function getWxUserProfile() {
  return new Promise((resolve, reject) => {
    wx.getUserProfile({
      desc: '用于完善个人资料',
      success: async (res) => {
        try {
          // 发送到后端更新用户信息
          const data = await post('/api/user/update', {
            nickname: res.userInfo.nickName,
            avatar: res.userInfo.avatarUrl,
            gender: res.userInfo.gender
          });
          
          // 更新本地缓存
          wx.setStorageSync('userInfo', data);
          
          resolve(data);
        } catch (err) {
          reject(err);
        }
      },
      fail: reject
    });
  });
}

/**
 * 检查登录状态
 */
function isLoggedIn() {
  return !!wx.getStorageSync('token');
}

/**
 * 退出登录
 */
function logout() {
  wx.removeStorageSync('token');
  wx.removeStorageSync('openid');
  wx.removeStorageSync('userInfo');
}

module.exports = {
  wxLogin,
  getUserInfo,
  ensureLogin,
  getWxUserProfile,
  isLoggedIn,
  logout
};
