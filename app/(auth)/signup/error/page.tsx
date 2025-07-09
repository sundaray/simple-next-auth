import Link from "next/link";
import { Icons } from "@/components/icons";

const errorMessages: Record<string, string> = {
  InvalidEmailVerificationSessionError:
    "The email verification session is not found or is invalid. Please sign up again.",
  MissingTokenQueryParameterError:
    "The email verification link is invalid because it is missing the required token. Please sign up again.",
  CookieStoreAccessError:
    "Failed to access the email verification session. Please sign up again.",
  TokenMismatchError:
    "The token in your email verification link is incorrect. Please sign up again.",
  InvalidTokenTypeError:
    "The token in your email verification link is incorrect. Please sign up again.",
  TokenLengthMismatchError:
    "The token in your email verification link is incorrect. Please sign up again.",
  DatabaseError:
    "A database error occurred while creating your account. Please sign up again.",
  ConfigError:
    "A server error occurred while trying to verify your email. Please sign up again.",
  Default:
    "Something went wrong while verifying your email. Please sign up again.",
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
        Email Verification Error
      </h2>
      <p className="mb-4 text-pretty text-gray-600">{errorDescription}</p>
      <Link
        href="/signup"
        className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-sky-700 transition-colors hover:bg-gray-100"
      >
        Back to sign up
        <Icons.chevronRight className="size-4" />
      </Link>
    </div>
  );
}
