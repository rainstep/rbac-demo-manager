import Vue from "vue";
import Vuex from "vuex";
import router from "../router";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    currentUserStr: localStorage.getItem("currentUser")
  },
  getters: {
    currentUser(state) {
      let currentUser = state.currentUserStr
        ? JSON.parse(state.currentUserStr)
        : null;
      return currentUser;
    },
    token(state, getters) {
      let currentUser = getters.currentUser;
      let token = currentUser ? currentUser.token : "";
      return token;
    }
  },
  mutations: {
    goBack() {
      window.history.length > 1 ? router.go(-1) : router.push("/");
    }
  },
  actions: {},
  modules: {}
});
