import { formOptions } from "@tanstack/react-form/nextjs";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { SignUpEmailPasswordFormSchema } from "@/lib/schema";

export const signUpFormOptions = formOptions({
  // Validator adapter
  validatorAdapter: zodValidator,
  // Default values for the form
  defaultValues: {
    email: "",
    password: "",
  },
  // The Zod schema for validation
  schema: SignUpEmailPasswordFormSchema,
});
