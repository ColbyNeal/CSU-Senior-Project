<script setup>
// ============================================
// IMPORTS
// Vue reactivity and the Join Game component
// ============================================
import { ref } from "vue";
import JoinGame from "./JoinGame.vue";

// ============================================
// GAME STATE
// These values control what the page displays
// ============================================
const gameCreated = ref(false);
const gameStarted = ref(false);
const gameCode = ref("");
const players = ref([]);
let socket = null;

// ============================================
// CREATE GAME
// Requests a new game from the backend and
// connects the host to its WebSocket room
// ============================================
async function createGame() {
  // Keep your existing createGame function here.
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

// ============================================
// START GAME
// Sends the start-game message to the server
// ============================================
function startGame() {
// Keep your existing startGame function here.
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
<!-- ========================================
    MAIN PAGE WRAPPER
    Controls the overall home page spacing
    ======================================== -->
  <main class="game-home">

    <!-- ======================================
         HERO SECTION
         Contains the banner image and game panel
         ====================================== -->
    <section class="game-hero">
      <img
        src="/game-hero.png"
        alt="So, You Think You're Broke?"
        class="game-hero-image"
      />

      <div class="game-panel">
        <!-- HOST GAME -->
        <template v-if="!gameCreated">
          <p class="panel-eyebrow">PERSONAL FINANCIAL MANAGEMENT</p>

          <h2 class="game-heading">HOST GAME</h2>

          <div class="game-divider"></div>

          <p class="game-description">
            Bring your friends together and put your financial skills to the
            test.
          </p>

          <div class="game-actions">
            <button
              type="button"
              class="game-button game-button-primary"
              @click="createGame"
            >
              Create Game
            </button>

            <RouterLink
              to="/join"
              class="game-button game-button-secondary"
            >
              Join Game
            </RouterLink>
          </div>

          <p class="panel-footer">Learn. Play. Make smarter money moves.</p>
        </template>

        <!-- GAME LOBBY -->
        <template v-else>
          <p class="panel-eyebrow">YOUR GAME IS READY</p>

          <h2 class="game-heading">GAME LOBBY</h2>

          <div class="game-divider"></div>

          <p class="code-instruction">Share this code with your players</p>

          <div class="game-code">{{ gameCode }}</div>

          <div v-if="players.length === 0" class="waiting-message">
            Waiting for players to join...
          </div>

          <div v-else class="players-section">
            <p class="players-heading">
              PLAYERS JOINED ({{ players.length }})
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
            class="game-button game-button-primary"
            :disabled="players.length === 0"
            @click="startGame"
          >
            Start Game
          </button>
        </template>
      </div>
    
    </section>

    <!-- ========================================
         WHAT YOU'LL LEARN
         Introductory financial education content
         ======================================== -->
    <section class="learning-section container py-5">
      <div class="text-center mb-4">
        <p class="learning-eyebrow">BEYOND THE GAME</p>
        <h2 class="learning-title">Build Skills for Real Life</h2>
        <p class="learning-intro">
          Explore the financial decisions that shape your future.
        </p>
      </div>

      <!-- Three responsive learning cards -->
      <div class="row g-4">
        <!-- Budgeting card -->
        <div class="col-12 col-md-4">
          <article class="learning-card h-100">
            <div class="learning-icon" aria-hidden="true">
              <span>💰</span>
            </div>
            <h3>Budgeting</h3>
            <p>
              Understand income, expenses, and everyday spending choices.
            </p>
          </article>
        </div>

        <!-- Career planning card -->
        <div class="col-12 col-md-4">
          <article class="learning-card h-100">
            <div class="learning-icon" aria-hidden="true">
              <span>🎓</span>
            </div>
            <h3>Career Planning</h3>
            <p>
              Explore careers and compare available wage information.
            </p>
            <RouterLink to="/careers" class="learning-link">
              Explore Careers <span aria-hidden="true">→</span>
            </RouterLink>
          </article>
        </div>

        <!-- Financial decisions card -->
        <div class="col-12 col-md-4">
          <article class="learning-card h-100">
            <div class="learning-icon" aria-hidden="true">
              <span>🎯</span>
            </div>
            <h3>Smart Choices</h3>
            <p>
              Learn to evaluate options and make informed financial decisions.
            </p>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>



<style scoped>
.game-home {
  padding: 1rem 1.5rem 0;
  background: transparent;
  min-height: 0;
}

.game-hero {
  position: relative;
  isolation: isolate;
  width: 100%;
  max-width: 1600px;
  min-height: 480px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 1rem;
  background: #153f70;
  box-shadow: 0 1rem 2.5rem rgba(15, 39, 68, 0.16);
}

.game-hero-image {
  display: block;
  width: 100%;
  height: clamp(480px, 56vw, 720px);
  object-fit: cover;
  object-position: center;
}

.game-panel {
  position: absolute;
  top: 67%;
  right: 2%;
  transform: translateY(-50%);
  width: min(38%, 490px);
  padding: clamp(1.5rem, 3vw, 2.75rem);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 1.25rem 3rem rgba(8, 31, 57, 0.24);
  backdrop-filter: blur(12px);
  text-align: center;
}

.panel-eyebrow {
  margin-bottom: 0.75rem;
  color: #87621b;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.game-heading {
  margin: 0;
  color: #153f70;
  font-size: clamp(1.65rem, 2.5vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.035em;
}

.game-divider {
  width: 5rem;
  height: 4px;
  margin: 0.75rem auto;
  border-radius: 999px;
  background: #d9ad4b;
}

.game-description {
  margin-bottom: 1rem;
  color: #45556b;
  font-size: 1rem;
  line-height: 1.65;
}

.game-actions {
  display: grid;
  gap: 0.85rem;
}

.game-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 3.5rem;
  padding: 0.85rem 1.25rem;
  border: 2px solid #c4932e;
  border-radius: 0.65rem;
  font: inherit;
  font-weight: 750;
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color 180ms ease,
    color 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.game-button-primary {
  background: #d9ad4b;
  color: #123b69;
  box-shadow: 0 4px 10px rgba(21, 63, 112, 0.12);
}

.game-button-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: #b98520;
  background: #e7bd60;
  box-shadow: 0 8px 18px rgba(21, 63, 112, 0.18);
}

.game-button-secondary {
  background: transparent;
  color: #153f70;
}

.game-button-secondary:hover {
  transform: translateY(-2px);
  background: #153f70;
  border-color: #153f70;
  color: #fff;
}

.game-button:focus-visible {
  outline: 3px solid #153f70;
  outline-offset: 4px;
}

.game-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  box-shadow: none;
}

.panel-footer {
  margin: 1.5rem 0 0;
  color: #64748b;
  font-size: 0.8rem;
}

.code-instruction {
  margin-bottom: 0.75rem;
  color: #45556b;
  line-height: 1.5;
}

.game-code {
  margin-bottom: 1.25rem;
  padding: 0.85rem;
  border: 2px dashed #d9ad4b;
  border-radius: 0.75rem;
  background: #fffaf0;
  color: #153f70;
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 850;
  letter-spacing: 0.16em;
  overflow-wrap: anywhere;
}

.waiting-message {
  margin: 1rem 0 1.5rem;
  color: #64748b;
  font-size: 0.95rem;
}

.players-section {
  margin-bottom: 1.5rem;
  text-align: left;
}

.players-heading {
  margin-bottom: 0.75rem;
  color: #87621b;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.player-item {
  margin-top: 0.5rem;
  padding: 0.65rem 0.85rem;
  border: 1px solid #e1e7ef;
  border-radius: 0.5rem;
  background: #fff;
  color: #153f70;
  overflow-wrap: anywhere;
}

@media (max-width: 1100px) {
  .game-home {
    padding: 1rem;
  }

  .game-hero-image {
    height: 560px;
  }

  .game-panel {
    top: 63%;
    right: 1%;
    width: 42%;
    padding: 1 rem 1.25rem;
  }
}

@media (max-width: 767.98px) {
  .game-home {
    padding: 0.5rem 0.75rem 0;
    min-height: 0;
  }

  .game-hero {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 0.85rem;
  }

  .game-hero-image {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: auto;
    object-fit: contain;
    object-position: center;
    background: transparent;
  }

  .game-panel {
    position: relative;
    top: auto;
    right: auto;
    transform: none;
    width: 100%;
    max-width: none;
    padding: 1.5rem;
    border: 0;
    border-radius: 0;
    box-shadow: none;
    backdrop-filter: none;
  }

  .game-heading {
    font-size: 1.8rem;
  }

  .game-button {
    min-height: 3.25rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .game-button {
    transition: none;
  }
}


/* ============================================
   WHAT YOU'LL LEARN SECTION
   Fills the space below the game hero
   ============================================ */

.learning-section {
  max-width: 1200px;
  padding-top: 3.5rem !important;
  padding-bottom: 3.5rem !important;
}

.learning-eyebrow {
  margin-bottom: 0.5rem;
  color: #f2c15e;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}


.learning-title {
  margin-bottom: 0.75rem;
  color: #ffffff;
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

.learning-intro {
  max-width: 600px;
  margin: 0 auto;
  color: #f1f5f9;
  font-size: 1rem;
  line-height: 1.6;
  }


.learning-card {
  padding: 1.75rem;
  border: 1px solid #e1e7ef;
  border-top: 4px solid #d9ad4b;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 8px 24px rgba(15, 39, 68, 0.06);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease;
}

.learning-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 30px rgba(15, 39, 68, 0.12);
}

.learning-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.25rem;
  height: 3.25rem;
  margin-bottom: 1.25rem;
  border-radius: 0.85rem;
  background: #edf3fa;
  color: #153f70;
  font-size: 1.6rem;
}

.learning-card h3 {
  margin-bottom: 0.75rem;
  color: #153f70;
  font-size: 1.2rem;
  font-weight: 800;
}

.learning-card p {
  margin-bottom: 0;
  color: #526174;
  font-size: 0.95rem;
  line-height: 1.7;
}

.learning-link {
  display: inline-block;
  margin-top: 1rem;
  color: #153f70;
  font-weight: 750;
  text-decoration-color: #d9ad4b;
  text-underline-offset: 4px;
}

.learning-link:hover {
  color: #87621b;
}

@media (max-width: 767.98px) {
  .learning-section {
    padding-top: 2.5rem !important;
    padding-bottom: 2rem !important;
  }

  .learning-card {
    padding: 1.4rem;
  }

  .learning-card:hover {
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .learning-card {
    transition: none;
  }

  .learning-card:hover {
    transform: none;
  }
}

</style>
