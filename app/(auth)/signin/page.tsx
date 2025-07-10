import { GoogleSignInForm } from "@/components/auth/google-signin-form";
import { CredentialsSignInForm } from "@/components/auth/credentials-signin-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in | Simple-Next-Auth",
};

export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<{ next: string }>;
}) {
  const resolvedParams = await searchParams;

  const next = resolvedParams.next || "/";

  return (
    <div className="mx-auto max-w-[380px] px-4">
      <h2 className="text-center text-2xl font-semibold tracking-tight text-gray-900">
        Welcome
      </h2>
      <p className="mt-1 text-center text-gray-600">Sign in to your account</p>
      <div className="mt-12 grid gap-4">
        <GoogleSignInForm next={next} />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-sm text-gray-600">
            <span className="bg-background px-2">Or continue with</span>
          </div>
        </div>
        <CredentialsSignInForm next={next} />
      </div>
    </div>
  );
}
