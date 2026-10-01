<script setup>
import { ref } from "vue";

const gameCreated = ref(false);
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
  <section class="game-page">
    <div class="game-stage">
      <img
        src="/game-hero.png"
        alt="So, You Think You're Broke?"
        class="game-image"
      />

      <!-- HOST GAME -->
      <div v-if="!gameCreated" class="game-panel">
        <h2>HOST GAME</h2>

        <div class="game-divider"></div>

        <p>
          Create a new game to begin.
        </p>

        <button
          type="button"
          class="create-game-button"
          @click="createGame"
        >
          CREATE GAME
          <span>▶</span>
        </button>
      </div>

      <!-- GAME LOBBY -->
      <div v-else class="game-panel lobby-panel">
        <h2>GAME LOBBY</h2>

        <div class="game-divider"></div>

        <p class="code-instruction">
          GAME CODE:
        </p>

        <div class="game-code">
          {{ gameCode }}
        </div>

        <div v-if="players.length === 0" class="waiting-message">
            Waiting for players to join...
        </div>

        <div v-else class="players-list">
            <p class="players-heading">PLAYERS</p>

            <div
                v-for="player in players"
                    :key="player.id"
                    class="player-item"
                >
                {{ player.name }}
            </div>
        </div>

        <!-- START GAME -->
        <button
          type="button"
          class="create-game-button"
          @click="startGame"
        >
          START GAME
          <span>▶</span>
        </button>
      </div>
    </div>
  </section>
</template>