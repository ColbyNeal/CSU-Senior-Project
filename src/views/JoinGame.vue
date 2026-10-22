<script setup>
import GamePlay from "./GamePlay.vue";
import { computed, ref, inject } from "vue";
import { calculateMonthlyIncomeBreakdown } from "../utils/budgetCalculations.js";

const setFullScreenGame = inject("setFullScreenGame");
const gameCode = ref("");
const playerName = ref("");
const joined = ref(false);
const careerSelectionStarted = ref(false);
const gameStarted = ref(false);
const connectionStatus = ref("");

// Multiplayer question state
const gamePhase = ref("lobby");
const currentQuestion = ref(null);
const currentQuestionNumber = ref(1);
const answeredCount = ref(0);
const playerCount = ref(0);
const lastEvent = ref(null);
const selectedAnswers = ref([]);
const answerSubmitted = ref(false);
const answerError = ref("");

// Unforeseen event coin-flip state
const eventNumber = ref(null);
const coinFlipResult = ref("");
const hasFlipped = ref(false);

const careers = ref([]);
const selectedCareer = ref("");
const careerConfirmed = ref(false);
const careersLoading = ref(false);
const careersError = ref("");
const careerSearch = ref("");
const selectedEducationLevel = ref("");

const careerDetails = ref(null);
const detailsLoading = ref(false);
const detailsError = ref("");
const monthlyIncome = ref(null);

const educationLevels = computed(() => {
  return [
    ...new Set(
      careers.value
        .map((career) => career.education_level?.trim())
        .filter(Boolean),
    ),
  ].sort();
});

const filteredCareers = computed(() => {
  const query = careerSearch.value.trim().toLowerCase();

  return careers.value.filter((career) => {
    const matchesEducation =
      !selectedEducationLevel.value ||
      career.education_level === selectedEducationLevel.value;

    const matchesSearch =
      career.title.toLowerCase().includes(query);

    return matchesEducation && matchesSearch;
  });
});

let socket = null;

async function joinGame() {
  if (!gameCode.value.trim() || !playerName.value.trim()) {
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
      socket.send(JSON.stringify({ type: "join", name }));

      gameCode.value = code;
      playerName.value = name;
      joined.value = true;
      setFullScreenGame?.(true);
      connectionStatus.value = "Connected to game";
    });

    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);

      console.log("Message from server:", data);

      if (data.type === "joined") {
        console.log("Player ID:", data.playerId);
      }

      if (data.type === "career-selection-started") {
        careerSelectionStarted.value = true;
        loadCareers();
      }

      if (data.type === "career-confirmed") {
        careerConfirmed.value = true;
        loadCareerDetails(data.socCode);
      }

      if (data.type === "game-started") {
        gameStarted.value = true;
      }

      if (data.type === "game-state") {
        const questionChanged =
          data.phase === "question" &&
          (
            gamePhase.value !== "question" ||
            currentQuestionNumber.value !== data.currentQuestionNumber
          );
        const incomingPhase = data.phase;

        if (
          incomingPhase !== "leaderboard" ||
          gamePhase.value !== "coinflip"
        ) {
          gamePhase.value = incomingPhase;
        }
        currentQuestion.value = data.currentQuestion;
        currentQuestionNumber.value = data.currentQuestionNumber;
        answeredCount.value = data.answeredCount;
        playerCount.value = data.playerCount;
        lastEvent.value = data.lastEvent;

        // Track the active unforeseen event.
        if (
          data.phase === "coinflip" &&
          data.eventNumber !== eventNumber.value
        ) {
          eventNumber.value = data.eventNumber;
          coinFlipResult.value = "";
          hasFlipped.value = false;
        }

        if (
          data.phase === "question" ||
          data.phase === "leaderboard" ||
          data.phase === "finished"
        ) {
          gameStarted.value = true;
        }

        if (questionChanged) {
          selectedAnswers.value = [];
          answerSubmitted.value = false;
          answerError.value = "";
        }
      }

      if (data.type === "answer-received") {
        answerSubmitted.value = true;
        answerError.value = "";
      }

      // Receive this player's private coin-flip result.
      if (data.type === "coin-flip-result") {
        eventNumber.value = data.eventNumber;
        coinFlipResult.value = data.result;
        hasFlipped.value = true;
      }
    });

    socket.addEventListener("close", () => {
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

    // Keep only the fields needed for career selection.
    const uniqueCareers = new Map();

    for (const career of data.careers) {
      const socCode = String(career.soc_code ?? "").trim();

      if (socCode && !uniqueCareers.has(socCode)) {
        uniqueCareers.set(socCode, {
          soc_code: socCode,
          title: career.title,
          education_level: career.education_level,
        });
      }
    }

    careers.value = [...uniqueCareers.values()];
  } catch (error) {
    console.error("Career loading error:", error);
    careersError.value = "Unable to load careers. Please try again.";
  } finally {
    careersLoading.value = false;
  }
}

async function loadCareerDetails(socCode) {
  detailsLoading.value = true;
  detailsError.value = "";
  careerDetails.value = null;
  monthlyIncome.value = null;

  try {
    const response = await fetch(
      `http://localhost:3000/api/careers/details?socCode=${encodeURIComponent(socCode)}`
    );

    if (!response.ok) {
      throw new Error("Unable to load career details.");
    }

    const data = await response.json();

    if (!data.success || !data.career) {
      throw new Error(data.error || "Career details not found.");
    }

    careerDetails.value = data.career;

    const annualWage = Number(data.career.mean_annual_wage);

    if (
      data.career.mean_annual_wage != null &&
      Number.isFinite(annualWage) &&
      annualWage > 0
    ) {
      monthlyIncome.value = calculateMonthlyIncomeBreakdown(annualWage);
    } else {
      monthlyIncome.value = null;
    }
  } catch (error) {
    console.error("Career details error:", error);
    detailsError.value =
      "Unable to load salary information. Please try again.";
  } finally {
    detailsLoading.value = false;
  }
}

async function confirmCareer() {
  if (!selectedCareer.value || careerConfirmed.value) {
    return;
  }

  if (!socket || socket.readyState !== WebSocket.OPEN) {
    careersError.value = "Not connected to the game server.";
    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want this career? You cannot change it after confirming.",
  );

  if (!confirmed) {
    return;
  }

  careersError.value = "";

  try {
    const response = await fetch(
      `http://localhost:3000/api/careers/details?socCode=${encodeURIComponent(selectedCareer.value)}`,
    );

    if (!response.ok) {
      throw new Error("Unable to retrieve career salary.");
    }

    const data = await response.json();

    const annualWage = Number(data.career?.mean_annual_wage);

    if (
      !data.success ||
      !data.career ||
      !Number.isFinite(annualWage) ||
      annualWage <= 0
    ) {
      throw new Error("Salary information is unavailable for this career.");
    }

    const incomeBreakdown =
      calculateMonthlyIncomeBreakdown(annualWage);

    socket.send(
      JSON.stringify({
        type: "confirm-career",
        socCode: selectedCareer.value,
        monthlySpendableIncome:
          incomeBreakdown.monthlySpendableIncome,
      }),
    );
  } catch (error) {
    console.error("Career confirmation error:", error);
    careersError.value =
      error instanceof Error
        ? error.message
        : "Unable to confirm your career. Please try again.";
  }
}

function toggleAnswer(optionId) {
  if (answerSubmitted.value) return;

  const question = currentQuestion.value;

  if (!question) return;

  // Future Preparedness requires exactly two different choices.
  if (currentQuestionNumber.value === 8) {
    const alreadySelected = selectedAnswers.value.includes(optionId);

    if (alreadySelected) {
      selectedAnswers.value = selectedAnswers.value.filter(
        (id) => id !== optionId
      );
    } else if (selectedAnswers.value.length < 2) {
      selectedAnswers.value = [...selectedAnswers.value, optionId];
    }

    return;
  }

  selectedAnswers.value = [optionId];
}

function submitAnswer() {
  if (
    !socket ||
    socket.readyState !== WebSocket.OPEN ||
    answerSubmitted.value ||
    !currentQuestion.value
  ) {
    return;
  }

  const isMultiSelect = currentQuestionNumber.value === 8;

  if (
    selectedAnswers.value.length === 0 ||
    (isMultiSelect && selectedAnswers.value.length !== 2)
  ) {
    answerError.value = isMultiSelect
      ? "Choose exactly two different options."
      : "Please select an answer.";
    return;
  }

  socket.send(
    JSON.stringify({
      type: "submit-answer",
      ...(isMultiSelect
        ? { optionIds: selectedAnswers.value }
        : { optionId: selectedAnswers.value[0] }),
    }),
  );
}

function flipCoin() {
  if (
    !socket ||
    socket.readyState !== WebSocket.OPEN ||
    gamePhase.value !== "coinflip" ||
    hasFlipped.value
  ) {
    return;
  }

  socket.send(
    JSON.stringify({
      type: "flip-coin",
    }),
  );
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
              <div v-if="!careerSelectionStarted">

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

              <!-- GAME STARTED / CAREER SELECTION -->
              <div v-else-if="!gameStarted">
                <template v-if="!careerConfirmed">
                  <p
                    class="text-uppercase fw-bold mb-2"
                    style="color: #b88922;"
                  >
                    The Game Has Begun
                  </p>

                  <h2 class="display-6 fw-bold text-primary mb-3">
                    CHOOSE YOUR CAREER
                  </h2>

                  <div class="game-title-divider small-divider"></div>

                  <p class="text-secondary">
                    Welcome, <strong>{{ playerName }}</strong>.
                    Choose carefully. You can change your selection until you confirm.
                  </p>

                  <div v-if="careersLoading" class="alert alert-light border">
                    Loading careers...
                  </div>

                  <div v-else-if="careersError" class="alert alert-danger">
                    {{ careersError }}

                    <button
                      type="button"
                      class="btn btn-outline-danger mt-2"
                      @click="loadCareers"
                    >
                      Try Again
                    </button>
                  </div>
                  <template v-else>
                    <!-- EDUCATION LEVEL FILTER -->
                    <div class="mb-3 text-start">
                      <label
                        for="education-filter"
                        class="form-label fw-bold text-primary"
                      >
                        FILTER BY EDUCATION LEVEL
                      </label>

                      <select
                        id="education-filter"
                        v-model="selectedEducationLevel"
                        class="form-select form-select-lg"
                      >
                        <option value="">All Education Levels</option>

                        <option
                          v-for="level in educationLevels"
                          :key="level"
                          :value="level"
                        >
                          {{ level }}
                        </option>
                      </select>
                    </div>

                    <!-- CAREER SEARCH -->
                    <div v-if="!selectedEducationLevel" class="mb-3 text-start">
                      <label
                        for="career-search"
                        class="form-label fw-bold text-primary"
                      >
                        SEARCH CAREERS
                      </label>

                      <input
                        id="career-search"
                        v-model="careerSearch"
                        type="search"
                        class="form-control form-control-lg"
                        placeholder="Search by career title..."
                        autocomplete="off"
                      />
                    </div>

                    <!-- FILTERED CAREER LIST -->
                    <div
                      class="career-list text-start mt-4 pt-3 border-top"
                      style="max-height: 300px; overflow-y: auto;"
                    >
                      <div class="small text-secondary fw-bold mb-2">
                        AVAILABLE CAREERS
                      </div>
                      <button
                        v-for="career in filteredCareers"
                        :key="career.soc_code"
                        type="button"
                        class="career-option"
                        :class="{
                          'career-option-selected':
                            selectedCareer === career.soc_code
                        }"
                        @click="selectedCareer = career.soc_code"
                      >
                        <span>{{ career.title }}</span>

                        <span v-if="selectedCareer === career.soc_code">
                          ✓ Selected
                        </span>
                      </button>
                    </div>
                    <p
                      v-if="filteredCareers.length === 0"
                      class="text-secondary mt-3"
                    >
                      No matching careers found. Try another search.
                    </p>

                    <button
                      type="button"
                      class="btn btn-warning btn-lg w-100 fw-bold py-3 mt-4"
                      :disabled="!selectedCareer"
                      @click="confirmCareer"
                    >
                      CONFIRM CAREER
                    </button>
                  </template>
                </template>

                <template v-else>
                  <p
                    class="text-uppercase fw-bold mb-2"
                    style="color: #b88922;"
                  >
                    Career Confirmed
                  </p>

                  <h2 class="display-6 fw-bold text-primary mb-3">
                    YOU'RE COMMITTED!
                  </h2>

                  <div class="game-title-divider small-divider"></div>

                  <div v-if="detailsLoading" class="alert alert-light border">
                    Loading your career details...
                  </div>

                  <div v-else-if="detailsError" class="alert alert-danger">
                    {{ detailsError }}

                    <button
                      type="button"
                      class="btn btn-outline-danger mt-2"
                      @click="loadCareerDetails(selectedCareer)"
                    >
                      Try Again
                    </button>
                  </div>

                  <div v-else-if="careerDetails" class="text-start">
                    <h3 class="text-primary text-center mb-4">
                      {{ careerDetails.occupation_title || careerDetails.title }}
                    </h3>

                    <div class="card border-0 bg-light mb-3">
                      <div class="card-body text-center">
                        <p class="text-secondary mb-1">Mean Annual Salary</p>
                        <h3 class="text-primary fw-bold">
                          {{
                            careerDetails.mean_annual_wage != null
                              ? Number(careerDetails.mean_annual_wage).toLocaleString(
                                  "en-US",
                                  { style: "currency", currency: "USD", maximumFractionDigits: 0 }
                                )
                              : "Not available"
                          }}
                        </h3>

                        <p class="text-secondary mb-0">
                          Mean Monthly Gross Income:
                          <strong>
                            {{
                              careerDetails.mean_annual_wage != null
                                ? (Number(careerDetails.mean_annual_wage) / 12).toLocaleString(
                                    "en-US",
                                    { style: "currency", currency: "USD", maximumFractionDigits: 0 }
                                  )
                                : "Not available"
                            }}
                          </strong>
                        </p>
                      </div>
                      <div v-if="monthlyIncome" class="card border-0 bg-light mb-3">
                        <div class="card-body text-start">
                          <h4 class="text-primary fw-bold mb-3">
                            Monthly Income Breakdown
                          </h4>

                          <div class="d-flex justify-content-between mb-2">
                            <span>Gross income</span>
                            <strong>{{ monthlyIncome.monthlyGrossIncome.toLocaleString("en-US", { style: "currency", currency: "USD" }) }}</strong>
                          </div>

                          <div class="d-flex justify-content-between mb-2">
                            <span>Federal income tax</span>
                            <span>{{ monthlyIncome.monthlyFederalTax.toLocaleString("en-US", { style: "currency", currency: "USD" }) }}</span>
                          </div>

                          <div class="d-flex justify-content-between mb-2">
                            <span>Social Security</span>
                            <span>{{ monthlyIncome.monthlySocialSecurityTax.toLocaleString("en-US", { style: "currency", currency: "USD" }) }}</span>
                          </div>

                          <div class="d-flex justify-content-between mb-2">
                            <span>Medicare</span>
                            <span>{{ monthlyIncome.monthlyMedicareTax.toLocaleString("en-US", { style: "currency", currency: "USD" }) }}</span>
                          </div>

                          <div class="d-flex justify-content-between mb-2">
                            <span>South Carolina income tax</span>
                            <span>{{ monthlyIncome.monthlySouthCarolinaTax.toLocaleString("en-US", { style: "currency", currency: "USD" }) }}</span>
                          </div>

                          <hr />

                          <div class="d-flex justify-content-between mb-2">
                            <span>Total estimated taxes</span>
                            <strong>{{ monthlyIncome.monthlyTotalTaxes.toLocaleString("en-US", { style: "currency", currency: "USD" }) }}</strong>
                          </div>

                          <div class="d-flex justify-content-between mb-2">
                            <span>Net income after taxes</span>
                            <strong>{{ monthlyIncome.monthlyNetAfterTaxes.toLocaleString("en-US", { style: "currency", currency: "USD" }) }}</strong>
                          </div>

                          <div class="d-flex justify-content-between mb-2">
                            <span>Tithe (10% of gross)</span>
                            <span>{{ monthlyIncome.monthlyTithe.toLocaleString("en-US", { style: "currency", currency: "USD" }) }}</span>
                          </div>

                          <hr />

                          <div class="d-flex justify-content-between text-success">
                            <strong>Monthly spendable income</strong>
                            <strong>{{ monthlyIncome.monthlySpendableIncome.toLocaleString("en-US", { style: "currency", currency: "USD" }) }}</strong>
                          </div>

                          <p class="text-secondary small mt-3 mb-0">
                            Estimated figures for gameplay. Actual taxes may vary.
                          </p>
                        </div>
                      </div>
                    </div>

                    <p class="text-secondary small">
                      Wage data:
                      {{ careerDetails.data_year || "Year unavailable" }}
                      {{ careerDetails.data_period || "" }}
                      <br />
                      Source: {{ careerDetails.source || careerDetails.data_source || "BLS data" }}
                    </p>

                    <p class="text-secondary text-center mb-0">
                      Your career is locked in. You can review these details while waiting for
                      the host to start gameplay.
                    </p>
                  </div>
                </template>
              </div>
              
              <!-- MULTIPLAYER GAMEPLAY -->
              <div v-else class="text-start">
                <template v-if="gamePhase === 'question' && currentQuestion">
                  <p class="text-uppercase fw-bold mb-2 text-center"
                    style="color: #b88922;">
                    Question {{ currentQuestionNumber }}
                  </p>

                  <h2 class="text-primary fw-bold text-center mb-4">
                    {{ currentQuestion.text || currentQuestion.title || currentQuestion.question || "Question text unavailable" }}
                  </h2>

                  <p v-if="currentQuestionNumber === 8"
                    class="text-secondary text-center">
                    Select exactly two different options.
                  </p>

                  <div class="d-grid gap-3">
                    <button
                      v-for="option in currentQuestion.options"
                      :key="option.id"
                      type="button"
                      class="player-answer-option"
                      :class="{
                        'player-answer-selected':
                          selectedAnswers.includes(option.id)
                      }"
                      :disabled="answerSubmitted"
                      @click="toggleAnswer(option.id)"
                    >
                      {{ option.text || option.label || option.title || "Option text unavailable" }}
                      <span v-if="selectedAnswers.includes(option.id)"> ✓</span>
                    </button>
                  </div>

                  <p v-if="answerError"
                    class="text-danger text-center mt-3">
                    {{ answerError }}
                  </p>

                  <button
                    v-if="!answerSubmitted"
                    type="button"
                    class="btn btn-warning btn-lg w-100 fw-bold py-3 mt-4"
                    @click="submitAnswer"
                  >
                    SUBMIT ANSWER
                  </button>

                  <div v-else class="alert alert-success mt-4 text-center">
                    Answer submitted! Waiting for the other players and the host.
                  </div>
                </template>

                <!-- UNFORESEEN EVENT COIN FLIP -->
                <template v-else-if="gamePhase === 'coinflip'">
                  <div class="text-center py-4">
                    <p
                      class="text-uppercase fw-bold mb-2"
                      style="color: #b88922;"
                    >
                      UNFORESEEN EVENT
                    </p>

                    <h2 class="text-primary fw-bold mb-3">
                      Event #{{ eventNumber }}
                    </h2>

                    <div class="game-title-divider small-divider"></div>

                    <p class="text-secondary mt-4">
                      Something unexpected has happened!
                      Flip the coin to discover how it affects your finances.
                    </p>

                    <div class="my-4">
                      <div
                        class="coin-display mx-auto"
                        :class="{ 'coin-flipped': hasFlipped }"
                      >
                        {{ hasFlipped ? (coinFlipResult.startsWith('HEADS') ? 'H' : 'T') : '?' }}
                      </div>
                    </div>

                    <button
                      v-if="!hasFlipped"
                      type="button"
                      class="btn btn-warning btn-lg w-100 fw-bold py-3 mt-3"
                      @click="flipCoin"
                    >
                      FLIP THE COIN
                    </button>

                    <div
                      v-else
                      class="alert alert-success mt-4"
                      role="status"
                    >
                      <h3 class="fw-bold">YOUR RESULT</h3>
                      <p class="mb-0">{{ coinFlipResult }}</p>
                      <p class="mt-3 mb-0">
                        Your result is recorded. Waiting for the other players to flip...
                      </p>
                    </div>
                  </div>
                </template>

                <template v-else-if="gamePhase === 'leaderboard'">
                  <h2 class="text-primary fw-bold text-center mb-3">
                    ANSWER SUBMITTED
                  </h2>

                  <p class="text-secondary text-center">
                    The host is reviewing the leaderboard. The next question will
                    begin when the host advances the game.
                  </p>

                  <p v-if="lastEvent" class="alert alert-info">
                    {{ lastEvent }}
                  </p>
                </template>

                <template v-else-if="gamePhase === 'finished'">
                  <h2 class="text-primary fw-bold text-center mb-3">
                    GAME COMPLETE!
                  </h2>

                  <p class="text-secondary text-center">
                    The host has finished the game. Thanks for playing!
                  </p>
                </template>

                <template v-else>
                  <p class="text-secondary text-center">
                    Waiting for the host to begin the next question...
                  </p>
                </template>
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

.career-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  max-height: 320px;
  overflow-y: auto;
  margin-top: 1.25rem;
  padding: 2px;
}

.career-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  padding: 0.85rem 1rem;
  border: 2px solid #dee2e6;
  border-radius: 0.65rem;
  background: #fff;
  color: #123f73;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.career-option:hover {
  border-color: #b88922;
}

.career-option-selected {
  border-color: #b88922;
  background-color: #fff6df;
}

.career-option:focus-visible {
  outline: 3px solid #123f73;
  outline-offset: 2px;
}

.career-option:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
.player-answer-option {
  width: 100%;
  padding: 1rem;
  border: 2px solid #dee2e6;
  border-radius: 0.75rem;
  background: #fff;
  color: #123f73;
  font-size: 1rem;
  font-weight: 650;
  text-align: left;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.player-answer-option:hover:not(:disabled) {
  border-color: #b88922;
}

.player-answer-selected {
  border-color: #b88922;
  background: #fff6df;
}

.player-answer-option:disabled {
  cursor: not-allowed;
  opacity: 0.8;
}

.coin-display {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 150px;
  height: 150px;
  border: 8px solid #b88922;
  border-radius: 50%;
  background: linear-gradient(145deg, #ffe7a3, #d6a84f);
  color: #123f73;
  font-size: 4rem;
  font-weight: 900;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.coin-flipped {
  animation: coin-land 0.4s ease-out;
}

@keyframes coin-land {
  from {
    transform: rotateY(180deg) scale(0.8);
  }

  to {
    transform: rotateY(0deg) scale(1);
  }
}
</style>