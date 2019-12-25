import axios from "axios";
import qs from "qs";
import { Message } from "element-ui";

const RBAC_BASE_URL = "http://localhost:9910/rbac/";
const RESULT_CODE_SUCCESS = 1; // 成功
// const RESULT_CODE_ERROR = 0;  // 失败
const RESULT_CODE_UNAUTHENTICATED = 401; // 未认证

let rbacAxios = axios.create({ baseURL: RBAC_BASE_URL });

export default {
  post(url, param, headers) {
    return new Promise((resolve, reject) => {
      rbacAxios({
        method: "post",
        url,
        data: param,
        headers
      })
        .then(response => {
          let code = response.data.code;
          if (code === RESULT_CODE_SUCCESS) {
            resolve(response.data);
          } else {
            if (code === RESULT_CODE_UNAUTHENTICATED) {
              // 跳转登录
            } else {
              Message.error(response.data.msg);
              reject(response);
            }
          }
        })
        .catch(response => {
          Message.error(response.message);
          reject(response);
        });
    });
  },
  formPost(url, param, headers) {
    headers = {
      ...headers,
      "content-type": "application/x-www-form-urlencoded"
    };
    if (param instanceof Object) param = qs.stringify(param);
    return this.post(url, param, headers);
  },
  jsonPost(url, param, headers) {
    headers = {
      ...headers,
      "content-type": "application/json"
    };
    return this.post(url, param, headers);
  }
};
