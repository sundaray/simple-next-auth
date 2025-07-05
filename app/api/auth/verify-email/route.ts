import { NextRequest, NextResponse } from "next/server";

import {
  deleteEmailVerificationSession,
  doesEmailVerificationSessionExist,
  getEmailVerificationSession,
} from "@/lib/auth/credentials/session";
import { assignUserRole } from "@/lib/assign-user-role";
import { createUser } from "@/lib/create-user";
import { timingSafeCompare } from "@/lib/auth/credentials/timing-safe-compare";

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const tokenFromUrl = url.searchParams.get("token");
    const authErrorUrl = new URL("/signup/verify-email/error", url);

    const sessionExists = await doesEmailVerificationSessionExist();
    const payload = await getEmailVerificationSession();

    if (!tokenFromUrl || !sessionExists || !payload) {
      return NextResponse.redirect(authErrorUrl);
    }

    const { email, hashedPassword, token: tokenFromSession } = payload;

    if (!timingSafeCompare(tokenFromUrl, tokenFromSession)) {
      return NextResponse.redirect(authErrorUrl);
    }

    const role = assignUserRole(email);

    await createUser(email, role, "credentials", undefined, hashedPassword);

    await deleteEmailVerificationSession();

    return NextResponse.redirect(new URL("/signup/email-verified", url));
  } catch (error) {
    const authErrorUrl = new URL("/signup/verify-email/error", request.nextUrl);
    return NextResponse.redirect(authErrorUrl);
  }
}
