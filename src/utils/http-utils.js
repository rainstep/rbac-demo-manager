import axios from "axios";
import qs from "qs";

export default {
  post(url, param, headers) {
    return new Promise((resolve, reject) => {
      axios({
        method: "post",
        url,
        data: param,
        headers
      })
        .then(response => {
          resolve(response.data);
        })
        .catch(response => {
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
