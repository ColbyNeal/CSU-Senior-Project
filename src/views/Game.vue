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
      `${window.location.protocol === "https:" ? "https:" : "http:"}//${window.location.hostname}:3000/api/games`,
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
      `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.hostname}:3000/ws?gameCode=${data.gameCode}&role=host`,
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
    const response = await fetch(
      `${window.location.protocol}//${window.location.hostname}:3000/api/careers`
    );


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
    !["question", "coinflip", "leaderboard"].includes(gamePhase.value)
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
            
            <div class="lobby-qr-section">
              <p class="code-instruction">SCAN TO JOIN</p>

              <div class="lobby-qr-placeholder">
                QR CODE
              </div>
            </div>

            <p class="code-instruction">Share this code with your players</p>

            <div class="game-code">{{ gameCode }}</div>

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

      <!-- PLAYERS JOINED -->
      <section v-if="gameCreated && !gameStarted && !careerSelectionStarted"
        class="players-lobby-section container">
        <div class="players-section">
          <p class="players-heading">
            PLAYERS JOINED ({{ players.length }})
          </p>

          <p v-if="players.length === 0" class="waiting-message">
            Waiting for players to join...
          </p>

          <div
            v-for="player in players"
            :key="player.id"
            class="player-item"
          >
            {{ player.name }}
          </div>
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
            The host controls when the game moves forward.
          </p>

          <button
            type="button"
            class="game-button game-button-primary"
            @click="nextQuestion"
          >
            Next
          </button>
        </template>
                
        <template v-else-if="gamePhase === 'coinflip'">
          <section class="event-lobby">
            <p class="panel-eyebrow">SO, YOU THINK YOU'RE BROKE?</p>

            <h1 class="game-heading">UNFORESEEN EVENT</h1>

            <div class="game-divider"></div>

            <p class="game-description">
              Event #{{ eventNumber }} — Each player must flip their coin
              to reveal their individual outcome.
            </p>

            <div class="event-progress">
              <div>
                <h2>Player Progress</h2>
                <p>Players who have flipped their coin</p>
              </div>

              <span class="event-progress-count">
                {{ eventFlipCount }} / {{ playerCount }}
              </span>
            </div>

            <div class="host-leaderboard event-player-grid">
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

            <p class="game-description event-instruction">
              Continue when you are ready, even if some players have not flipped.
            </p>

            <button
              type="button"
              class="game-button game-button-primary event-continue-button"
              @click="nextQuestion"
            >
              Continue to Leaderboard
            </button>
          </section>
        </template>

        <template v-else-if="gamePhase === 'leaderboard'">
          <section class="leaderboard-lobby">
            <p class="panel-eyebrow">SO, YOU THINK YOU'RE BROKE?</p>

            <h1 class="game-heading">LEADERBOARD</h1>

            <div class="game-divider"></div>

            <p class="game-description">
              Review the standings before continuing.
            </p>

            <div class="leaderboard-summary">
              <div>
                <h2>Current Standings</h2>
                <p>Ranked by remaining monthly balance</p>
              </div>

              <span class="leaderboard-player-count">
                {{ players.length }} Players
              </span>
            </div>

            <div class="host-leaderboard leaderboard-player-grid">
              <div
                v-for="(player, index) in [...players].sort(
                  (a, b) => (b.balance ?? 0) - (a.balance ?? 0)
                )"
                :key="player.id"
                class="host-leaderboard-row leaderboard-player-row"
              >
                <div class="leaderboard-rank-name">
                  <span class="leaderboard-rank">{{ index + 1 }}</span>

                  <strong class="player-name">{{ player.name }}</strong>
                </div>

                <span
                  v-if="player.currentEventAmount !== undefined && player.currentEventAmount !== null"
                  class="financial-outcome leaderboard-event-amount"
                  :class="{
                    'outcome-positive': player.currentEventAmount > 0,
                    'outcome-negative': player.currentEventAmount < 0,
                    'outcome-neutral': player.currentEventAmount === 0
                  }"
                >
                  {{ player.currentEventAmount > 0 ? '+' : '' }}{{ player.currentEventAmount.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0
                  }) }}
                </span>

                <span
                  class="player-balance leaderboard-balance"
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

            <p v-if="lastEvent" class="game-description leaderboard-event-message">
              {{ lastEvent }}
            </p>

            <button
              type="button"
              class="game-button game-button-primary leaderboard-next-button"
              @click="nextQuestion"
            >
              {{
                currentQuestionNumber >= 8
                  ? "View Final Results"
                  : "Next"
              }}
            </button>
          </section>
        </template>

        <template v-else-if="gamePhase === 'finished'">
          <section class="final-results-lobby">
            <p class="panel-eyebrow">SO, YOU THINK YOU'RE BROKE?</p>

            <h1 class="game-heading">FINAL RESULTS</h1>

            <div class="game-divider"></div>

            <p class="game-description">
              The game is complete! Here are the final standings.
            </p>

            <div class="final-results-summary">
              <div>
                <h2>Final Standings</h2>
                <p>Ranked by remaining monthly balance</p>
              </div>

              <span class="final-results-count">
                {{ players.length }} Players
              </span>
            </div>

            <div class="final-results-player-grid">
              <div
                v-for="(player, index) in [...players].sort(
                  (a, b) => (b.balance ?? 0) - (a.balance ?? 0)
                )"
                :key="player.id"
                class="final-results-player-card"
              >
                <div class="final-results-player-name">
                  <span class="final-results-rank">{{ index + 1 }}</span>
                  <strong>{{ player.name }}</strong>
                </div>

                <span
                  class="final-results-balance"
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
          </section>
        </template>
      </section>
  </main>
</template>
