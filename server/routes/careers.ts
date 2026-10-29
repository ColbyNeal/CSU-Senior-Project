import { Database } from "bun:sqlite";

const DATABASE_PATH = "data/career_explorer.db";

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
        headers: {
          "Access-Control-Allow-Origin":
            request.headers.get("origin") === "http://192.168.1.239:5173"
              ? "http://192.168.1.239:5173"
              : "http://localhost:5173",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
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
        headers: {
          "Access-Control-Allow-Origin":
            request.headers.get("origin") === "http://192.168.1.239:5173"
              ? "http://192.168.1.239:5173"
              : "http://localhost:5173",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      },
    );
  }
}