// 通用工具函数

/**
 * 格式化日期
 * @param {Date|number} date 日期或时间戳
 * @param {string} format 格式，如 'YYYY-MM-DD HH:mm:ss'
 */
function formatDate(date, format = 'YYYY-MM-DD HH:mm') {
  const d = date instanceof Date ? date : new Date(date);
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  const second = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second);
}

/**
 * 防抖函数
 */
function debounce(fn, delay = 500) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * 节流函数
 */
function throttle(fn, delay = 500) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last > delay) {
      last = now;
      fn.apply(this, args);
    }
  };
}

/**
 * 深拷贝
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * 生成唯一ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * 验证手机号
 */
function validatePhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone);
}

/**
 * 验证邮箱
 */
function validateEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

/**
 * 隐藏手机号中间4位
 */
function hidePhone(phone) {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * 隐藏邮箱
 */
function hideEmail(email) {
  return email.replace(/(.{2}).*(@.*)/, '$1***$2');
}

/**
 * 数字格式化（超过万显示万）
 */
function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
}

/**
 * 延迟执行
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 获取当前页面栈
 */
function getCurrentPage() {
  const pages = getCurrentPages();
  return pages[pages.length - 1];
}

/**
 * 显示成功提示
 */
function showSuccess(title = '成功') {
  wx.showToast({ title, icon: 'success', duration: 2000 });
}

/**
 * 显示失败提示
 */
function showError(title = '出错了') {
  wx.showToast({ title, icon: 'none', duration: 2000 });
}

/**
 * 显示加载中
 */
function showLoading(title = '加载中') {
  wx.showLoading({ title, mask: true });
}

/**
 * 隐藏加载
 */
function hideLoading() {
  wx.hideLoading();
}

module.exports = {
  formatDate,
  debounce,
  throttle,
  deepClone,
  generateId,
  validatePhone,
  validateEmail,
  hidePhone,
  hideEmail,
  formatNumber,
  sleep,
  getCurrentPage,
  showSuccess,
  showError,
  showLoading,
  hideLoading
};
