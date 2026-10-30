<script setup>
// ============================================
// IMPORTS
// Vue reactivity and the Join Game component
// ============================================
import { inject, onMounted, ref, watch } from "vue";
import JoinGame from "./JoinGame.vue";
import QuestionCard from "../components/QuestionCard.vue";

// Housing
import apartmentCardImage from "../assets/questions/q1-apartment.png";
import townhouseCardImage from "../assets/questions/q1-townhouse.png";
import singleFamilyHouseCardImage from "../assets/questions/q1-single-family-house.png";

// Transportation
import busImage from "../assets/questions/q2-bus.png";
import handMeDownImage from "../assets/questions/q2-hand-me-down-car.png";
import usedCarImage from "../assets/questions/q2-used-car.png";
import newCarImage from "../assets/questions/q2-new-car.png";

// Retirement
import retireAt50Image from "../assets/questions/q3-retire-at-50.png";
import retireAt60Image from "../assets/questions/q3-retire-at-60.png";
import retireAt72Image from "../assets/questions/q3-retire-at-72.png";

// Compound Interest
import compoundInterestImage from "../assets/questions/compound-interest.png";

// Investment
import minimalSaverImage from "../assets/questions/q4-minimal-saver.png";
import averageSaverImage from "../assets/questions/q4-average-saver.png";
import aggressiveSaverImage from "../assets/questions/q4-aggressive-saver.png";

// Technology
import cellPhoneImage from "../assets/questions/q5-cell-phone.png";
import internetImage from "../assets/questions/q5-high-speed-internet.png";
import gamingImage from "../assets/questions/q5-gaming-subscription.png";
import streamingImage from "../assets/questions/q5-streaming-services.png";

// Meals
import greatValueImage from "../assets/questions/q6-great-value.png";
import nameBrandImage from "../assets/questions/q6-name-brand.png";
import eatOutHalfImage from "../assets/questions/q6-eat-out-half.png";
import eatOutMostImage from "../assets/questions/q6-eat-out-most.png";

// Clothing
import loungeWearImage from "../assets/questions/q7-lounge-wear.png";
import businessCasualImage from "../assets/questions/q7-business-casual.png";
import businessProfessionalImage from "../assets/questions/q7-business-professional.png";

// Midlife-crisis
import childrenDaycareImage from "../assets/questions/q8-children-daycare.png";
import timeshareImage from "../assets/questions/q8-timeshare-vacation.png";
import disneyTripsImage from "../assets/questions/q8-disney-world-trips.png";
import midlifeCrisisImage from "../assets/questions/q8-midlife-crisis.png";




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
const showCompoundInterest = ref(false);
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
    image: apartmentCardImage,
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
    image: townhouseCardImage,
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
    image: singleFamilyHouseCardImage,
    expense: 2500,
    utilities: 400,
    details: [
      "Most space",
      "Long-term stability",
      "Higher cost"
    ]
  }
];

const transportationOptions = [
  {
    id: "bus",
    title: "BUS",
    image: busImage,
    priceLabel: "$200/month",
    details: ["Public transportation", "No fuel or maintenance costs"],
  },
  {
    id: "hand-me-down",
    title: "HAND-ME-DOWN CAR",
    image: handMeDownImage,
    priceLabel: "$400/month",
    details: ["Lower monthly payment", "Fuel and maintenance included"],
  },
  {
    id: "used-car",
    title: "USED CAR",
    image: usedCarImage,
    priceLabel: "$600/month",
    details: ["Moderate monthly cost", "Fuel and maintenance included"],
  },
  {
    id: "new-car",
    title: "NEW CAR",
    image: newCarImage,
    priceLabel: "$900/month",
    details: ["Newer vehicle", "Fuel and maintenance included"],
  },
];

const retirementOptions = [
  {
    id: "retire-50",
    title: "RETIRE AT 50",
    image: retireAt50Image,
    priceLabel: "Save 5% monthly",
    details: ["More time for retirement", "Start saving earlier"],
  },
  {
    id: "retire-60",
    title: "RETIRE AT 60",
    image: retireAt60Image,
    priceLabel: "Save 3% monthly",
    details: ["Balance work and retirement", "Build retirement savings"],
  },
  {
    id: "retire-72",
    title: "RETIRE AT 72",
    image: retireAt72Image,
    priceLabel: "Save 2% monthly",
    details: ["Work longer", "Save a smaller percentage"],
  },
];

const savingsOptions = [
  {
    id: "minimal-saver",
    title: "MINIMAL SAVER",
    image: minimalSaverImage,
    priceLabel: "Save 5% monthly",
    details: ["Save a small portion of your income", "Build savings gradually"],
  },
  {
    id: "average-saver",
    title: "AVERAGE SAVER",
    image: averageSaverImage,
    priceLabel: "Save 10% monthly",
    details: ["Save a moderate portion of your income", "Balance saving and spending"],
  },
  {
    id: "aggressive-saver",
    title: "AGGRESSIVE SAVER",
    image: aggressiveSaverImage,
    priceLabel: "Save 15% monthly",
    details: ["Save a larger portion of your income", "Build long-term wealth"],
  },
];

const technologyOptions = [
  {
    id: "cell-phone",
    title: "CELL PHONE",
    image: cellPhoneImage,
    priceLabel: "$45/month",
    details: ["Stay connected", "Calls, texts, and mobile apps"],
  },
  {
    id: "internet",
    title: "HIGH-SPEED INTERNET",
    image: internetImage,
    priceLabel: "$60/month",
    details: ["Reliable home internet", "Connect multiple devices"],
  },
  {
    id: "gaming-subscription",
    title: "GAMING SUBSCRIPTION",
    image: gamingImage,
    priceLabel: "$20/month",
    details: ["Online gaming access", "Entertainment and multiplayer"],
  },
  {
    id: "streaming",
    title: "STREAMING SERVICES",
    image: streamingImage,
    priceLabel: "$50/month",
    details: ["Netflix, Prime Video, Hulu, Disney+", "Movies and television"],
  },
];

const mealOptions = [
  {
    id: "great-value",
    title: "GREAT VALUE",
    image: greatValueImage,
    priceLabel: "$400/month",
    details: [
      "Store brand groceries",
      "Simple, home-cooked meals",
      "Focus on essentials",
      "Most affordable option",
    ],
  },
  {
    id: "name-brand",
    title: "NAME BRAND",
    image: nameBrandImage,
    priceLabel: "$600/month",
    details: [
      "Name brand groceries",
      "Higher quality ingredients",
      "More variety and options",
      "Home-cooked meals",
    ],
  },
  {
    id: "eat-out-half",
    title: "EAT OUT HALF THE TIME",
    image: eatOutHalfImage,
    priceLabel: "$1,000/month",
    details: [
      "Mix of home-cooked meals and restaurant meals",
      "Lunch or dinner out several times per week",
      "Fast food and casual dining",
    ],
  },
  {
    id: "eat-out-most",
    title: "EAT OUT MOST OF THE TIME",
    image: eatOutMostImage,
    priceLabel: "$1,300/month",
    details: [
      "Restaurant meals most days",
      "Multiple meals out per week",
      "Fast food, casual dining, and sit-down restaurants",
      "Highest cost option",
    ],
  },
];

const clothingOptions = [
  {
    id: "lounge-wear",
    title: "LOUNGE WEAR",
    image: loungeWearImage,
    priceLabel: "$60/month",
    details: [
      "Casual and comfortable clothing",
      "T-shirts, shorts, sweatshirts, and pants",
      "Great for everyday wear",
      "Most affordable option",
    ],
  },
  {
    id: "business-casual",
    title: "BUSINESS CASUAL",
    image: businessCasualImage,
    priceLabel: "$100/month",
    details: [
      "Polo shirts, button-down shirts, and khakis",
      "Blouses, slacks, and nice casual outfits",
      "Comfortable and professional look",
      "Good balance of style and cost",
    ],
  },
  {
    id: "business-professional",
    title: "BUSINESS PROFESSIONAL",
    image: businessProfessionalImage,
    priceLabel: "$150/month",
    details: [
      "Dress shirts, slacks, suits, and blazers",
      "Professional dresses, blouses, skirts, and suits",
      "Polished and professional appearance",
      "Higher quality and longer-lasting clothing",
    ],
  },
];

const preparednessOptions = [
  {
    id: "children-daycare",
    title: "CHILDREN IN DAYCARE",
    image: childrenDaycareImage,
    priceLabel: "$2,702.50/month",
    details: [
      "Childcare and daycare expenses",
      "Reliable care while working",
      "Support for your family's future",
    ],
  },
  {
    id: "timeshare",
    title: "TIMESHARE VACATION",
    image: timeshareImage,
    priceLabel: "$100/month",
    details: [
      "Vacation property access",
      "Annual family vacations",
      "Plan ahead for getaways",
    ],
  },
  {
    id: "disney-trips",
    title: "DISNEY WORLD TRIPS",
    image: disneyTripsImage,
    priceLabel: "$200/month",
    details: [
      "Family trips to Disney World",
      "Save toward vacations",
      "Create lasting memories",
    ],
  },
  {
    id: "midlife-crisis",
    title: "MID-LIFE CRISIS",
    image: midlifeCrisisImage,
    priceLabel: "$400/month",
    details: [
      "New vehicle, toys, or hobbies",
      "Enjoy the things you've always wanted",
      "Personal fun and adventure",
      "Live life now",
    ],
  },
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

async function launchGame() {
  if (
    !socket ||
    socket.readyState !== WebSocket.OPEN ||
    !allCareersConfirmed.value
  ) {
    return;
  }

  // Request fullscreen when the host starts gameplay.
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    }
  } catch (error) {
    console.warn("Fullscreen could not be enabled:", error);
  }

  // Preserve the existing multiplayer launch behavior.
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

function handleHostNext() {
  if (currentQuestionNumber.value === 3) {
    showCompoundInterest.value = true;
    return;
  }

  nextQuestion();
}

function continueAfterCompoundInterest() {
  showCompoundInterest.value = false;
  nextQuestion();
}

// Return the host to the home screen after the game finishes.
async function returnToHome() {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
  }
  if (socket) {
    socket.close();
    socket = null;
  }

  gameCreated.value = false;
  gameStarted.value = false;
  gameCode.value = "";
  players.value = [];

  careers.value = [];
  selectedCareer.value = "";
  careerConfirmed.value = false;
  careersLoading.value = false;
  careersError.value = "";
  careerSelectionStarted.value = false;
  allCareersConfirmed.value = false;

  gamePhase.value = "lobby";
  currentQuestion.value = null;
  currentQuestionNumber.value = 1;
  showCompoundInterest.value = false;
  answeredCount.value = 0;
  playerCount.value = 0;
  lastEvent.value = null;
  eventNumber.value = null;
  eventFlipCount.value = 0;

  console.log("Host returned to home screen.");
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

        <template
          v-if="gamePhase === 'question' && currentQuestion && showCompoundInterest"
        >
          <section class="compound-interest-panel">
            <p class="panel-eyebrow">PLAN FOR YOUR FUTURE</p>

            <h1 class="game-heading">THE POWER OF COMPOUND INTEREST</h1>

            <div class="game-divider"></div>

            <img
              :src="compoundInterestImage"
              alt="Chart comparing investment growth when starting at ages 25, 35, and 45"
              class="compound-interest-image"
            />

            <p class="compound-interest-caption">
              Starting earlier gives your money more time to grow.
            </p>

            <button
              type="button"
              class="game-button game-button-primary"
              @click="continueAfterCompoundInterest"
            >
              Continue to Question 4
            </button>
          </section>
        </template>

        <template
          v-else-if="gamePhase === 'question' && currentQuestion && !showCompoundInterest"
        >
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
            v-if="![1, 2, 3, 4, 5, 6, 7, 8].includes(currentQuestionNumber)"
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
            class="housing-image-grid question-card-grid"
          >
            <QuestionCard
              v-for="option in housingOptions"
              :key="option.id"
              :option="{
                ...option,
                priceLabel: `$${option.expense.toLocaleString()} rent + $${option.utilities.toLocaleString()} utilities`,
              }"
            />
          </div>

          <!-- TRANSPORTATION IMAGE CARDS -->
          <div
            v-if="currentQuestionNumber === 2"
            class="transportation-image-grid question-card-grid"
          >
            <QuestionCard
              v-for="option in transportationOptions"
              :key="option.id"
              :option="option"
            />
          </div>

          <!-- RETIREMENT IMAGE CARDS -->
          <div
            v-if="currentQuestionNumber === 3 && !showCompoundInterest"
            class="retirement-image-grid question-card-grid"
          >
            <QuestionCard
              v-for="option in retirementOptions"
              :key="option.id"
              :option="option"
            />
          </div>

          <!-- SAVINGS IMAGE CARDS -->
          <div
            v-if="currentQuestionNumber === 4"
            class="savings-image-grid question-card-grid"
          >
            <QuestionCard
              v-for="option in savingsOptions"
              :key="option.id"
              :option="option"
            />
          </div>
          
          <!-- TECHNOLOGY IMAGE CARDS -->
          <div
            v-if="currentQuestionNumber === 5"
            class="technology-image-grid question-card-grid"
          >
            <QuestionCard
              v-for="option in technologyOptions"
              :key="option.id"
              :option="option"
            />
          </div>

          <!-- MEALS IMAGE CARDS -->
          <div
            v-if="currentQuestionNumber === 6"
            class="meals-image-grid question-card-grid"
          >
            <QuestionCard
              v-for="option in mealOptions"
              :key="option.id"
              :option="option"
            />
          </div>

          <!-- CLOTHING IMAGE CARDS -->
          <div
            v-if="currentQuestionNumber === 7"
            class="clothing-image-grid question-card-grid"
          >
            <QuestionCard
              v-for="option in clothingOptions"
              :key="option.id"
              :option="option"
            />
          </div>

          <!-- PREPAREDNESS IMAGE CARDS -->
          <div
            v-if="currentQuestionNumber === 8"
            class="preparedness-image-grid question-card-grid"
          >
            <QuestionCard
              v-for="option in preparednessOptions"
              :key="option.id"
              :option="option"
            />
          </div>
          
          <p class="game-description">
            The host controls when the game moves forward.
          </p>

          <button
            type="button"
            class="game-button game-button-primary"
            @click="handleHostNext"
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
            <div class="final-results-actions">
              <button
                class="btn btn-warning"
                @click="returnToHome"
              >
                <i class="bi bi-house-door-fill"></i>
                Back to Home
              </button>
            </div>
          </section>
        </template>
      </section>
  </main>
</template>
