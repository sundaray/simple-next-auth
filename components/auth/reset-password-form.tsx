"use client";

import { useState, useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { FormErrorMessage } from "@/components/auth/form-error-message";
import { FormFieldErrorMessage } from "@/components/auth/form-field-error-message";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { ResetPasswordFormSchema } from "@/lib/schema";
import { resetPassword } from "@/app/reset-password-action";

export function ResetPasswordForm() {
  const [lastResult, formAction, isPending] = useActionState(
    resetPassword,
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
        schema: ResetPasswordFormSchema,
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
      {form.errors && <FormErrorMessage error={form.errors[0]} />}
      <div className={`grid gap-1 ${form.errors ? "mt-4" : ""}`}>
        <div className="grid">
          <Label htmlFor="newPassword">New password</Label>
          <div className="relative mt-2">
            <Input
              id={fields.newPassword.id}
              type={isNewPasswordVisible ? "text" : "password"}
              name={fields.newPassword.name}
              defaultValue={lastResult?.initialValue?.newPassword as string}
              aria-invalid={!fields.newPassword.valid ? true : undefined}
              aria-describedby={
                !fields.newPassword.valid
                  ? fields.newPassword.errorId
                  : undefined
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
          <FormFieldErrorMessage
            id={fields.newPassword.errorId}
            name={fields.newPassword.name}
            errors={fields.newPassword.errors}
          />
        </div>

        <div className="grid">
          <Label htmlFor="confirmNewPassword">Confirm new password</Label>
          <div className="relative mt-2">
            <Input
              id={fields.confirmNewPassword.id}
              type={isConfirmPasswordVisible ? "text" : "password"}
              name={fields.confirmNewPassword.name}
              defaultValue={
                lastResult?.initialValue?.confirmNewPassword as string
              }
              aria-invalid={!fields.confirmNewPassword.valid ? true : undefined}
              aria-describedby={
                !fields.confirmNewPassword.valid
                  ? fields.confirmNewPassword.errorId
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
          <FormFieldErrorMessage
            id={fields.confirmNewPassword.errorId}
            name={fields.confirmNewPassword.name}
            errors={fields.confirmNewPassword.errors}
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
