<template>
  <div class="container">
    <el-card class="login-wrapper">
      <div slot="header">
        <h2 class="login-title">后台管理系统</h2>
      </div>
      <el-form :model="loginUser">
        <el-form-item prop="account">
          <el-input v-model="loginUser.account" placeholder="账号" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginUser.password"
            type="password"
            placeholder="密码"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            class="btn-login"
            type="primary"
            @click="login"
            native-type="submit"
            >登 录</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import rbacHttp from "@/rbac-http";
const APP_ID = 13;

export default {
  name: "Login",
  data() {
    return {
      loginUser: {}
    };
  },
  methods: {
    login() {
      let url = "/user/accountLogin";
      let param = {
        ...this.loginUser,
        appId: APP_ID
      };
      rbacHttp
        .formPost(url, param)
        .then(response => {
          let currentUser = response.data;
          let currentUserStr = JSON.stringify(currentUser);
          this.$store.state.currentUserStr = currentUserStr;
          localStorage.setItem("currentUser", currentUserStr);
          this.$router.push("/");
        })
        .catch(response => {
          console.error(response);
        });
    }
  }
};
</script>

<style scoped>
.container {
  background-color: #545c64;
  display: flex;
  height: 100vh;
  justify-content: center;
  align-items: center;
}
.login-wrapper {
  width: 380px;
}
.login-title {
  text-align: center;
}
.btn-login {
  display: block;
  width: 100%;
}
</style>
