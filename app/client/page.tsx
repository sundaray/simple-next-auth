"use client";

import { useUser } from "@/hooks/use-user";
import { Icons } from "@/components/icons";

function Spinner() {
  return (
    <div className="flex items-center justify-center">
      <Icons.loader className="size-6 animate-spin text-gray-600" />
    </div>
  );
}

export default function ClientPage() {
  const { user, error, loading } = useUser();

  // 1. Handle the loading state
  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 text-center">
        <Spinner />
        <h2 className="my-2 text-2xl font-semibold tracking-tight text-gray-900">
          Checking Session...
        </h2>
        <p className="mb-4 text-pretty text-gray-600">
          Please wait while we verify your authentication status.
        </p>
      </div>
    );
  }

  // 2. Handle the error state
  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 text-center">
        <h2 className="mb-2 text-2xl font-semibold tracking-tight text-red-600">
          Session Error
        </h2>
        <p className="mb-4 text-pretty text-gray-600">
          We couldn't fetch your session details due to a server error. Please
          try refreshing the page.
        </p>
      </div>
    );
  }

  // 3. Handle the success state (user is either authenticated or not)
  return (
    <div className="mx-auto max-w-md px-4 text-center">
      <h2 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900">
        Client-Side Session
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
