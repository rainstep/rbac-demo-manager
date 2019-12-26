import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import User from "../views/User.vue";
import Role from "../views/Role.vue";
import Resource from "../views/Resource.vue";
import Permission from "../views/Permission.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    component: Home
  },
  {
    path: "/about",
    name: "about",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue")
  },
  {
    path: "/user",
    name: "user",
    component: User
  },
  {
    path: "/role",
    name: "role",
    component: Role
  },
  {
    path: "/resource",
    name: "resource",
    component: Resource
  },
  {
    path: "/permission",
    name: "permission",
    component: Permission
  }
];

const router = new VueRouter({
  routes
});

export default router;
