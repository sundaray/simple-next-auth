import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot password | Podwise",
};

export default function ForgotPassword() {
  return (
    <div className="mx-auto max-w-[380px] px-4">
      <h2 className="text-center text-2xl font-semibold tracking-tight text-gray-900">
        Forgot password?
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        Enter your email and request a password reset link
      </p>
      <div className="mt-12">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
