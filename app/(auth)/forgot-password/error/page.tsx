import Link from "next/link";
import { Icons } from "@/components/icons";

const errorMessages: Record<string, string> = {
  MissingTokenQueryParameterError:
    "The password reset link is invalid because it's missing the required token. Please request a new reset link.",

  InvalidPasswordResetSessionError:
    "The password reset session is not found or is invalid. Please request a new reset link.",

  TokenMismatchError:
    "The token in your password reset link is incorrect. Please request a new reset link.",
  InvalidTokenTypeError:
    "The token in your password reset link is incorrect. Please request a new reset link.",
  TokenLengthMismatchError:
    "The token in your password reset link is incorrect. Please request a new reset link.",

  CookieStoreAccessError:
    "A server error occurred while trying to verify your password reset request. Please request a new reset link.",

  Default:
    "Something went wrong during the password reset process. Please try again or request a new reset link.",
};

type ForgotPasswordErrorPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ForgotPasswordErrorPage({
  searchParams,
}: ForgotPasswordErrorPageProps) {
  const errorParam = (await searchParams).error;
  const errorTag = Array.isArray(errorParam) ? errorParam[0] : errorParam;

  const errorDescription =
    (errorTag && errorMessages[errorTag]) || errorMessages.Default;

  return (
    <div className="mx-auto max-w-md px-4 text-center">
      <h2 className="mb-2 text-2xl font-semibold tracking-tight text-red-600">
        Password Reset Error
      </h2>
      <p className="mb-4 text-pretty text-gray-600">{errorDescription}</p>
      <Link
        href="/forgot-password"
        className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-sky-700 transition-colors hover:bg-gray-100"
      >
        Request another link
        <Icons.chevronRight className="size-4" />
      </Link>
    </div>
  );
}
