
import { getLatestSeries } from "../services/blsService";

function getAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) return "http://localhost:5173";

  try {
    const url = new URL(origin);

    const isLocalhost =
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1";

    const isLocalNetwork =
      /^10\.(?:\d{1,3}\.){2}\d{1,3}$/.test(url.hostname) ||
      /^192\.168\.(?:\d{1,3}\.)\d{1,3}$/.test(url.hostname) ||
      /^172\.(?:1[6-9]|2\d|3[01])\.(?:\d{1,3}\.)\d{1,3}$/.test(url.hostname);

    const isRenderFrontend =
      url.protocol === "https:" &&
      url.hostname.endsWith(".onrender.com");

    if (
      (url.protocol === "http:" &&
        url.port === "5173" &&
        (isLocalhost || isLocalNetwork)) ||
      isRenderFrontend
    ) {
      return origin;
    }
  } catch {
    // Use the default origin for invalid URLs.
  }

  return "http://localhost:5173";
}

export async function handleBlsRequest(request: Request) {
  const url = new URL(request.url);

  if (url.pathname !== "/api/bls/latest") {
    return null;
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": getAllowedOrigin(request),
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (request.method !== "GET") {
    return Response.json(
      { error: "Method not allowed." },
      { status: 405, headers: corsHeaders },
    );
  }

  const seriesId = url.searchParams.get("seriesId");

  if (!seriesId) {
    return Response.json(
      { error: "A BLS seriesId is required." },
      { status: 400, headers: corsHeaders },
    );
  }

  try {
    const series = await getLatestSeries(seriesId);

    return Response.json(
      {
        success: true,
        series,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("BLS API error:", error);

    return Response.json(
      {
        success: false,
        error: "Unable to retrieve BLS data.",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}
