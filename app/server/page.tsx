import { Effect, Option } from "effect";
import { getUserSession } from "@/lib/auth/session/get-user-session";

export default async function ServerPage() {
  const userOption = await Effect.runPromise(getUserSession());
  const user = Option.getOrNull(userOption);

  return (
    <div className="mx-auto max-w-md px-4 text-center">
      <h2 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900">
        Server-Side Session
      </h2>
      {user ? (
        <div>
          <p className="mb-4 text-pretty text-gray-600">
            You are currently signed in.
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="inline font-medium text-gray-900">User Email: </dt>
              <dd className="inline text-gray-900">{user.email}</dd>
            </div>
            <div>
              <dt className="inline font-medium text-gray-900">User Role: </dt>
              <dd className="inline text-gray-900">{user.role}</dd>
            </div>
          </dl>
        </div>
      ) : (
        <p className="mb-4 text-pretty text-gray-600">
          No active user session was found.
        </p>
      )}
    </div>
  );
}
