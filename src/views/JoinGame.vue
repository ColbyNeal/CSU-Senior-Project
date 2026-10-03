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
    <div class="join-stage">
      <img
        src="/game-hero.png"
        alt="So, You Think You're Broke?"
        class="join-image"
      />

      <!-- JOIN FORM -->
      <div v-if="!joined" class="join-panel">
        <h1>JOIN GAME</h1>

        <div class="join-divider"></div>

        <p>
          Enter the game code shown on the host screen.
        </p>

        <div class="join-field">
          <label for="game-code">GAME CODE</label>
          <input
            id="game-code"
            v-model="gameCode"
            type="text"
            maxlength="6"
            placeholder="ABC123"
            autocomplete="off"
          />
        </div>

        <div class="join-field">
          <label for="player-name">YOUR NAME</label>
          <input
            id="player-name"
            v-model="playerName"
            type="text"
            maxlength="20"
            placeholder="Enter your name"
            autocomplete="off"
          />
        </div>

        <button
          type="button"
          class="join-game-button"
          @click="joinGame"
        >
          JOIN GAME
          <span>▶</span>
        </button>
      </div>

      <!-- WAITING ROOM -->
      <div v-else class="join-panel waiting-panel">
        <div v-if="!gameStarted">
          <h1>YOU'RE IN!</h1>

          <div class="join-divider"></div>

          <p>
            Welcome, <strong>{{ playerName }}</strong>.
          </p>

          <p>
            Waiting for the host to start the game...
          </p>

          <div class="connection-status">
            {{ connectionStatus }}
          </div>
        </div>

        <!-- GAME STARTED -->
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
    </div>
  </section>
</template>

<style scoped>
.join-page {
  width: 100%;
  min-height: calc(100vh - 150px);
  display: flex;
  justify-content: center;
  align-items: center;
  background: #ffffff;
  overflow: hidden;
}

.join-stage {
  position: relative;
  width: min(100%, 1600px);
  height: calc(100vh - 150px);
  display: flex;
  justify-content: center;
  align-items: center;
}

.join-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  display: block;
}

.join-panel {
  position: absolute;
  right: 7%;
  top: 62%;
  transform: translateY(-50%);
  width: 34%;
  max-width: 540px;
  padding: 2.5%;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 18px;
  text-align: center;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
}

.join-panel h1 {
  margin: 0;
  color: #123f73;
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 900;
}

.join-divider {
  width: 120px;
  height: 8px;
  margin: 1.25rem auto 2rem;
  background: #d6a84f;
}

.join-panel p {
  margin: 0 0 1.5rem;
  color: #123f73;
  font-size: clamp(1rem, 1.8vw, 1.35rem);
}

.join-field {
  margin-bottom: 1.25rem;
  text-align: left;
}

.join-field label {
  display: block;
  margin-bottom: 0.5rem;
  color: #123f73;
  font-size: 1rem;
  font-weight: 900;
}

.join-field input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.9rem 1rem;
  border: 3px solid #d6a84f;
  border-radius: 10px;
  background: #ffffff;
  color: #123f73;
  font-size: 1.2rem;
  font-weight: 700;
  outline: none;
}

.join-field input:focus {
  border-color: #123f73;
  box-shadow: 0 0 0 3px rgba(18, 63, 115, 0.15);
}

.join-field input::placeholder {
  color: #888;
  font-weight: 400;
}

.join-game-button {
  width: 100%;
  padding: clamp(1rem, 2vw, 1.5rem);
  border: 3px solid #b88922;
  border-radius: 12px;
  background: #d6a84f;
  color: #123f73;
  font-size: clamp(1.2rem, 2.2vw, 1.7rem);
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.25);
}

.join-game-button span {
  margin-left: 1rem;
}

.join-game-button:hover {
  background: #e2b961;
  transform: translateY(-2px);
}

.waiting-panel {
  top: 65%;
}

.connection-status {
  margin-top: 1.5rem;
  color: #666;
  font-size: 0.95rem;
  font-weight: 600;
}

/* PHONE / SMALL SCREEN */
@media (max-width: 900px) {
  .join-page {
    min-height: calc(100vh - 120px);
    overflow-y: auto;
  }

  .join-stage {
    width: 100%;
    height: auto;
    min-height: calc(100vh - 120px);
  }

  .join-image {
    min-height: calc(100vh - 120px);
    object-fit: cover;
  }

  .join-panel {
    right: 5%;
    left: 5%;
    top: 50%;
    width: auto;
    max-width: none;
    padding: 2rem;
  }

  .waiting-panel {
    top: 50%;
  }
}
</style>