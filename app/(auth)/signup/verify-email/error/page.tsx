import Link from "next/link";
import { Icons } from "@/components/icons";

const errorMessages: Record<string, string> = {
  InvalidEmailVerificationSessionError:
    "The email verification session is not found or is invalid. Please request a new verification link.",
  MissingTokenQueryParameterError:
    "The email verification link is invalid because it is missing the required token. Please request a new verification link.",
  CookieStoreAccessError:
    "Failed to access the email verification session. Please request a new verification link.",
  TokenMismatchError:
    "The verification link is invalid because its token does not match our records. Please request a new verification link.",
  DatabaseError:
    "A database error occurred while creating your account. Please request a new verification link.",
  ConfigError:
    "A server error occurred while trying to verify your email. Please request a new verification link.",
  Default:
    "Something went wrong while verifying your email. Please try again or request a new verification link.",
};

type VerifyEmailErrorPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function VerifyEmailErrorPage({
  searchParams,
}: VerifyEmailErrorPageProps) {
  const errorParam = (await searchParams).error;
  const errorTag = Array.isArray(errorParam) ? errorParam[0] : errorParam;

  const errorDescription =
    (errorTag && errorMessages[errorTag]) || errorMessages.Default;

  return (
    <div className="mx-auto max-w-md px-4 text-center">
      <h2 className="mb-2 text-2xl font-semibold tracking-tight text-red-600">
        Email verification failed
      </h2>
      <p className="mb-4 text-pretty text-gray-600">{errorDescription}</p>
      <Link
        href="/signup"
        className="inline-flex items-center gap-1 rounded-full px-4 py-3 text-sm font-medium text-sky-700 transition-colors hover:bg-gray-100"
      >
        Back to sign up
        <Icons.chevronRight className="size-4" />
      </Link>
    </div>
  );
}
