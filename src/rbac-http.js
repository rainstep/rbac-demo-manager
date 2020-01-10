import axios from "axios";
import qs from "qs";
import { Message } from "element-ui";
import router from "./router";
import store from "./store";

const RBAC_BASE_URL = "http://localhost:9910/rbac/";
const RESULT_CODE_SUCCESS = 1; // 成功
// const RESULT_CODE_ERROR = 0;  // 失败
const RESULT_CODE_UNAUTHENTICATED = 401; // 未认证

let rbacAxios = axios.create({ baseURL: RBAC_BASE_URL });

export default {
  post(url, param, headers) {
    let token = store.getters.token;
    headers = {
      ...headers,
      token
    };
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
              router.push("/login");
            } else {
              let errorMsg = response.data.msg || "操作失败";
              Message.error(errorMsg);
              reject(response);
            }
          }
        })
        .catch(response => {
          console.error(response);
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
    if (param instanceof Object)
      param = qs.stringify(param, { indices: false });
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
