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
};

type Game = {
  code: string;
  players: Player[];
  host?: ServerWebSocket<SocketData>;
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
    console.log("WebSocket message received:", message.toString());
    
    try {
      const data = JSON.parse(message.toString());

      if (data.type === "start-game") {
        const game = games.get(ws.data.gameCode);

        console.log(
          "Starting game:",
          ws.data.gameCode,
          "Role:",
          ws.data.role,
          "Game exists:",
          !!game,
          "Host exists:",
          !!game?.host,
        );

        if (!game || !game.host) {
          return;
        }

        game.host.send(
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

    if (data.type !== "join") {
      return;
    }

      const game = games.get(ws.data.gameCode);

      if (!game) {
        ws.close();
        return;
      }

      const playerId = crypto.randomUUID();

      const player: Player = {
        id: playerId,
        name: data.name,
        socket: ws,
      };

      game.players.push(player);

      ws.data.playerId = playerId;

      console.log(
        `Player joined game ${game.code}: ${player.name}`,
      );

      if (game.host) {
        game.host.send(
          JSON.stringify({
            type: "players-updated",
            players: game.players,
          }),
        );
      }

      ws.send(
        JSON.stringify({
          type: "joined",
          playerId,
          gameCode: game.code,
        }),
      );
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