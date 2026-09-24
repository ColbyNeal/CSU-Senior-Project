import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Budget from "../views/Budget.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: Home,
  },
  {
    path: "/budget",
    name: "budget",
    component: Budget,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;