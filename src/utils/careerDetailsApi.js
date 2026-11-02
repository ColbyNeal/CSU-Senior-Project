
import { API_BASE_URL } from "./apiConfig.js";

export async function getCareerDetails(socCode) {
  const response = await fetch(
    `${API_BASE_URL}/api/careers/details?socCode=${encodeURIComponent(socCode)}`,
  );

  if (!response.ok) {
    throw new Error("Unable to retrieve career details.");
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Career details request failed.");
  }

  return data.career;
}
