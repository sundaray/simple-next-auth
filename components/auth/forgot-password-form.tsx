"use client";

import { useActionState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { ErrorMessage } from "@/components/auth/error-message";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { ForgotPasswordFormSchema } from "@/schema";
import { forgotPassword } from "@/app/password-reset-actions";

export function ForgotPasswordForm() {
  const [lastResult, formAction, isPending] = useActionState(
    forgotPassword,
    undefined,
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

  return (
    <form id={form.id} onSubmit={form.onSubmit} action={formAction} noValidate>
      {form.errors && (
        <ErrorMessage id="form-error" errors={form.errors} className="pb-4" />
      )}
      <div className="grid gap-2">
        <div className="grid">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            name="email"
            className="mt-2"
            placeholder="you@example.com"
            defaultValue={lastResult?.initialValue?.email as string}
            aria-invalid={fields.email.errors ? "true" : undefined}
            aria-describedby={fields.email.errors ? "email-error" : undefined}
          />
          <ErrorMessage
            id="email-error"
            errors={fields.email.errors}
            className="mt-1"
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
