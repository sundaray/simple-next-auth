import { cn } from "@/lib/utils";

type ErrorMessageProps = {
  id: string;
  errors?: string[] | null;
  className?: string;
};

export function ErrorMessage({ id, errors, className }: ErrorMessageProps) {
  // Define base classes that will always be applied
  const baseClasses =
    "min-h-[20px] duration-200 text-sm text-red-600 ease-out animate-in fade-in-0 slide-in-from-left-1";

  // If no errors, just render an empty container with the minimum height
  if (!errors) {
    return <div id={id} className={cn(baseClasses, className)}></div>;
  }

  // Check if this is a password field by examining the id
  const isPasswordField = id === "password-error";
  const requiredMsg = "Password is required";

  const detailedErrors = isPasswordField
    ? errors.filter((e) => e !== requiredMsg)
    : errors;

  // For single/multiple error messages under the password field
  if (isPasswordField && detailedErrors.length > 0) {
    return (
      <div id={id} className={cn(baseClasses, className)}>
        <p>Password must:</p>
        <ul className="ml-2">
          {errors.map((error) => (
            <li key={error}>- {error}</li>
          ))}
        </ul>
      </div>
    );
  }

  // Non-password fields
  return (
    <p id={id} className={cn(baseClasses, className)}>
      {errors[0]}
    </p>
  );
}
