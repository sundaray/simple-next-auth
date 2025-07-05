"use client";

import { useActionState } from "react";

import { Icons } from "@/components/icons";
import { signInWithGoogle } from "@/app/google-action";
import { ErrorMessage } from "@/components/auth/error-message";

export function SignInGoogleForm({ next }: { next: string }) {
  const boundGoogleSignIn = signInWithGoogle.bind(null, next);

  const [formState, formAction, isPending] = useActionState(
    boundGoogleSignIn,
    undefined
  );

  return (
    <form action={formAction}>
      {formState?.errors && (
        <ErrorMessage
          id="form-error"
          errors={formState?.errors}
          className="pb-4"
        />
      )}
      <button
        type="submit"
        disabled={isPending}
        className="item-center flex w-full justify-center rounded-md border border-2 border-gray-950/10 py-2 text-sm font-medium text-gray-900 shadow-xs transition-colors hover:bg-gray-100"
      >
        <Icons.google className="mr-2 inline-block size-5" />
        Sign in with Google
      </button>
    </form>
  );
}
