import { Database } from "bun:sqlite";

const DATABASE_PATH = "data/career_explorer.db";

export function handleCareerDetailsRequest(request: Request) {
  const url = new URL(request.url);

  if (url.pathname !== "/api/careers/details") {
    return null;
  }

  if (request.method !== "GET") {
    return Response.json(
      { error: "Method not allowed." },
      { status: 405 },
    );
  }

  const socCode = url.searchParams.get("socCode");

  if (!socCode) {
    return Response.json(
      { error: "A socCode is required." },
      { status: 400 },
    );
  }

  try {
    const database = new Database(DATABASE_PATH, {
      readonly: true,
    });

    const career = database
      .query(`
        SELECT
          c.soc_code,
          c.title,
          b.occupation_title,
          b.data_year,
          b.data_period,
          b.employment,
          b.mean_hourly_wage,
          b.mean_annual_wage,
          b.median_annual_wage,
          b.wage_10th_percentile,
          b.wage_25th_percentile,
          b.wage_75th_percentile,
          b.wage_90th_percentile,
          b.source,
          b.retrieved_at
        FROM careers c
        LEFT JOIN bls_occupation_snapshots b
          ON c.soc_code = b.soc_code
        WHERE c.soc_code = ?
        ORDER BY b.data_year DESC, b.data_period DESC
        LIMIT 1
      `)
      .get(socCode);

    database.close();

    if (!career) {
      return Response.json(
        {
          success: false,
          error: "Career not found.",
        },
        { status: 404 },
      );
    }

    return Response.json(
      {
        success: true,
        career,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:5173",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      },
    );
  } catch (error) {
    console.error("Career details API error:", error);

    return Response.json(
      {
        success: false,
        error: "Unable to retrieve career details.",
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:5173",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      },
    );
  }
}