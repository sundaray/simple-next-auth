"use client";

import { useActionState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { FormErrorMessage } from "@/components/auth/form-error-message";
import { FormFieldErrorMessage } from "@/components/auth/form-field-error-message";
import { useForm } from "@conform-to/react";
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
    // Validate when field loses focus
    shouldValidate: "onBlur",
    // Re-validate as user types
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
    <form id={form.id} onSubmit={form.onSubmit} action={formAction} noValidate>
      {form.errors && <FormErrorMessage error={form.errors[0]} />}
      <div className={`grid gap-1 ${form.errors ? "mt-4" : ""}`}>
        <div className="grid">
          <Label htmlFor="email">Email</Label>
          <Input
            id={fields.email.id}
            type="email"
            name={fields.email.name}
            className="mt-2"
            defaultValue={lastResult?.initialValue?.email as string}
            aria-invalid={!fields.email.valid ? true : undefined}
            aria-describedby={
              !fields.email.valid ? fields.email.errorId : undefined
            }
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
      </div>
    </form>
  );
}
