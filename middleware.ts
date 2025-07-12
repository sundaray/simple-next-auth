import { NextRequest, NextResponse } from "next/server";
import { checkAuthRoutes } from "@/lib/middleware/check-auth-routes";
import { updateUserSession } from "@/lib/auth/session/extend-user-session";

export async function middleware(request: NextRequest) {
  const authRoutesResponse = await checkAuthRoutes(request);
  if (authRoutesResponse) return authRoutesResponse;

  const sessionUpdateResponse = await updateUserSession(request);
  if (sessionUpdateResponse) return sessionUpdateResponse;

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all static files and Next.js internals
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
