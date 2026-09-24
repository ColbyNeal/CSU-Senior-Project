const BLS_API_URL =
  "https://api.bls.gov/publicAPI/v2/timeseries/data/";

interface BLSResponse {
  status: string;
  message?: string[];
  Results?: {
    series?: Array<{
      seriesID: string;
      data: Array<{
        year: string;
        period: string;
        periodName: string;
        value: string;
        footnotes?: Array<{
          code: string | null;
          text: string | null;
        }>;
      }>;
    }>;
  };
}

export async function getLatestSeries(seriesId: string) {
  if (!seriesId) {
    throw new Error("A BLS series ID is required.");
  }

  const url = `${BLS_API_URL}${encodeURIComponent(seriesId)}?latest=true`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`BLS API request failed: ${response.status}`);
  }

  const data = (await response.json()) as BLSResponse;

  if (data.status !== "REQUEST_SUCCEEDED") {
    throw new Error(
      data.message?.join("; ") || "BLS API request failed.",
    );
  }

  return data.Results?.series?.[0] ?? null;
}