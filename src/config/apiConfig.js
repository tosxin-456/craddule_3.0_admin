const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

export const API_BASE_URL = isLocalhost
    ? "http://localhost:45365/api"
    : "https://console.craduleapi.com.ng/api";
