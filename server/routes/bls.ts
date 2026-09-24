import { getLatestSeries } from "../services/blsService";

export async function handleBlsRequest(request: Request) {
  const url = new URL(request.url);

  if (url.pathname !== "/api/bls/latest") {
    return null;
  }

  const seriesId = url.searchParams.get("seriesId");

  if (!seriesId) {
    return Response.json(
      {
        error: "A BLS seriesId is required.",
      },
      { status: 400 },
    );
  }

  try {
    const series = await getLatestSeries(seriesId);

    return Response.json({
      success: true,
      series,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:5173",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("BLS API error:", error);

    return Response.json(
    {
      success: false,
      error: "Unable to retrieve BLS data.",
    },
    {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:5173",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
}