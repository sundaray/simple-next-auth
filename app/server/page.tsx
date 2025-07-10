// app/server/page.tsx

import { Effect, Option } from "effect";
import { getUserSession } from "@/lib/auth/session/get-user-session";

export default async function ServerPage() {
  // Fetch user session directly on the server
  const userOption = await Effect.runPromise(getUserSession());
  const user = Option.getOrNull(userOption);

  return (
    <div className="mx-auto max-w-md px-4 text-center">
      <h2 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900">
        Server-Side Session
      </h2>
      {user ? (
        // User is authenticated
        <div>
          <p className="mb-4 text-pretty text-gray-600">
            You are currently signed in.
          </p>
          <div className="mt-4 rounded-md border bg-gray-50 p-4 text-left text-sm">
            <p>
              <span className="font-medium">User Email:</span> {user.email}
            </p>
            <p>
              <span className="font-medium">User Role:</span> {user.role}
            </p>
          </div>
        </div>
      ) : (
        // User is not authenticated
        <p className="mb-4 text-pretty text-gray-600">
          No active user session was found.
        </p>
      )}
    </div>
  );
}
