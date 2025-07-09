import Link from "next/link";
import { Icons } from "@/components/icons";

export default function VerifyPasswordReset() {
  return (
    <div className="mx-auto max-w-md px-4 text-center">
      <h2 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900">
        Password reset request received
      </h2>
      <p className="mb-4 text-pretty text-gray-600">
        If an account exists for the email you provided, a password reset link
        has been sent. If it doesn&apos;t arrive within a few minutes, be sure
        to check your spam or junk folder.
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
