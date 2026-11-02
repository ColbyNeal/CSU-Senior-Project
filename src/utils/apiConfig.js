
const localApiBase = `${window.location.protocol}//${window.location.hostname}:3000`;

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || localApiBase
).replace(/\/+$/, "");

export const WS_BASE_URL = API_BASE_URL
  .replace(/^http:/, "ws:")
  .replace(/^https:/, "wss:");
