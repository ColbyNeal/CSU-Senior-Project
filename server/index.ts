import { handleBlsRequest } from "./routes/bls";

const server = Bun.serve({
  port: 3000,

  async fetch(request) {
    const url = new URL(request.url);

    const blsResponse = await handleBlsRequest(request);

    if (blsResponse) {
        return blsResponse;
    }

    if (url.pathname === "/api/health") {
      return Response.json(
        {
          status: "ok",
          message: "CSU Senior Project API is running!",
        },
        {
          headers: {
            "Access-Control-Allow-Origin": "http://localhost:5173",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        },
      );
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:5173",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    return new Response("CSU Senior Project API");
  },
});

console.log(`Backend running at http://localhost:${server.port}`);