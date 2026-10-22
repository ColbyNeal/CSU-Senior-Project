<script setup>
// ============================================
// IMPORTS
// Vue reactivity and the Join Game component
// ============================================
import { inject, onMounted, ref, watch } from "vue";
import JoinGame from "./JoinGame.vue";
import apartmentImage from "../assets/questions/apartment.png";
import houseImage from "../assets/questions/house.jpeg";
import townhouseImage from "../assets/questions/townhouse.jpeg";

// ============================================
// GAME STATE
// These values control what the page displays
// ============================================
const gameCreated = ref(false);
const gameStarted = ref(false);
const gameCode = ref("");
const players = ref([]);
const careers = ref([]);
const selectedCareer = ref("");
const careerConfirmed = ref(false);
const careersLoading = ref(false);
const careersError = ref("");
const careerSelectionStarted = ref(false);
const allCareersConfirmed = ref(false);

// Host-controlled gameplay state
const gamePhase = ref("lobby");
const currentQuestion = ref(null);
const currentQuestionNumber = ref(1);
const answeredCount = ref(0);
const playerCount = ref(0);
const lastEvent = ref(null);
const eventNumber = ref(null);
const eventFlipCount = ref(0);

let socket = null;

const setFullScreenGame = inject("setFullScreenGame");

watch(
  [careerSelectionStarted, gameStarted],
  ([careerSelection, started]) => {
    setFullScreenGame?.(careerSelection || started);
  },
  { immediate: true }
);

const housingOptions = [
  {
    id: "apartment",
    title: "APARTMENT",
    image: apartmentImage,
    expense: 1200,
    utilities: 250,
    details: [
      "Lower monthly cost",
      "More flexibility",
      "Less space"
    ]
  },
  {
    id: "townhouse",
    title: "TOWNHOUSE",
    image: townhouseImage,
    expense: 1800,
    utilities: 320,
    details: [
      "More space",
      "Additional amenities",
      "Moderate cost"
    ]
  },
  {
    id: "house",
    title: "SINGLE FAMILY HOUSE",
    image: houseImage,
    expense: 2500,
    utilities: 400,
    details: [
      "Most space",
      "Long-term stability",
      "Higher cost"
    ]
  }
];

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
            if (message.type === "game-state") {
        gamePhase.value = message.phase;
        currentQuestion.value = message.currentQuestion;
        currentQuestionNumber.value = message.currentQuestionNumber;
        answeredCount.value = message.answeredCount;
        playerCount.value = message.playerCount;
        lastEvent.value = message.lastEvent;
        eventNumber.value = message.eventNumber;
        eventFlipCount.value = message.eventFlipCount ?? 0;
        players.value = message.players;

        if (
          message.phase === "question" ||
          message.phase === "leaderboard" ||
          message.phase === "coinflip" ||
          message.phase === "finished"
        ) {
          gameStarted.value = true;
          careerSelectionStarted.value = false;
        }
      }

      if (message.type === "career-selection-started") {
        careerSelectionStarted.value = true;
      }

      if (message.type === "players-updated") {
        players.value = message.players;
      }

      if (message.type === "all-careers-confirmed") {
        allCareersConfirmed.value = true;
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
function startCareerSelection() {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;

  socket.send(JSON.stringify({ type: "start-game" }));
}

function launchGame() {
  if (
    !socket ||
    socket.readyState !== WebSocket.OPEN ||
    !allCareersConfirmed.value
  ) {
    return;
  }

  socket.send(JSON.stringify({ type: "launch-game" }));
}

async function loadCareers() {
  careersLoading.value = true;
  careersError.value = "";

  try {
    const response = await fetch("http://localhost:3000/api/careers");

    if (!response.ok) {
      throw new Error("Unable to load careers.");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Unable to load careers.");
    }

    // Only expose the fields needed for selection.
    careers.value = data.careers.map((career) => ({
      soc_code: career.soc_code,
      title: career.title,
    }));
  } catch (error) {
    console.error("Career loading error:", error);
    careersError.value = "Unable to load careers. Please try again.";
  } finally {
    careersLoading.value = false;
  }
}

function nextQuestion() {
  if (
    !socket ||
    socket.readyState !== WebSocket.OPEN ||
    gamePhase.value !== "leaderboard"
  ) {
    return;
  }

  socket.send(JSON.stringify({ type: "next-question" }));
}
</script>

<template>
<!-- ========================================
    MAIN PAGE WRAPPER
    Controls the overall home page spacing
    ======================================== -->
  <main class="game-home"
    :class="{ 'career-lobby-active': careerSelectionStarted }"
    >
    <template v-if="!careerSelectionStarted && !gameStarted">
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
          <template v-else-if="!gameStarted">
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
              @click="startCareerSelection"
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
    </template>

    <!-- FULL-SCREEN CAREER LOBBY -->
    <section
      v-if="careerSelectionStarted && !gameStarted"
      class="career-lobby"
    >
      <p class="panel-eyebrow">LET'S GET STARTED</p>

      <h1 class="game-heading">CHOOSE YOUR CAREER</h1>

      <div class="game-divider"></div>

      <p class="game-description">
        Waiting for every player to confirm their career.
      </p>

      <div class="host-player-list">
        <div
          v-for="player in players"
          :key="player.id"
          class="host-player-row"
        >
          <span>{{ player.name }}</span>

          <span
            :class="player.careerConfirmed
              ? 'career-status-confirmed'
              : 'career-status-pending'"
          >
            {{ player.careerConfirmed
              ? 'Career confirmed'
              : 'Choosing career' }}
          </span>
        </div>
      </div>

      <button
        v-if="allCareersConfirmed && players.length > 0"
        type="button"
        class="game-button game-button-primary"
        @click="launchGame"
      >
        Start Game
      </button>

      <p v-else class="game-description">
        The second Start Game button will appear when everyone confirms.
      </p>
    </section>

      <!-- HOST GAMEPLAY -->
      <section v-if="gameStarted" class="host-game-screen">
        <p class="panel-eyebrow">SO, YOU THINK YOU'RE BROKE?</p>

        <template v-if="gamePhase === 'question' && currentQuestion">
          <h1 class="game-heading">
            Question {{ currentQuestionNumber }}
          </h1>

          <div class="game-divider"></div>

          <h2 class="host-question">
            {{ currentQuestion.text || currentQuestion.title || currentQuestion.question || "Question text unavailable" }}
          </h2>

          <p class="game-description">
            Players answered: {{ answeredCount }} / {{ playerCount }}
          </p>

          <div
            v-if="currentQuestionNumber !== 1"
            class="host-options"
          >
            <div
              v-for="option in currentQuestion.options"
              :key="option.id"
              class="host-option"
            >
              {{ option.text || option.label || option.title || "Option text unavailable" }}
            </div>
          </div>

          <!-- HOUSING IMAGE CARDS -->
          <div
            v-if="currentQuestionNumber === 1"
            class="housing-image-grid"
          >
            <article
              v-for="option in housingOptions"
              :key="option.id"
              class="housing-image-card"
            >
              <img
                :src="option.image"
                :alt="option.title"
                class="housing-image"
              />

              <h3>{{ option.title }}</h3>

              <div class="housing-expense">
                ${{ option.expense.toLocaleString() }} rent
                + ${{ option.utilities.toLocaleString() }} utilities
              </div>

              <ul>
                <li
                  v-for="detail in option.details"
                  :key="detail"
                >
                  {{ detail }}
                </li>
              </ul>
            </article>
          </div>

          <p class="game-description">
            Waiting for every player to submit an answer.
          </p>
        </template>
        
        <template v-else-if="gamePhase === 'coinflip'">
          <h1 class="game-heading">UNFORESEEN EVENT</h1>

          <div class="game-divider"></div>

          <p class="game-description">
            Event #{{ eventNumber }} — Each player must flip their coin
            to reveal their individual outcome.
          </p>

          <h2 class="host-question">
            Players who have flipped:
            {{ eventFlipCount }} / {{ playerCount }}
          </h2>

          <div class="host-leaderboard">
            <div
              v-for="player in players"
              :key="player.id"
              class="host-leaderboard-row"
            >
              <strong>{{ player.name }}</strong>

              <span
                :class="player.eventFlipped
                  ? 'career-status-confirmed'
                  : 'career-status-pending'"
              >
                {{ player.eventFlipped ? 'Coin flipped' : 'Waiting to flip' }}
              </span>
            </div>
          </div>

          <p class="game-description">
            The leaderboard will appear automatically after everyone flips.
          </p>
        </template>

        <template v-else-if="gamePhase === 'leaderboard'">
          <h1 class="game-heading">LEADERBOARD</h1>
          <div class="game-divider"></div>

          <p class="game-description">
            Review the standings before continuing.
          </p>

          <div class="host-leaderboard">
            <div
              v-for="(player, index) in [...players].sort(
                (a, b) => (b.balance ?? 0) - (a.balance ?? 0)
              )"
              :key="player.id"
              class="host-leaderboard-row"
            >
              <strong>{{ index + 1 }}. {{ player.name }}</strong>                
                <span
                  class="financial-outcome"
                  :class="{
                    'outcome-positive': (player.balance ?? 0) > 0,
                    'outcome-negative': (player.balance ?? 0) < 0,
                    'outcome-neutral': (player.balance ?? 0) === 0
                  }"
                >
                  {{
                    (player.balance ?? 0).toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0
                    })
                  }}
                </span>
            </div>
          </div>

          <p v-if="lastEvent" class="game-description">
            {{ lastEvent }}
          </p>

          <button
            type="button"
            class="game-button game-button-primary"
            @click="nextQuestion"
          >
            {{
              currentQuestionNumber >= 8
                ? "View Final Results"
                : "Next Question"
            }}
          </button>
        </template>

        <template v-else-if="gamePhase === 'finished'">
          <h1 class="game-heading">FINAL RESULTS</h1>
          <div class="game-divider"></div>

          <p class="game-description">
            The game is complete! Here are the final standings.
          </p>

          <div class="host-leaderboard">
            <div
              v-for="(player, index) in [...players].sort(
                (a, b) => (b.balance ?? 0) - (a.balance ?? 0)
              )"
              :key="player.id"
              class="host-leaderboard-row"
            >
              <strong>{{ index + 1 }}. {{ player.name }}</strong> 
                <span
                  class="financial-outcome"
                  :class="{
                    'outcome-positive': (player.balance ?? 0) > 0,
                    'outcome-negative': (player.balance ?? 0) < 0,
                    'outcome-neutral': (player.balance ?? 0) === 0
                  }"
                >
                  {{
                    (player.balance ?? 0).toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0
                    })
                  }}
                </span>
            </div>
          </div>
        </template>
      </section>
  </main>
</template>

<style scoped>

.game-home {
  padding: 1rem 1.5rem 0;
  background: transparent;
  min-height: 0;
}

.game-home.career-lobby-active {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  padding: 0;
}

.career-lobby {
  flex: 1;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 5%;
  text-align: center;
}

.host-player-list {
  width: min(700px, 100%);
  margin: 2rem auto;
  text-align: left;
}

.host-player-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  margin-bottom: 0.75rem;
  border-radius: 8px;
  background: #fff;
  color: #123f73;
}

.career-status-pending {
  color: #b91c1c;
  font-weight: 700;
}

.career-status-confirmed {
  color: #15803d;
  font-weight: 700;
}

@media (max-width: 576px) {
  .career-lobby {
    padding: 2rem 1rem;
  }

  .host-player-row {
    align-items: flex-start;
    flex-direction: column;
  }
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
  height: auto;
  object-fit: contain;
  object-position: center;
  border-radius: inherit;
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
.host-game-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  padding: 3rem 5%;
  text-align: center;
}

.host-question {
  max-width: 1000px;
  margin: 1rem 0 2rem;
  color: #153f70;
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-weight: 800;
}

.host-options,
.host-leaderboard {
  width: min(850px, 100%);
  margin: 1rem auto 2rem;
}

.host-option,
.host-leaderboard-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
  padding: 1rem 1.25rem;
  border: 1px solid #e1e7ef;
  border-radius: 0.75rem;
  background: #fff;
  color: #153f70;
  text-align: left;
}

.host-option {
  justify-content: flex-start;
  font-size: 1.1rem;
}

.host-leaderboard-row {
  font-size: 1.1rem;
}

.housing-image-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  width: 100%;
  max-width: 1600px;
  margin: 32px auto 0;
  padding: 0 24px;
  box-sizing: border-box;
}

.housing-image-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  background: #fffaf0;
  border: 2px solid #d9a441;
  border-radius: 16px;
  color: #102b50;
  text-align: left;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.housing-image {
  display: block;
  width: 100%;
  height: clamp(240px, 30vh, 380px);
  object-fit: cover;
}

.housing-image-card h3 {
  margin: 0;
  padding: 16px 10px;
  background: #073b70;
  color: white;
  text-align: center;
  font-size: 1.4rem;
}

.housing-image-card ul {
  flex: 1;
  margin: 0;
  padding: 16px 20px 20px 40px;
  font-size: 1.05rem;
  line-height: 1.8;
}

@media (max-width: 800px) {
  .housing-image-grid {
    grid-template-columns: 1fr;
    padding: 0 16px;
  }

  .housing-image {
    height: 260px;
  }
}

.housing-expense {
  padding: 12px 8px;
  text-align: center;
  color: #073b70;
  font-size: 2rem;
  font-weight: 800;
  background: #f3e5c3;
  border-bottom: 1px solid #d9a441;
}

.housing-expense span {
  font-size: 1rem;
  font-weight: 500;
}

.financial-outcome {
  display: inline-block;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 800;
  text-align: center;
}

.outcome-positive {
  background: #dcfce7;
  color: #166534;
}

.outcome-negative {
  background: #fee2e2;
  color: #991b1b;
}

.outcome-neutral {
  background: #e2e8f0;
  color: #334155;
}

.financial-outcome {
  font-size: 1.25rem;
  font-weight: 800;
  white-space: nowrap;
}

.outcome-positive {
  color: #15803d;
}

.outcome-negative {
  color: #dc2626;
}

.outcome-neutral {
  color: #64748b;
}
</style>