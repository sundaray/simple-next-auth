type FormErrorMessageProps = {
  errors?: string[] | null;
};

export function FormErrorMessage({ errors }: FormErrorMessageProps) {
  if (!errors) {
    return null;
  }
  return (
    <div
      id="form-error"
      className="bg-red-100 flex items-center min-h-10 rounded-md text-sm text-red-600 px-4 ease-out animate-in fade-in-0"
    >
      {errors[0]}
    </div>
  );
}
