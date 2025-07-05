import { useEffect, useState } from "react";

type User = {
  email: string;
  role: string;
  annualAccessStatus: boolean;
  lifetimeAccessStatus: boolean;
};

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch("/api/auth/session");

        if (!response.ok) {
          throw new Error("Failed to get user session");
        }
        const { user } = await response.json();
        setUser(user);
      } catch (error) {
        if (error instanceof Error) {
          setError(error);
        } else {
          setError(new Error("An unknown error occurred"));
        }
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, []);

  return { user, loading, error };
}
