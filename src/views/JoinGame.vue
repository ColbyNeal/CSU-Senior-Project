<script setup>
import { ref } from "vue";

const gameCode = ref("");
const playerName = ref("");
const joined = ref(false);
const gameStarted = ref(false);
const connectionStatus = ref("");

let socket = null;

async function joinGame() {
  if (!gameCode.value || !playerName.value) {
    return;
  }

  try {
    const code = gameCode.value.trim().toUpperCase();
    const name = playerName.value.trim();

    // First verify that the game exists
    const response = await fetch(
      `http://localhost:3000/api/games/${code}`,
    );

    if (!response.ok) {
      alert("Game not found. Check the game code and try again.");
      return;
    }

    // Connect this player to the game's WebSocket
    socket = new WebSocket(
      `ws://localhost:3000/ws?gameCode=${code}&role=player`,
    );

    socket.addEventListener("open", () => {
      console.log("Connected to game:", code);

      socket.send(
        JSON.stringify({
          type: "join",
          name,
        }),
      );

      gameCode.value = code;
      joined.value = true;
      connectionStatus.value = "Connected to game";
    });

    socket.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);

        console.log("Message from server:", data);

        if (data.type === "joined") {
            console.log("Player ID:", data.playerId);
        }
        if (data.type === "game-started") {
            gameStarted.value = true;
        }

        if (data.type === "game-started") {
            console.log("The game has started!");
        }

        
    });

    socket.addEventListener("close", () => {
      console.log("Disconnected from game");
      connectionStatus.value = "Disconnected";
    });

    socket.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
      connectionStatus.value = "Connection error";
    });
  } catch (error) {
    console.error("Error joining game:", error);
    alert("Unable to connect to the game server.");
  }
}
</script>

<template>
  <section class="join-page">
    <div v-if="!joined" class="join-panel">
      <h1>JOIN GAME</h1>

      <div class="join-divider"></div>

      <p>Enter the game code shown on the host screen.</p>

      <label for="game-code">GAME CODE</label>

      <input
        id="game-code"
        v-model="gameCode"
        type="text"
        maxlength="6"
        placeholder="ABC123"
        autocomplete="off"
      />

      <label for="player-name">YOUR NAME</label>

      <input
        id="player-name"
        v-model="playerName"
        type="text"
        maxlength="20"
        placeholder="Enter your name"
        autocomplete="off"
      />

      <button
        type="button"
        class="join-game-button"
        @click="joinGame"
      >
        JOIN GAME
        <span>▶</span>
      </button>
    </div>

    <div v-else class="join-panel">
        <div v-if="!gameStarted">
            <h1>YOU'RE IN!</h1>

            <div class="join-divider"></div>

            <p>
                Welcome, <strong>{{ playerName }}</strong>.
            </p>

            <p>
                Waiting for the host to start the game...
            </p>
        </div>

    <div v-else>
        <h1>GAME STARTED!</h1>

        <div class="join-divider"></div>

        <p>
            Get ready, <strong>{{ playerName }}</strong>!
        </p>

        <p>
            The host has started the game.
        </p>
      </div>
    </div>
  </section>
</template>