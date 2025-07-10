import React from "react";
import Link from "next/link";
import { Effect, Option } from "effect";
import { getUserSession } from "@/lib/auth/session/get-user-session";
import { UserAccountNavClient } from "@/components/user-account-nav-client";

export async function UserAccountNav() {
  const userOption = await Effect.runPromise(getUserSession());
  const user = Option.getOrNull(userOption);

  if (!user) {
    return (
      <nav className="flex hidden items-center md:block">
        <Link
          href="/signin"
          className="inline-flex items-center rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-900/90 hover:text-white"
        >
          Sign in
        </Link>
      </nav>
    );
  }

  return <UserAccountNavClient user={user} />;
}
