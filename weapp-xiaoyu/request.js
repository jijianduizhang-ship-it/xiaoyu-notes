// HTTP 请求封装
const { baseUrl } = require('./api.js');
const { apiBase } = require('../siteinfo.js');

/**
 * 请求封装
 * @param {Object} options 请求配置
 */
function request(options) {
  const {
    url,
    method = 'GET',
    data = {},
    header = {},
    showLoading = true,
    showError = true,
    autoRedirect = true  // 是否自动跳转（401时）
  } = options;
  
  // 显示加载中
  if (showLoading) {
    wx.showLoading({ title: '加载中...', mask: true });
  }
  
  return new Promise((resolve, reject) => {
    // 获取 token
    const token = wx.getStorageSync('token') || '';
    
    wx.request({
      url: url.startsWith('http') ? url : `${apiBase}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...header
      },
      success(res) {
        if (showLoading) wx.hideLoading();
        
        if (res.data.code === 200 || res.data.code === 0) {
          resolve(res.data.data);
        } else if (res.data.code === 401) {
          // 未登录
          if (autoRedirect) {
            wx.removeStorageSync('token');
            wx.removeStorageSync('userInfo');
            wx.showToast({ title: '请先登录', icon: 'none' });
            setTimeout(() => {
              wx.switchTab({ url: '/pages/mine/mine' });
            }, 1500);
          }
          // 返回 null 表示需要登录
          resolve(null);
        } else {
          if (showError && res.data.msg) {
            wx.showToast({ title: res.data.msg, icon: 'none' });
          }
          reject(res.data);
        }
      },
      fail(err) {
        if (showLoading) wx.hideLoading();
        wx.showToast({ title: '网络请求失败', icon: 'none' });
        reject(err);
      }
    });
  });
}

/**
 * GET 请求
 */
function get(url, data, options = {}) {
  return request({
    url,
    method: 'GET',
    data,
    ...options
  });
}

/**
 * POST 请求
 */
function post(url, data, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  });
}

/**
 * 文件上传
 */
function uploadFile(filePath, name = 'file') {
  const token = wx.getStorageSync('token') || '';
  
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${apiBase}/api/common/upload`,
      filePath,
      name,
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success(res) {
        const data = JSON.parse(res.data);
        if (data.code === 200) {
          resolve(data.data);
        } else {
          wx.showToast({ title: data.msg || '上传失败', icon: 'none' });
          reject(data);
        }
      },
      fail(err) {
        wx.showToast({ title: '上传失败', icon: 'none' });
        reject(err);
      }
    });
  });
}

module.exports = {
  request,
  get,
  post,
  uploadFile
};
