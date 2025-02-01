import { createClient, cacheExchange, fetchExchange } from "urql";

if (
  !import.meta.env.VITE_APPSYNC_URL ||
  !import.meta.env.VITE_APPSYNC_API_KEY
) {
  throw new Error(
    "AppSync URL and API key must be set in environment variables"
  );
}

export const client = createClient({
  url: import.meta.env.VITE_APPSYNC_URL,
  fetchOptions: {
    headers: {
      "x-api-key": import.meta.env.VITE_APPSYNC_API_KEY,
    },
  },
  exchanges: [cacheExchange, fetchExchange],
});
