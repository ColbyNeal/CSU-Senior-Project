<script setup>
import { ref } from "vue";

const gameCreated = ref(false);
const gameStarted = ref(false);
const gameCode = ref("");
const players = ref([]);
let socket = null;

async function createGame() {
  try {
    const response = await fetch(
      "http://localhost:3000/api/games",
      {
        method: "POST",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to create game.");
    }

    const data = await response.json();

    gameCode.value = data.gameCode;
    gameCreated.value = true;

    console.log("Game created:", data.gameCode);

    socket = new WebSocket(
      `ws://localhost:3000/ws?gameCode=${data.gameCode}&role=host`,
    );

    socket.addEventListener("open", () => {
      console.log("Host connected to game:", data.gameCode);
    });

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);

      console.log("Message from server:", message);

      if (message.type === "players-updated") {
        players.value = message.players;
      }

      if (message.type === "game-started") {
        gameStarted.value = true;
      }
    });

    socket.addEventListener("close", () => {
      console.log("Host disconnected from game");
    });

    socket.addEventListener("error", (error) => {
      console.error("Host WebSocket error:", error);
    });
  } catch (error) {
    console.error("Error creating game:", error);
  }
}

function startGame() {
  if (!socket) {
    return;
  }

  socket.send(
    JSON.stringify({
      type: "start-game",
    }),
  );

  console.log("Start game requested.");
}
</script>

<template>
  <section class="container-fluid py-4">
    <div
      class="position-relative mx-auto"
      style="max-width: 1600px;"
    >
      <img
        src="/game-hero.png"
        alt="So, You Think You're Broke?"
        class="img-fluid w-100"
      />

      <!-- HOST GAME -->
      <div
        v-if="!gameCreated"
        class="position-absolute top-50 translate-middle-y text-center rounded-4 shadow"
        style="
          right: 7%;
          width: 32%;
          max-width: 500px;
          padding: 3%;
          background: rgba(255, 255, 255, 0.96);
        "
      >
        <h2 class="game-heading">
          HOST GAME
        </h2>

        <div class="game-divider"></div>

        <p class="game-description">
          Create a new game to begin.
        </p>

        <button
          type="button"
          class="w-100 game-button"
          @click="createGame"
        >
          CREATE GAME
        </button>
      </div>

      <!-- GAME LOBBY -->
      <div
        v-else
        class="position-absolute top-50 translate-middle-y text-center rounded-4 shadow"
        style="
          right: 7%;
          width: 32%;
          max-width: 500px;
          padding: 3%;
          background: rgba(255, 255, 255, 0.96);
        "
      >
        <h2 class="game-heading">
          GAME LOBBY
        </h2>

        <div class="game-divider"></div>

        <p class="code-instruction">
          GAME CODE:
        </p>

        <div class="game-code">
          {{ gameCode }}
        </div>

        <div
          v-if="players.length === 0"
          class="waiting-message"
        >
          Waiting for players to join...
        </div>

        <div
          v-else
          class="mb-4"
        >
          <p class="players-heading">
            PLAYERS
          </p>

          <div
            v-for="player in players"
            :key="player.id"
            class="player-item"
          >
            {{ player.name }}
          </div>
        </div>

        <button
          type="button"
          class="w-100 game-button"
          @click="startGame"
        >
          START GAME
        </button>
      </div>
    </div>
  </section>
</template>