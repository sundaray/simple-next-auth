"use client";

import { useUser } from "@/hooks/use-user";
import { Icons } from "@/components/icons";

function Spinner() {
  return (
    <div className="flex justify-center items-center">
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
        // 3a. User is authenticated
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
        // 3b. User is not authenticated
        <p className="mb-4 text-pretty text-gray-600">
          No active user session was found.
        </p>
      )}
    </div>
  );
}
