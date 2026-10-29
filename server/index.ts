import { handleBlsRequest } from "./routes/bls";
import { handleCareerRequest } from "./routes/careers";
import { handleCareerDetailsRequest } from "./routes/careerDetails";
import { ServerWebSocket } from "bun";

type SocketData = {
  gameCode: string;
  role: "host" | "player";
  playerId?: string;
};

type Player = {
  id: string;
  name: string;
  socket?: ServerWebSocket<SocketData>;
  careerConfirmed: boolean;
  careerSocCode?: string;

  careerTitle?: string;
  educationLevel?: string;
  monthlySpendableIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  balance: number;
  eventBalanceAdjustment: number;
  currentEventAmount?: number;
  housingChoice?: string;
  eventHistory: string[];
    decisionHistory: {
    questionNumber: number;
    questionTitle: string;
    selectedOptions: {
      id: string;
      label: string;
      monthlyCost: number;
    }[];
  }[];
  retirementAge?: number;
  retirementSavingsPercent?: number;
  shortTermSavingsPercent?: number;
  technologyChoices?: string[];
  futurePreparednessChoices?: string[];
  currentAnswer?: string;
  answeredQuestion?: number;
  flippedEvents: number[];
};

type Question = {
  id: number;
  title: string;
  description: string;
  selectionMode: "single" | "multiple";
  requiredSelections: number;
  options: {
    id: string;
    label: string;
    cost: number;
    effect?: "retirement" | "short-term-savings";
    percentage?: number;
    retirementAge?: number;
  }[];
};

const QUESTIONS: Question[] = [
  {
    id: 1,
    title: "Choose Your Home",
    description: "Choose the home that fits your lifestyle and budget.",
    selectionMode: "single",
    requiredSelections: 1,
    options: [
      { id: "apartment", label: "Apartment — $1,200 rent + $250 utilities", cost: 1450 },
      { id: "townhouse", label: "Townhouse — $1,800 rent + $320 utilities", cost: 2120 },
      { id: "single-family", label: "Single Family Home — $2,500 rent + $400 utilities", cost: 2900 },
    ],
  },
  {
    id: 2,
    title: "Choose Your Transportation",
    description: "Choose your transportation and monthly costs.",
    selectionMode: "single",
    requiredSelections: 1,
    options: [
      { id: "bus", label: "Bus — $200 payment + $0 fuel/maintenance", cost: 200 },
      { id: "hand-me-down", label: "Hand-Me-Down car — $250 payment + $150 fuel/maintenance", cost: 400 },
      { id: "used-car", label: "Used Car — $350 payment + $250 fuel/maintenance", cost: 600 },
      { id: "new-car", label: "New Car — $550 payment + $350 fuel/maintenance", cost: 900 },
    ],
  },
  {
    id: 3,
    title: "Choose When You Retire",
    description: "Choose your retirement age and monthly savings percentage.",
    selectionMode: "single",
    requiredSelections: 1,
    options: [
      { id: "retire-50", label: "Retire at 50 — save 5% monthly", cost: 0, effect: "retirement", percentage: 5, retirementAge: 50 },
      { id: "retire-60", label: "Retire at 60 — save 3% monthly", cost: 0, effect: "retirement", percentage: 3, retirementAge: 60 },
      { id: "retire-72", label: "Retire at 72 — save 2% monthly", cost: 0, effect: "retirement", percentage: 2, retirementAge: 72 },
    ],
  },
  {
    id: 4,
    title: "Choose How Much You Save",
    description: "Choose your short-term savings rate.",
    selectionMode: "single",
    requiredSelections: 1,
    options: [
      { id: "minimal-saver", label: "Minimal Saver — 5% monthly", cost: 0, effect: "short-term-savings", percentage: 5 },
      { id: "average-saver", label: "Average Saver — 10% monthly", cost: 0, effect: "short-term-savings", percentage: 10 },
      { id: "aggressive-saver", label: "Aggressive Saver — 15% monthly", cost: 0, effect: "short-term-savings", percentage: 15 },
    ],
  },
  {
    id: 5,
    title: "Choose Your Technology",
    description: "Select any technology options you want.",
    selectionMode: "multiple",
    requiredSelections: 1,
    options: [
      { id: "cell-phone", label: "Cell Phone — $45/month", cost: 45 },
      { id: "internet", label: "High-Speed Internet — $60/month", cost: 60 },
      { id: "gaming-subscription", label: "Gaming subscription — $20/month", cost: 20 },
      { id: "streaming", label: "Netflix / Amazon Prime / Hulu / Disney+ — $50/month", cost: 50 },
    ],
  },
  {
    id: 6,
    title: "Choose Your Meals",
    description: "Choose your food and dining lifestyle.",
    selectionMode: "single",
    requiredSelections: 1,
    options: [
      { id: "great-value", label: "Great Value + eating out once a week — $400/month", cost: 400 },
      { id: "name-brand", label: "Name Brand + occasional eating out — $600/month", cost: 600 },
      { id: "eat-out-half", label: "Eat out 50% of the time — $1,000/month", cost: 1000 },
      { id: "eat-out-most", label: "Eat out most of the time — $1,300/month", cost: 1300 },
    ],
  },
  {
    id: 7,
    title: "Choose Your Clothes",
    description: "Choose your clothing budget.",
    selectionMode: "single",
    requiredSelections: 1,
    options: [
      { id: "lounge-wear", label: "Lounge Wear — $60/month", cost: 60 },
      { id: "business-casual", label: "Business Casual — $100/month", cost: 100 },
      { id: "business-professional", label: "Business Professional — $150/month", cost: 150 },
    ],
  },
  {
    id: 8,
    title: "Future Preparedness",
    description: "Choose exactly TWO different options for your future.",
    selectionMode: "multiple",
    requiredSelections: 2,
    options: [
      { id: "children-daycare", label: "2.5 Children in Daycare — $2,702.50/month", cost: 2702.5 },
      { id: "timeshare", label: "Beautiful Timeshare Vacation — $100/month", cost: 100 },
      { id: "disney-trips", label: "Semi-Regular Disney World Trips — $200/month", cost: 200 },
      { id: "midlife-crisis", label: "Mid-Life Crisis — $400/month", cost: 400 },
    ],
  },
];

type Game = {
  code: string;
  players: Player[];
  host?: ServerWebSocket<SocketData>;
  phase:
    | "lobby"
    | "career-selection"
    | "question"
    | "coinflip"
    | "leaderboard"
    | "finished";
  currentQuestion: number;
  isPaused: boolean;
  lastEvent?: string;
  pendingEvent?: number;
};

const games = new Map<string, Game>();

function generateGameCode() {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  do {
    code = "";

    for (let i = 0; i < 6; i++) {
      code += characters[
        Math.floor(Math.random() * characters.length)
      ];
    }
  } while (games.has(code));

  return code;
}

function sendToRoom(game: Game, payload: object) {
  const message = JSON.stringify(payload);

  game.host?.send(message);

  for (const player of game.players) {
    player.socket?.send(message);
  }
}

function getPublicPlayers(game: Game) {
  return game.players.map((player) => ({
    id: player.id,
    name: player.name,
    careerConfirmed: player.careerConfirmed,
    careerSocCode: player.careerSocCode,
    careerTitle: player.careerTitle,
    educationLevel: player.educationLevel,
    monthlySpendableIncome: player.monthlySpendableIncome,
    monthlyExpenses: player.monthlyExpenses,
    monthlySavings: player.monthlySavings,
    balance: player.balance,
    currentEventAmount: player.currentEventAmount,
    housingChoice: player.housingChoice,
    eventHistory: player.eventHistory,
    decisionHistory: player.decisionHistory,
    eventFlipped:
      game.pendingEvent !== undefined &&
      player.flippedEvents.includes(game.pendingEvent),
    answered:
      player.answeredQuestion === game.currentQuestion,
  }));
}

function broadcastGameState(game: Game) {
  sendToRoom(game, {
    type: "game-state",
    phase: game.phase,
    currentQuestion:
      game.phase === "question"
        ? QUESTIONS[game.currentQuestion - 1] ?? null
        : null,
    currentQuestionNumber: game.currentQuestion,
    isPaused: game.isPaused,
    lastEvent: game.lastEvent ?? null,
    answeredCount: game.players.filter(
      (player) =>
        player.answeredQuestion === game.currentQuestion,
    ).length,
    playerCount: game.players.length,
    eventNumber: game.pendingEvent ?? null,
    eventFlipCount: game.players.filter(
      (player) =>
        game.pendingEvent !== undefined &&
        player.flippedEvents.includes(game.pendingEvent),
    ).length,
    players: getPublicPlayers(game),
    });
}

function sendPlayersUpdated(game: Game) {
  game.host?.send(
    JSON.stringify({
      type: "players-updated",
      players: game.players.map((player) => ({
        id: player.id,
        name: player.name,
        careerConfirmed: player.careerConfirmed,
        careerSocCode: player.careerSocCode,
        careerTitle: player.careerTitle,
        educationLevel: player.educationLevel,
        monthlySpendableIncome: player.monthlySpendableIncome,
        monthlyExpenses: player.monthlyExpenses,
        balance: player.balance,
        housingChoice: player.housingChoice,
        eventHistory: player.eventHistory,
      })),
    }),
  );
}

function allPlayersConfirmed(game: Game) {
  return (
    game.players.length > 0 &&
    game.players.every((player) => player.careerConfirmed)
  );
}

const server = Bun.serve<SocketData>({
  hostname: "0.0.0.0",
  port: 3000,

  async fetch(request, server) {
    const url = new URL(request.url);

    /*
     * WebSocket connection
     */
    if (url.pathname === "/ws") {
      const gameCode = url.searchParams.get("gameCode");
      const role = url.searchParams.get("role");

      if (
        !gameCode ||
        (role !== "host" && role !== "player")
      ) {
        return new Response("Invalid WebSocket connection.", {
          status: 400,
        });
      }

      const game = games.get(gameCode);

      if (!game) {
        return new Response("Game not found.", {
          status: 404,
        });
      }

      const upgraded = server.upgrade(request, {
        data: {
          gameCode,
          role,
        },
      });

      if (upgraded) {
        return undefined;
      }

      return new Response("WebSocket upgrade failed.", {
        status: 500,
      });
    }

    /*
     * BLS API
     */
    const blsResponse = await handleBlsRequest(request);

    if (blsResponse) {
      return blsResponse;
    }

    /*
     * Career API
     */
    const careerResponse = handleCareerRequest(request);

    if (careerResponse) {
      return careerResponse;
    }

    /*
     * Career Details API
     */
    const careerDetailsResponse =
      handleCareerDetailsRequest(request);

    if (careerDetailsResponse) {
      return careerDetailsResponse;
    }

    /*
     * Create Game
     */
    if (
      url.pathname === "/api/games" &&
      request.method === "POST"
    ) {
      const code = generateGameCode();

      const game: Game = {
        code,
        players: [],
        phase: "lobby",
        currentQuestion: 0,
        isPaused: false,
      };

      games.set(code, game);

      return Response.json(
        {
          success: true,
          gameCode: code,
          players: [],
        },
        {
          headers: {
            "Access-Control-Allow-Origin":
              request.headers.get("origin") === "http://localhost:5173" ||
              request.headers.get("origin") === "http://192.168.1.239:5173"
                ? request.headers.get("origin")!
                : "http://localhost:5173",
            "Access-Control-Allow-Methods":
              "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers":
              "Content-Type",
          },
        },
      );
    }

    /*
     * Check Game
     */
    if (
      url.pathname.startsWith("/api/games/") &&
      request.method === "GET"
    ) {
      const origin = request.headers.get("origin");
      const allowedOrigin =
        origin === "http://localhost:5173" ||
        origin === "http://192.168.1.239:5173"
          ? origin
          : "http://localhost:5173";

      const gameCode = url.pathname
        .split("/")
        .pop()
        ?.toUpperCase();

      if (!gameCode) {
        return Response.json(
          { error: "Game code is required." },
          { status: 400 },
        );
      }

      const game = games.get(gameCode);

      if (!game) {
        return Response.json(
          {
            error: "Game not found.",
          },
          {
            status: 404,
            headers: {
              "Access-Control-Allow-Origin": allowedOrigin,
              "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type",
            },
          },
        );
      }

      return Response.json(
        {
          success: true,
          gameCode: game.code,
          players: game.players,
        },
        {
          headers: {
            "Access-Control-Allow-Origin": allowedOrigin,
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        },
      );
    }

    /*
     * Health check
     */
    if (url.pathname === "/api/health") {
      return Response.json(
        {
          status: "ok",
          message: "CSU Senior Project API is running!",
        },
        {
          headers: {
            "Access-Control-Allow-Origin":
              "http://localhost:5173",
            "Access-Control-Allow-Methods":
              "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers":
              "Content-Type",
          },
        },
      );
    }

    /*
     * CORS
     */
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin":
            "http://localhost:5173",
          "Access-Control-Allow-Methods":
            "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type",
        },
      });
    }

    return new Response("CSU Senior Project API");
  },

  websocket: {
    open(ws) {
      console.log(
        `WebSocket connected: ${ws.data.role} - ${ws.data.gameCode}`,
      );

      if (ws.data.role === "host") {
        const game = games.get(ws.data.gameCode);

        if (game) {
          game.host = ws;
        }
      }
    },

  
  message(ws, message) {
    try {
      const data = JSON.parse(message.toString());
      const game = games.get(ws.data.gameCode);

      if (!game) {
        ws.close();
        return;
      }

      // Only the host can start either phase.
      if (data.type === "start-game") {
        if (ws.data.role !== "host" || game.phase !== "lobby") {
          return;
        }

        game.phase = "career-selection";

        ws.send(
          JSON.stringify({
            type: "career-selection-started",
          }),
        );

        for (const player of game.players) {
          player.socket?.send(
            JSON.stringify({
              type: "career-selection-started",
            }),
          );
        }

        return;
      }

      // Only the host can control game progression.
      if (data.type === "next-question") {
        if (ws.data.role !== "host") {
          return;
        }

        // The host is advancing from the coin-flip event.
        if (game.phase === "coinflip") {
          game.pendingEvent = undefined;

          // After Question 8 and Event 3, show final results.
          if (game.currentQuestion >= QUESTIONS.length) {
            game.phase = "finished";
          } else {
            game.phase = "leaderboard";
          }

          broadcastGameState(game);
          return;
        }

        // The host is advancing from the current question.
        if (game.phase === "question") {
          // Start an unforeseen event after Questions 1, 4, and 8.
          const eventByQuestion: Record<number, number> = {
            1: 1,
            4: 2,
            8: 3,
          };

          const eventNumber = eventByQuestion[game.currentQuestion];

          if (eventNumber !== undefined) {
            game.pendingEvent = eventNumber;
            game.lastEvent =
              `Unforeseen Event #${eventNumber}: Every player must flip a coin.`;
            game.phase = "coinflip";
          } else {
            game.pendingEvent = undefined;
            game.phase = "leaderboard";
          }

          broadcastGameState(game);
          return;
        }

        // The host is advancing from the leaderboard.
        if (game.phase === "leaderboard") {
          // Finish the game after the final question.
          if (game.currentQuestion >= QUESTIONS.length) {
            game.phase = "finished";
            broadcastGameState(game);
            return;
          }

          // Prepare the next question.
          game.currentQuestion += 1;
          game.lastEvent = undefined;
          game.pendingEvent = undefined;

          for (const player of game.players) {
            player.currentAnswer = undefined;
            player.currentEventAmount = undefined;
          }

          game.phase = "question";
          broadcastGameState(game);
          return;
        }
      }

      // A player can confirm a career only once.
      if (data.type === "confirm-career") {
        if (
          ws.data.role !== "player" ||
          game.phase !== "career-selection" ||
          !ws.data.playerId ||
          typeof data.socCode !== "string" ||
          typeof data.monthlySpendableIncome !== "number" ||
          !Number.isFinite(data.monthlySpendableIncome) ||
          data.monthlySpendableIncome <= 0 
        ) {
          return;
        }

        const player = game.players.find(
          (item) => item.id === ws.data.playerId,
        );

        if (!player || player.careerConfirmed) {
          return;
        }

        const socCode = data.socCode.trim();

        if (!socCode) {
          return;
        }

        player.careerSocCode = socCode;
        player.monthlySpendableIncome = data.monthlySpendableIncome;
        player.careerConfirmed = true;

        // Tell this player their choice was accepted.
        ws.send(
          JSON.stringify({
            type: "career-confirmed",
            socCode,
          }),
        );

        // Update the host's player list.
        sendPlayersUpdated(game);

        // Tell the host when every player has confirmed.
        if (allPlayersConfirmed(game)) {
          game.host?.send(
            JSON.stringify({
              type: "all-careers-confirmed",
            }),
          );
        }

        return;
      }

      // Only the host can launch gameplay, and only after
      // every joined player has confirmed a career.
      if (data.type === "launch-game") {
        if (
          ws.data.role !== "host" ||
          game.phase !== "career-selection" ||
          !allPlayersConfirmed(game)
        ) {
          return;
        }

        game.phase = "question";
        game.currentQuestion = 1;
        game.lastEvent = undefined;

        broadcastGameState(game);

        return;
      }

      // Players can join only while the game is in the lobby.
      if (data.type === "join") {
        if (
          ws.data.role !== "player" ||
          game.phase !== "lobby" ||
          typeof data.name !== "string" ||
          !data.name.trim()
        ) {
          ws.close();
          return;
        }

        const playerId = crypto.randomUUID();

        const player: Player = {
          id: playerId,
          name: data.name.trim().slice(0, 20),
          socket: ws,
          careerConfirmed: false,
          monthlySpendableIncome: 0,
          monthlyExpenses: 0,
          monthlySavings: 0,
          balance: 0,
          eventBalanceAdjustment: 0,
          currentEventAmount: undefined,
          eventHistory: [],
          decisionHistory: [],
          flippedEvents: [],
        };

        game.players.push(player);
        ws.data.playerId = playerId;

        ws.send(
          JSON.stringify({
            type: "joined",
            playerId,
            gameCode: game.code,
          }),
        );

        broadcastGameState(game);
      }

      // Each player can flip once for the active unforeseen event.
      if (data.type === "flip-coin") {
        if (
          ws.data.role !== "player" ||
          game.phase !== "coinflip" ||
          !ws.data.playerId ||
          game.pendingEvent === undefined
        ) {
          return;
        }

        const player = game.players.find(
          (item) => item.id === ws.data.playerId,
        );

        if (
          !player ||
          player.flippedEvents.includes(game.pendingEvent)
        ) {
          return;
        }

        const eventNumber = game.pendingEvent;
        const heads = Math.random() < 0.5;
        let result = "";
        player.currentEventAmount = 0;

        if (eventNumber === 1) {
          if (heads) {
            player.eventBalanceAdjustment += 1000;
            player.currentEventAmount = 1000;
            result = "HEADS — You inherited $1,000!";
          } else {
            player.eventBalanceAdjustment -= 1200;
            player.currentEventAmount = -1200;
            result = "TAILS — You paid $1,200 for a fender bender.";
          }
        } else if (eventNumber === 2) {
          if (heads) {
            player.eventBalanceAdjustment -= 500;
            player.currentEventAmount = -500;
            result = "HEADS — You paid $500 for replacement tires.";
          } else {
            player.eventBalanceAdjustment += 1400;
            player.currentEventAmount = 1400;
            result = "TAILS — You received a $1,400 birthday gift!";
          }
                } else if (eventNumber === 3) {
          if (heads) {
            if (player.retirementAge !== undefined) {
              player.retirementAge += 5;
            }

            player.currentEventAmount = 0;
            result =
              "HEADS — The stock market crashed. Retirement is delayed by five years.";
          } else {
            player.monthlySpendableIncome += 1000;
            player.currentEventAmount = 1000;

            result =
              "TAILS — You inherited $1,000 and your monthly income increased by $1,000.";
          }
        } else {
          return;
        }

        // Recalculate the balance immediately after the event.
        player.balance =
          player.monthlySpendableIncome -
          player.monthlyExpenses -
          player.monthlySavings +
          player.eventBalanceAdjustment;

        player.flippedEvents.push(eventNumber);
        player.eventHistory.push(
          `Event #${eventNumber} — ${result}`,
        );

        // Send the outcome privately to this player.
        ws.send(
          JSON.stringify({
            type: "coin-flip-result",
            eventNumber,
            result,
          }),
        );

        // The host controls when the game moves to the leaderboard.
        const everyoneFlipped =
          game.players.length > 0 &&
          game.players.every((item) =>
            item.flippedEvents.includes(eventNumber),
          );

        if (everyoneFlipped) {
          game.lastEvent =
            `Unforeseen Event #${eventNumber} completed. All players have flipped.`;
        }

        broadcastGameState(game);
        return;
      }

      // Players submit their own answer privately.
      if (data.type === "submit-answer") {
        if (
          ws.data.role !== "player" ||
          game.phase !== "question" ||
          !ws.data.playerId
        ) {
          return;
        }

        const player = game.players.find(
          (item) => item.id === ws.data.playerId,
        );

        if (
          !player ||
          player.answeredQuestion === game.currentQuestion
        ) {
          return;
        }

        const question = QUESTIONS[game.currentQuestion - 1];

        if (!question) return;

        // Accept either optionId or optionIds.
        const selectedIds: string[] =
          Array.isArray(data.optionIds)
            ? data.optionIds
            : typeof data.optionId === "string"
              ? [data.optionId]
              : [];

        // Reject duplicate selections.
        if (new Set(selectedIds).size !== selectedIds.length) {
          return;
        }

        // Enforce the required selection count.
        if (
          selectedIds.length < question.requiredSelections ||
          (question.selectionMode === "single" &&
            selectedIds.length !== 1) ||
          (question.id === 8 && selectedIds.length !== 2)
        ) {
          return;
        }

        const selectedOptions = selectedIds.map((id) =>
          question.options.find((option) => option.id === id),
        );

        // Every submitted ID must be a valid option.
        if (selectedOptions.some((option) => !option)) {
          return;
        }

        const options = selectedOptions.filter(
          (option) => option !== undefined,
        );

        // Store all selected answers as a comma-separated string.
        player.currentAnswer = selectedIds.join(",");
        player.answeredQuestion = game.currentQuestion;

        // Save only the options the player selected for the final budget breakdown.
        player.decisionHistory.push({
          questionNumber: question.id,
          questionTitle: question.title,
          selectedOptions: options
            .filter((option) => selectedIds.includes(option.id))
            .map((option) => ({
              id: option.id,
              label: option.label,
              monthlyCost:
                question.id === 3 || question.id === 4
                  ? (player.monthlySpendableIncome * (option.percentage ?? 0)) / 100
                  : option.cost,
            })),
        });
 
        // Save retirement and savings decisions.
        if (question.id === 3) {
          const retirementOption = options[0];

          player.retirementAge = retirementOption.retirementAge;
          player.retirementSavingsPercent = retirementOption.percentage;
        }

        if (question.id === 4) {
          player.shortTermSavingsPercent = options[0].percentage;
        }

        if (question.id === 5) {
          player.technologyChoices = selectedIds;
        }

        if (question.id === 8) {
          player.futurePreparednessChoices = selectedIds;
        }

        // Apply the player's financial decisions.
        if (question.id === 1) {
          player.housingChoice = selectedIds[0];
        }

        if ([1, 2, 5, 6, 7, 8].includes(question.id)) {
          player.monthlyExpenses += options.reduce(
            (total, option) => total + option.cost,
            0,
          );
        }

        // Calculate monthly retirement and short-term savings.
        const retirementSavings =
          (player.monthlySpendableIncome *
            (player.retirementSavingsPercent ?? 0)) /
          100;

        const shortTermSavings =
          (player.monthlySpendableIncome *
            (player.shortTermSavingsPercent ?? 0)) /
          100;

        player.monthlySavings =
          retirementSavings + shortTermSavings;

        // Calculate the player's remaining monthly balance.
        // Preserve all one-time event adjustments.
        player.balance =
          player.monthlySpendableIncome -
          player.monthlyExpenses -
          player.monthlySavings +
          player.eventBalanceAdjustment;

        // Confirm receipt privately.
        ws.send(
          JSON.stringify({
            type: "answer-received",
            questionNumber: game.currentQuestion,
          }),
        );

        broadcastGameState(game);
        return;
      }
    } catch (error) {
      console.error("Invalid WebSocket message:", error);
    }
  },
    close(ws) {
      console.log(
        `WebSocket disconnected: ${ws.data.role} - ${ws.data.gameCode}`,
      );

      if (ws.data.role === "host") {
        const game = games.get(ws.data.gameCode);

        if (game) {
          game.host = undefined;
        }
      }
    },
  },
});

console.log(
  `Backend running at http://localhost:${server.port}`,
);