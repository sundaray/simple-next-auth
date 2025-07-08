import useSWR from "swr";

async function fetcher(url: string) {
  const response = await fetch(url);
  // If the user is not authenticated, the API returns 401.
  // We treat this as a valid state, returning null (no user).
  if (response.status === 401) {
    return null;
  }

  // If the response is not OK for any other reason (e.g., 500), it's a system error.
  // We throw an error, which SWR will catch and place in its `error` state.
  if (!response.ok) {
    const error = new Error("An error occurred while fetching the user data.");
    throw error;
  }

  // If the response is OK (200), we parse the JSON and expect the user data.
  const payload = await response.json();
  return payload.data;
}

export function useUser() {
  const { data, error, isLoading } = useSWR("/api/auth/session", fetcher, {
    shouldRetryOnError: false,
  });

  return {
    loading: isLoading,
    error: error,
    user: data ?? null,
  };
}
