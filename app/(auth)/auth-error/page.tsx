import Link from "next/link";
import { Icons } from "@/components/icons";

const errorMessages: Record<string, string> = {
  MissingQueryParametersError:
    "The authentication request is missing required parameters. Please try signing in again.",
  OAuthStateCookieNotFoundError:
    "The authentication session could not be found. Please try signing in again.",
  OAuthStateDecryptionFailedError:
    "Failed to verify the authentication request. Please try signing in again.",
  OAuthStateMismatchError:
    "The authentication request appears to be invalid or tampered with. Please try signing in again.",
  GoogleIDTokenDecodeError:
    "Failed to process the response from Google. Please try signing in again.",
  InvalidGoogleIdTokenPayloadError:
    "The response from Google contains invalid information. Please try signing in again.",
  UserCreationError:
    "A database error occurred while creating your account. Please try signing in again.",
  CookieStoreError:
    "Failed to access authentication session data. Please try signing in again.",
  ConfigError: "A configuration error occurred. Please try signing in again.",
  DatabaseError:
    "A database error occurred during authentication. Please try signing in again.",
  EncryptionError:
    "An encryption error occurred during authentication. Please try signing in again.",
  InvalidJWTPayloadError:
    "Failed to process authentication tokens. Please try signing in again.",
  UserSessionCreationError:
    "Failed to create your user session. Please try signing in again.",
  TokenExchangeError:
    "Failed to exchange authorization code for tokens. Please try signing in again.",
  UnknownError:
    "Something went wrong during authentication. Please try signing in again.",
};

type AuthErrorPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AuthErrorPage({
  searchParams,
}: AuthErrorPageProps) {
  const errorParam = (await searchParams).error;
  const errorTag = Array.isArray(errorParam) ? errorParam[0] : errorParam;

  const errorDescription =
    (errorTag && errorMessages[errorTag]) || errorMessages.UnknownError;

  return (
    <div className="mx-auto max-w-md px-4 text-center">
      <h2 className="mb-2 text-2xl font-semibold tracking-tight text-red-600">
        Authentication Error
      </h2>
      <p className="mb-4 text-pretty text-gray-600">{errorDescription}</p>
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
