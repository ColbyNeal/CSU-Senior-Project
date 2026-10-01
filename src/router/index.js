import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Game from "../views/Game.vue";
import CareerDetails from "../views/CareerDetails.vue";
import JoinGame from "../views/JoinGame.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: Home,
  },
  {
    path: "/game",
    name: "game",
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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;