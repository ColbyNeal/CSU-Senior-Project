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
};

type Game = {
  code: string;
  players: Player[];
  host?: ServerWebSocket<SocketData>;
  phase: "lobby" | "career-selection" | "playing";
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

function getPublicPlayers(game: Game) {
  return game.players.map((player) => ({
    id: player.id,
    name: player.name,
    careerConfirmed: player.careerConfirmed,
  }));
}

function sendPlayersUpdated(game: Game) {
  game.host?.send(
    JSON.stringify({
      type: "players-updated",
      players: getPublicPlayers(game),
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
     * Check Game
     */
    if (
      url.pathname.startsWith("/api/games/") &&
      request.method === "GET"
    ) {
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
              "Access-Control-Allow-Origin":
                "http://localhost:5173",
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
            "Access-Control-Allow-Origin":
              "http://localhost:5173",
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

      // A player can confirm a career only once.
      if (data.type === "confirm-career") {
        if (
          ws.data.role !== "player" ||
          game.phase !== "career-selection" ||
          !ws.data.playerId ||
          typeof data.socCode !== "string"
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

        game.phase = "playing";

        ws.send(
          JSON.stringify({
            type: "game-started",
          }),
        );

        for (const player of game.players) {
          player.socket?.send(
            JSON.stringify({
              type: "game-started",
            }),
          );
        }

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

        sendPlayersUpdated(game);
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