// 手机
const MOBILE_REGEX = /^1[3-9]\d{9}$/;

// 邮箱
const EMAIL_REGEX = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;

// 账号以字母、下划线开头，只允许字母、数字和下划线，最少6位长度。
const ACCOUNT_REGEX = /^[A-Za-z_]+\w{5,}/;

// 密码只允许字母、数字和下划线，最少6位长度。
const PASSWORD_REGEX = /\w{6,}/;

// 编码以字母、下划线开头，只允许字母、数字和下划线，最少3位长度
const CODE_REGEX = /^[A-Za-z_]+\w{3,}/;

// 中文
const CHINESE_REGEX = /[\u4e00-\u9fa5]+/;

export default {
  checkMobile(mobile) {
    return MOBILE_REGEX.test(mobile);
  },
  checkEmail(email) {
    return EMAIL_REGEX.test(email);
  },
  checkAccount(account) {
    return account && ACCOUNT_REGEX.test(account);
  },
  checkPassword(password) {
    return password && PASSWORD_REGEX.test(password);
  },
  checkChinese(text) {
    return CHINESE_REGEX.test(text);
  },
  checkCode(code) {
    return code && CODE_REGEX.test(code);
  }
};
