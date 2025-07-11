"use client";

import { useState, useActionState, useEffect } from "react";
import Link from "next/link";
import { useForm, getInputProps, getFormProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { FormErrorMessage } from "@/components/auth/form-error-message";
import { FormFieldErrorMessage } from "@/components/auth/form-field-error-message";

import { signInWithEmailAndPassword } from "@/app/credentials-signin-action";
import { CredentialsSignInFormSchema } from "@/lib/schema";

export function CredentialsSignInForm({ next }: { next: string }) {
  const boundSignInWithEmailAndPassword = signInWithEmailAndPassword.bind(
    null,
    next
  );

  const [lastResult, formAction, isPending] = useActionState(
    boundSignInWithEmailAndPassword,
    undefined
  );

  const [form, fields] = useForm({
    lastResult,
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: CredentialsSignInFormSchema,
      });
    },
  });

  // TEMPORARY FIX: Prevents form reset on form-level errors.
  // For context, see: https://github.com/edmundhung/conform/issues/681#issuecomment-2174388025
  useEffect(() => {
    const preventDefault = (event: Event) => {
      if (event.target === document.forms.namedItem(form.id)) {
        event.preventDefault();
      }
    };

    document.addEventListener("reset", preventDefault, true);

    return () => {
      document.removeEventListener("reset", preventDefault, true);
    };
  }, [form.id]);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  function togglePasswordVisibility() {
    setIsPasswordVisible((prevState) => !prevState);
  }

  const emailProps = getInputProps(fields.email, { type: "email" });
  console.log("Email props: ", emailProps);

  return (
    <form {...getFormProps(form)} action={formAction}>
      {form.errors && <FormErrorMessage error={form.errors[0]} />}
      <div className={`grid gap-1 ${form.errors ? "mt-4" : ""}`}>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            {...getInputProps(fields.email, { type: "email" })}
            className="mt-2"
          />
          <FormFieldErrorMessage
            id={fields.email.errorId}
            name={fields.email.name}
            errors={fields.email.errors}
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-sky-600 hover:underline hover:underline-offset-2"
              >
                Forgot password?
              </Link>
            </div>
          </div>
          <div className="relative">
            <Input
              {...getInputProps(fields.password, {
                type: isPasswordVisible ? "text" : "password",
              })}
              className="mt-2"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
              aria-pressed={isPasswordVisible}
              className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-gray-500 outline-offset-0 transition-colors hover:text-gray-600 focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-600 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPasswordVisible ? (
                <Icons.eyeOff size={16} strokeWidth={2} aria-hidden="true" />
              ) : (
                <Icons.eye size={16} strokeWidth={2} aria-hidden="true" />
              )}
            </button>
          </div>
          <FormFieldErrorMessage
            id={fields.password.errorId}
            name={fields.password.name}
            errors={fields.password.errors}
          />
        </div>
        <Button
          type="submit"
          disabled={isPending}
          className="h-10 rounded-full"
        >
          {isPending ? (
            <>
              <Icons.loader className="size-3 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
        <div className="mt-6 text-center text-sm font-medium">
          <span className="text-gray-500">Don&apos;t have an account? </span>
          <Link
            href="/signup"
            className="text-sky-600 transition-colors hover:underline hover:underline-offset-2"
          >
            Sign up
          </Link>
        </div>
      </div>
    </form>
  );
}
