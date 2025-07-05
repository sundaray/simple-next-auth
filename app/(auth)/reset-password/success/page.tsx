import Link from "next/link";
import { Icons } from "@/components/icons";

export default function PasswordReset() {
  return (
    <div className="mx-auto max-w-md px-4 text-center">
      <h2 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900">
        Password reset
      </h2>
      <p className="mb-4 text-pretty text-sm text-gray-600">
        Your password has been successfully reset. You can now sign in with your
        updated password.
      </p>
      <Link
        href="/signin"
        className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-sky-600 transition-colors hover:bg-gray-100 hover:text-sky-700"
      >
        Sign in
        <Icons.chevronRight className="size-4" />
      </Link>
    </div>
  );
}
