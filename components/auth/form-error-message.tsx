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
      className="bg-red-100 flex items-center rounded-md text-sm text-red-600 px-4 py-2 ease-out animate-in fade-in-0 text-pretty"
    >
      {errors[0]}
    </div>
  );
}
