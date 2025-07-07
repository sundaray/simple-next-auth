import { useEffect, useState } from "react";
import { UserSession } from "@/lib/auth/schema";

type SessionStatus = "loading" | "authenticated" | "unauthenticated" | "error";

type SessionState = {
  user: UserSession | null;
  status: SessionStatus;
  error: Error | null;
};

export function useSession() {
  const [state, setState] = useState<SessionState>({
    user: null,
    status: "loading",
    error: null,
  });

  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();

        if (response.ok && data.success) {
          // User is authenticated
          setState({
            user: data.data, // Note: using 'data.data' based on your API response
            status: "authenticated",
            error: null,
          });
        } else {
          // User is not authenticated (401 or success: false)
          setState({
            user: null,
            status: "unauthenticated",
            error: null,
          });
        }
      } catch (error) {
        // Actual error (network issues, parsing errors, etc.)
        setState({
          user: null,
          status: "error",
          error:
            error instanceof Error
              ? error
              : new Error("An unknown error occurred"),
        });
      }
    }

    fetchSession();
  }, []);

  return {
    user: state.user,
    status: state.status,
    error: state.error,
  };
}
