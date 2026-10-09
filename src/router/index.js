import { createRouter, createWebHistory } from "vue-router";
import Game from "../views/Game.vue";
import CareerDetails from "../views/CareerDetails.vue";
import JoinGame from "../views/JoinGame.vue";
import Careers from "../views/Careers.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: Game,
  },
  {
    path: "/careers/:socCode",
    name: "career-details",
    component: CareerDetails,
  },
  {
    path: "/join",
    name: "join",
    component: JoinGame,
  },
  {
    path: "/careers",
    name: "careers",
    component: Careers,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;