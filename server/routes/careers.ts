
import { Database } from "bun:sqlite";

const DATABASE_PATH = "data/career_explorer.db";

function getAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) return "http://localhost:5173";

  try {
    const url = new URL(origin);

    const isLocalhost =
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1";

    const isLocalNetwork =
      /^192\.168\.1\.\d+$/.test(url.hostname);

    if (
      url.protocol === "http:" &&
      url.port === "5173" &&
      (isLocalhost || isLocalNetwork)
    ) {
      return origin;
    }
  } catch {
    // Use the default origin for invalid URLs.
  }

  return "http://localhost:5173";
}

export function handleCareerRequest(request: Request) {
  const url = new URL(request.url);

  if (url.pathname !== "/api/careers") {
    return null;
  }

  if (request.method !== "GET") {
    return Response.json(
      { error: "Method not allowed." },
      { status: 405 },
    );
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": getAllowedOrigin(request),
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const database = new Database(DATABASE_PATH, {
      readonly: true,
    });

    const careers = database
      .query(`
        SELECT
          soc_code,
          title,
          education_level
        FROM careers
        ORDER BY title
      `)
      .all();

    database.close();

    return Response.json(
      {
        success: true,
        careers,
      },
      {
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("Career API error:", error);

    return Response.json(
      {
        success: false,
        error: "Unable to retrieve career data.",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}
