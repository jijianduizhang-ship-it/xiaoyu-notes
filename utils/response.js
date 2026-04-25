// 统一响应格式
function response(code, msg, data = null) {
  const result = { code, msg };
  if (data !== null) {
    result.data = data;
  }
  return result;
}

// 成功响应
function success(data = null, msg = '操作成功') {
  return response(200, msg, data);
}

// 失败响应
function error(msg = '操作失败', code = 400) {
  return response(code, msg);
}

module.exports = { success, error, response };
