import * as React from "react";

import { Button } from "@react-email/button";
import { Html } from "@react-email/html";
import { Tailwind } from "@react-email/tailwind";
import { Text } from "@react-email/text";

export function EmailVerificationTemplate(url: string) {
  return (
    <Html>
      <Tailwind>
        <Text className="text-base font-medium text-gray-700">Hi,</Text>
        <Text className="text-base font-medium text-gray-700">
          Click the buttton below to verify your email:
        </Text>
        <Button
          href={url}
          className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white"
        >
          Verify Email
        </Button>
        <Text className="text-base font-medium text-gray-700">
          Note: This link will expire in 1 hour.
        </Text>

        <Text className="text-sm font-medium text-gray-500">
          If you did not try to log in to your account, you can safely ignore
          this email.
        </Text>
      </Tailwind>
    </Html>
  );
}
