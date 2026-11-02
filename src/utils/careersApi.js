
import { API_BASE_URL } from "./apiConfig.js";

export async function getCareers() {
  const response = await fetch(`${API_BASE_URL}/api/careers`);

  if (!response.ok) {
    throw new Error("Unable to retrieve career data.");
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Career request failed.");
  }

  return data.careers;
}
