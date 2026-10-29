<script setup>
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
const playerId = ref("");
const players = ref([]);
const myPlayer = computed(() =>
  players.value.find((player) => player.id === playerId.value)
);

function formatMoney(amount) {
  return Number(amount ?? 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}
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
      `${window.location.protocol}//${window.location.hostname}:3000/api/games/${code}`,
    );

    if (!response.ok) {
      alert("Game not found. Check the game code and try again.");
      return;
    }

    socket = new WebSocket(
      `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.hostname}:3000/ws?gameCode=${code}&role=player`,
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
        playerId.value = data.playerId;
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
        players.value = data.players ?? [];

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
      `${window.location.protocol}//${window.location.hostname}:3000/api/careers/details?socCode=${encodeURIComponent(socCode)}`,
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
      `${window.location.protocol}//${window.location.hostname}:3000/api/careers/details?socCode=${encodeURIComponent(selectedCareer.value)}`,
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

  // Questions 5 and 8 allow multiple selections.
  const isMultiSelect = [5, 8].includes(
    currentQuestionNumber.value
  );

  if (isMultiSelect) {
    const alreadySelected = selectedAnswers.value.includes(optionId);

    if (alreadySelected) {
      selectedAnswers.value = selectedAnswers.value.filter(
        (id) => id !== optionId
      );
    } else if (
      currentQuestionNumber.value !== 8 ||
      selectedAnswers.value.length < 2
    ) {
      selectedAnswers.value = [
        ...selectedAnswers.value,
        optionId
      ];
    }

    return;
  }

  // All other questions allow one selection.
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

  const isMultiSelect = [5, 8].includes(
  currentQuestionNumber.value
);
const requiresExactlyTwo = currentQuestionNumber.value === 8;

  if (
    selectedAnswers.value.length === 0 ||
    (requiresExactlyTwo && selectedAnswers.value.length !== 2)
  ) {
    answerError.value = requiresExactlyTwo
      ? "Choose exactly two different options."
      : "Please select at least one option.";
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
                  <p
                    v-if="currentQuestionNumber === 5"
                    class="text-secondary text-center"
                  >
                    Select all the technology options you want.
                  </p>
                  <p
                    v-else-if="currentQuestionNumber === 8"
                    class="text-secondary text-center"
                  >
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
                    YOUR FINAL RESULTS
                  </h2>

                  <p class="text-secondary text-center">
                    Here is how your decisions and unforeseen events affected your budget.
                  </p>

                  <div v-if="myPlayer" class="container mt-4">
                    <details class="card p-3 mb-4" open>
                      <summary class="h5 fw-bold">Final Budget Summary</summary>

                      <p>Monthly spendable income:
                        {{ formatMoney(myPlayer.monthlySpendableIncome) }}
                      </p>

                      <p>Monthly expenses:
                        {{ formatMoney(myPlayer.monthlyExpenses) }}
                      </p>

                      <p>Monthly savings:
                        {{ formatMoney(myPlayer.monthlySavings) }}
                      </p>

                      <hr />

                      <p class="fw-bold">
                        Final balance:
                        {{ formatMoney(myPlayer.balance) }}
                      </p>
                    </details>

                    <details class="card p-3 mb-4">
                      <summary class="h5 fw-bold">Your Decisions</summary>

                      <div
                        v-if="myPlayer.decisionHistory?.length"
                        v-for="decision in myPlayer.decisionHistory"
                        :key="decision.questionNumber"
                        class="border-bottom py-3"
                      >
                        <h4 class="h6 fw-bold">
                          Question {{ decision.questionNumber }}: {{ decision.questionTitle }}
                        </h4>

                        <div
                          v-for="option in decision.selectedOptions"
                          :key="option.id"
                          class="d-flex justify-content-between gap-3"
                        >
                          <span>{{ option.label }}</span>
                          <span>{{ formatMoney(option.monthlyCost) }}/month</span>
                        </div>
                      </div>

                      <p v-else class="text-secondary">
                        No decision history is available.
                      </p>
                    </details>

                    <details class="card p-3 mb-4">
                      <summary class="h5 fw-bold">Unforeseen Events</summary>

                      <ul v-if="myPlayer.eventHistory?.length">
                        <li v-for="(event, index) in myPlayer.eventHistory" :key="index">
                          {{ event }}
                        </li>
                      </ul>

                      <p v-else class="text-secondary">
                        No event history is available.
                      </p>
                    </details>
                  </div>

                  <p v-else class="text-secondary text-center">
                    Your final player information is not available.
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