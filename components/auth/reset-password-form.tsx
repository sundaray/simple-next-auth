"use client";

import { useState, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { ErrorMessage } from "@/components/auth/error-message";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { ResetPasswordFormSchema } from "@/schema";
import { resetPassword } from "@/app/password-reset-actions";

export function ResetPasswordForm() {
  const [lastResult, formAction, isPending] = useActionState(
    resetPassword,
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
        schema: ResetPasswordFormSchema,
      });
    },
  });

  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  function toggleNewPasswordVisibility() {
    setIsNewPasswordVisible((prevState) => !prevState);
  }

  function toggleConfirmPasswordVisibility() {
    setIsConfirmPasswordVisible((prevState) => !prevState);
  }

  return (
    <form id={form.id} onSubmit={form.onSubmit} action={formAction} noValidate>
      {form.errors && (
        <ErrorMessage id="form-error" errors={form.errors} className="pb-4" />
      )}

      <div className="mt-4 grid gap-2">
        <div className="grid">
          <Label htmlFor="newPassword">New password</Label>
          <div className="relative mt-2">
            <Input
              id="newPassword"
              type={isNewPasswordVisible ? "text" : "password"}
              name="newPassword"
              defaultValue={lastResult?.initialValue?.newPassword as string}
              aria-invalid={fields.newPassword.errors ? "true" : undefined}
              aria-describedby={
                fields.newPassword.errors ? "new-password-error" : undefined
              }
            />
            <button
              type="button"
              onClick={toggleNewPasswordVisibility}
              aria-label={
                isNewPasswordVisible ? "Hide password" : "Show password"
              }
              aria-pressed={isNewPasswordVisible}
              className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-gray-500 outline-offset-0 transition-colors hover:text-gray-600 focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isNewPasswordVisible ? (
                <Icons.eyeOff size={16} strokeWidth={2} aria-hidden="true" />
              ) : (
                <Icons.eye size={16} strokeWidth={2} aria-hidden="true" />
              )}
            </button>
          </div>
          <ErrorMessage
            id="new-password-error"
            errors={fields.newPassword.errors}
            className="mt-1"
          />
        </div>

        <div className="grid">
          <Label htmlFor="confirmNewPassword">Confirm new password</Label>
          <div className="relative mt-2">
            <Input
              id="confirmNewPassword"
              type={isConfirmPasswordVisible ? "text" : "password"}
              name="confirmNewPassword"
              defaultValue={
                lastResult?.initialValue?.confirmNewPassword as string
              }
              aria-invalid={
                fields.confirmNewPassword.errors ? "true" : undefined
              }
              aria-describedby={
                fields.confirmNewPassword.errors
                  ? "confirm-new-password-error"
                  : undefined
              }
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              aria-label={
                isConfirmPasswordVisible ? "Hide password" : "Show password"
              }
              aria-pressed={isConfirmPasswordVisible}
              className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-gray-500 outline-offset-0 transition-colors hover:text-gray-600 focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-700 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isConfirmPasswordVisible ? (
                <Icons.eyeOff size={16} strokeWidth={2} aria-hidden="true" />
              ) : (
                <Icons.eye size={16} strokeWidth={2} aria-hidden="true" />
              )}
            </button>
          </div>
          <ErrorMessage
            id="confirm-new-password-error"
            errors={fields.confirmNewPassword.errors}
            className="mt-1"
          />
        </div>
        <Button type="submit" disabled={isPending} className="rounded-full">
          {isPending ? (
            <>
              <Icons.loader className="size-3 animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset password"
          )}
        </Button>
      </div>
    </form>
  );
}
