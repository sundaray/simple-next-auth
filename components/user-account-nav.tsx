import React from "react";
import Link from "next/link";
import { getUserSession } from "@/lib/auth/session/get-user-session";
import { UserAccountNavClient } from "@/components/user-account-nav-client";

export async function UserAccountNav() {
  const user = await getUserSession();

  if (!user) {
    return (
      <nav className="ml-auto flex hidden items-center md:block">
        <Link
          href="/premium"
          className="mr-3 inline-flex items-center rounded-full bg-linear-to-b from-amber-400 to-amber-500 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-amber-400 hover:text-gray-900"
        >
          Go Premium
        </Link>

        <Link
          href="/signin"
          className="inline-flex items-center rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-900 hover:text-white"
        >
          Sign in
        </Link>
      </nav>
    );
  }
  return (
    <UserAccountNavClient user={user.role} className="ml-auto hidden md:flex" />
  );
}
