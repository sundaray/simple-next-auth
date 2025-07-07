import React from "react";
import Link from "next/link";
import { Effect } from "effect";
import { getUserSession } from "@/lib/auth/session/get-user-session";
import { UserAccountNavClient } from "@/components/user-account-nav-client";

export async function UserAccountNav() {
  const user = await Effect.runPromise(
    getUserSession().pipe(Effect.catchAll(() => Effect.succeed(null)))
  );

  if (!user) {
    return (
      <nav className="ml-auto flex hidden items-center md:block">
        <Link
          href="/signin"
          className="inline-flex items-center rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-900 hover:text-white"
        >
          Sign in
        </Link>
      </nav>
    );
  }

  return <UserAccountNavClient user={user} />;
}
