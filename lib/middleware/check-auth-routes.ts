import { NextRequest, NextResponse } from "next/server";
import { Effect, Option } from "effect";
import { getUserSession } from "@/lib/auth/session/get-user-session";

const authRoutes = [
  "/signin",
  "/forgot-password",
  "/reset-password",
  "/reset-password/success",
  "/forgot-password/error",
  "/forgot-password/check-email",
  "/signup",
  "/signup/check-email",
  "/signup/error",
  "/signup/success",
];

export async function checkAuthRoutes(request: NextRequest) {
  const userOption = await Effect.runPromise(getUserSession());
  const user = Option.getOrNull(userOption);

  const { nextUrl } = request;
  const path = nextUrl.pathname;

  // Redirect authenticated users attempting to access auth pages to the home page
  if (
    user &&
    authRoutes.some((route) => path === route || path.startsWith(`${route}/`))
  ) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return null;
}
