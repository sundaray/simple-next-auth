"use client";

import { useActionState } from "react";

import { Icons } from "@/components/icons";
import { authenticateWithGoogle } from "@/app/google-auth-action";
import { FormErrorMessage } from "@/components/auth/form-error-message";

export function GoogleSignInForm({ next }: { next: string }) {
  const boundGoogleSignIn = authenticateWithGoogle.bind(null, next);

  const [formState, formAction, isPending] = useActionState(
    boundGoogleSignIn,
    undefined
  );

  return (
    <form action={formAction}>
      {formState?.status === "error" && (
        <FormErrorMessage error={formState.message} />
      )}
      <button
        type="submit"
        disabled={isPending}
        className={`item-center flex w-full justify-center rounded-md border border-2 border-gray-950/10 py-2 text-sm font-medium text-gray-900 shadow-xs transition-colors hover:bg-gray-100 ${formState?.errors ? "mt-4" : ""}`}
      >
        <Icons.google className="mr-2 inline-block size-5" />
        Sign in with Google
      </button>
    </form>
  );
}
