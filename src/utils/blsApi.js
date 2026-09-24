const API_BASE_URL = "http://localhost:3000";

export async function getLatestBlsSeries(seriesId) {
  const response = await fetch(
    `${API_BASE_URL}/api/bls/latest?seriesId=${encodeURIComponent(seriesId)}`,
  );

  if (!response.ok) {
    throw new Error("Unable to retrieve BLS data.");
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "BLS request failed.");
  }

  return data.series;
}