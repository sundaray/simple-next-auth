"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { FormErrorMessage } from "@/components/auth/form-error-message";
import { FormFieldErrorMessage } from "@/components/auth/form-field-error-message";
import { useForm, getInputProps, getFormProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { ForgotPasswordFormSchema } from "@/lib/schema";
import { forgotPassword } from "@/app/forgot-password-action";

export function ForgotPasswordForm() {
  const [lastResult, formAction, isPending] = useActionState(
    forgotPassword,
    undefined
  );

  const [form, fields] = useForm({
    lastResult,
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: ForgotPasswordFormSchema,
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

  return (
    <form {...getFormProps(form)} action={formAction}>
      {form.errors && <FormErrorMessage error={form.errors[0]} />}
      <div className={`grid gap-1 ${form.errors ? "mt-4" : ""}`}>
        <div className="grid">
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
        <Button type="submit" disabled={isPending} className="rounded-full">
          {isPending ? (
            <>
              <Icons.loader className="size-3 animate-spin" />
              Sending...
            </>
          ) : (
            "Send password reset link"
          )}
        </Button>
        <div className="mt-6 text-center text-sm font-medium">
          <span className="text-gray-500">Already have an account? </span>
          <Link
            href="/signin"
            className="text-sky-600 transition-colors hover:underline hover:underline-offset-2"
          >
            Sign in
          </Link>
        </div>
      </div>
    </form>
  );
}
