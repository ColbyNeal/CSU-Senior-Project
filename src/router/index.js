import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Budget from "../views/Budget.vue";
import CareerDetails from "../views/CareerDetails.vue";

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
  {
    path: "/careers/:socCode",
    name: "career-details",
    component: CareerDetails,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;