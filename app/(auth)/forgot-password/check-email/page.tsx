import Link from "next/link";
import { Icons } from "@/components/icons";

export default function VerifyPasswordReset() {
  return (
    <div className="mx-auto max-w-md px-4 text-center">
      <h2 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900">
        Password reset request received
      </h2>
      <p className="mb-4 text-sm text-pretty text-gray-600">
        If an account exists with the email address you provided, we&apos;ll
        send a password reset link. Please check your email inbox, including
        your spam folder.
      </p>
      <Link
        href="/signin"
        className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-sky-700 transition-colors hover:bg-gray-100"
      >
        Back to sign in
        <Icons.chevronRight className="size-4" />
      </Link>
    </div>
  );
}
