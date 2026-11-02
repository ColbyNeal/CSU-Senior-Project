
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

export function handleCareerDetailsRequest(request: Request) {
  const url = new URL(request.url);

  if (url.pathname !== "/api/careers/details") {
    return null;
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": getAllowedOrigin(request),
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method !== "GET") {
    return Response.json(
      { error: "Method not allowed." },
      { status: 405, headers: corsHeaders },
    );
  }

  const socCode = url.searchParams.get("socCode");

  if (!socCode) {
    return Response.json(
      { error: "A socCode is required." },
      { status: 400, headers: corsHeaders },
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
          c.education_level,
          c.data_source,
          c.mapping_type,
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
          b.retrieved_at,
          m.pay_grade,
          m.service_assumption,
          m.monthly_basic_pay,
          m.annual_basic_pay,
          m.pay_year,
          m.source AS military_pay_source,
          m.notes AS military_pay_notes
        FROM careers c
        LEFT JOIN bls_occupation_snapshots b
          ON c.soc_code = b.soc_code
        LEFT JOIN military_pay m
          ON c.soc_code = m.soc_code
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
        { status: 404, headers: corsHeaders },
      );
    }

    return Response.json(
      {
        success: true,
        career,
      },
      {
        headers: corsHeaders,
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
        headers: corsHeaders,
      },
    );
  }
}
