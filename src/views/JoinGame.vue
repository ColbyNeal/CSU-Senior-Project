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

    const response = await fetch(
      `http://localhost:3000/api/games/${code}`,
    );

    if (!response.ok) {
      alert("Game not found. Check the game code and try again.");
      return;
    }

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
  <section class="join-page min-vh-100 py-4 py-md-5">
    <div class="container join-content">

      <!-- GAME TITLE -->
      <div class="text-center mb-4">

        <h1 class="game-title">
          SO, YOU THINK
          <span>YOU'RE BROKE?</span>
        </h1>

        <div class="game-title-divider"></div>

      </div>

      <div class="row justify-content-center">

        <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">

          <!-- JOIN FORM -->
          <div
            v-if="!joined"
            class="card border-0 shadow-lg rounded-4"
          >

            <div class="card-body p-4 p-md-5">

              <div class="text-center mb-4">

                <p
                  class="text-uppercase fw-bold mb-2"
                  style="color: #b88922;"
                >
                  Multiplayer Game
                </p>

                <h2 class="display-6 fw-bold text-primary mb-3">
                  JOIN GAME
                </h2>

                <p class="text-secondary mb-0">
                  Enter the game code shown on the host screen.
                </p>

              </div>

              <!-- GAME CODE -->
              <div class="mb-4">

                <label
                  for="game-code"
                  class="form-label fw-bold text-primary"
                >
                  GAME CODE
                </label>

                <input
                  id="game-code"
                  v-model="gameCode"
                  type="text"
                  maxlength="6"
                  placeholder="ABC123"
                  autocomplete="off"
                  class="form-control form-control-lg text-center text-uppercase fw-bold"
                />

              </div>

              <!-- PLAYER NAME -->
              <div class="mb-4">

                <label
                  for="player-name"
                  class="form-label fw-bold text-primary"
                >
                  YOUR NAME
                </label>

                <input
                  id="player-name"
                  v-model="playerName"
                  type="text"
                  maxlength="20"
                  placeholder="Enter your name"
                  autocomplete="off"
                  class="form-control form-control-lg text-center"
                />

              </div>

              <!-- JOIN BUTTON -->
              <button
                type="button"
                class="btn btn-warning btn-lg w-100 fw-bold py-3"
                @click="joinGame"
              >
                JOIN GAME
              </button>

            </div>

          </div>


          <!-- WAITING ROOM -->
          <div
            v-else
            class="card border-0 shadow-lg rounded-4"
          >

            <div class="card-body p-4 p-md-5 text-center">

              <!-- WAITING -->
              <div v-if="!gameStarted">

                <p
                  class="text-uppercase fw-bold mb-2"
                  style="color: #b88922;"
                >
                  Multiplayer Game
                </p>

                <h2 class="display-6 fw-bold text-primary mb-3">
                  YOU'RE IN!
                </h2>

                <div class="game-title-divider small-divider"></div>

                <p class="lead text-secondary">
                  Welcome,
                  <strong class="text-primary">
                    {{ playerName }}
                  </strong>.
                </p>

                <p class="text-secondary">
                  Waiting for the host to start the game...
                </p>

                <div
                  class="alert alert-light border mt-4 mb-0"
                  role="status"
                >
                  <strong>{{ connectionStatus }}</strong>
                </div>

              </div>


              <!-- GAME STARTED -->
              <div v-else>

                <p
                  class="text-uppercase fw-bold mb-2"
                  style="color: #b88922;"
                >
                  The Game Has Begun
                </p>

                <h2 class="display-6 fw-bold text-primary mb-3">
                  GAME STARTED!
                </h2>

                <div class="game-title-divider small-divider"></div>

                <p class="lead text-secondary">
                  Get ready,
                  <strong class="text-primary">
                    {{ playerName }}
                  </strong>!
                </p>

                <p class="text-secondary mb-0">
                  The host has started the game.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  </section>
</template>

<style scoped>
.join-page {
  position: relative;
  min-height: calc(100vh - 150px);
  overflow: hidden;

  background:
    radial-gradient(
      circle at 15% 20%,
      rgba(199, 147, 43, 0.18),
      transparent 25%
    ),
    radial-gradient(
      circle at 85% 80%,
      rgba(214, 168, 79, 0.14),
      transparent 30%
    ),
    linear-gradient(
      135deg,
      #ffffff 0%,
      #ffffff 5%,
      #123f73 50%,
      #0a315a 100%
    );

    display: flex;
    align-items: center;
    justify-content: center;
}

.join-content {
  position: relative;
  z-index: 2;
  width: 100%;
}

.join-page::before {
  content: "";
  position: absolute;
  width: 500px;
  height: 500px;
  top: -250px;
  left: -250px;
  border: 3px solid rgba(214, 168, 79, 0.65);
  border-radius: 50%;

  pointer-events: none;
}

.join-page::after {
  content: "";
  position: absolute;
  width: 600px;
  height: 600px;
  right: -350px;
  bottom: -350px;
  border: 3px solid rgba(214, 168, 80, 0.65);
  border-radius: 50%;

  pointer-events: none;
}


/* =========================================
   GAME TITLE
   ========================================= */

.game-title {
  margin: 0;
  color: #ffffff;
  font-family:
    Impact,
    Haettenschweiler,
    "Arial Narrow Bold",
    sans-serif;
  font-size: clamp(2.5rem, 7vw, 6rem);
  font-weight: 900;
  line-height: 0.9;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.game-title span {
  display: block;
  color: #ffffff;
}


/* GOLD ACCENT */
.game-title-divider {
  width: min(420px, 70%);
  height: 8px;
  margin: 1.5rem auto 0;
  background-color: #d6a84f;
  border-radius: 4px;
}

.small-divider {
  width: 100px;
  height: 6px;
  margin: 1rem auto 1.5rem;
}


/* =========================================
   FORM
   ========================================= */

.form-control {
  border: 2px solid #d6a84f;
}

.form-control:focus {
  border-color: #123f73;
  box-shadow: 0 0 0 0.2rem rgba(18, 63, 115, 0.15);
}


/* =========================================
   JOIN BUTTON
   ========================================= */

.btn-warning {
  background-color: #d6a84f;
  border-color: #b88922;
  color: #123f73;
}

.btn-warning:hover {
  background-color: #e2b961;
  border-color: #b88922;
  color: #123f73;
}


/* =========================================
   MOBILE
   ========================================= */

@media (max-width: 576px) {
  .game-title {
    font-size: clamp(2.3rem, 12vw, 4rem);
  }

  .game-title-divider {
    height: 6px;
    margin-top: 1.25rem;
  }
}
</style>