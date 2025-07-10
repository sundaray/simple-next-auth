type FormErrorMessageProps = {
  error: string | undefined;
};

export function FormErrorMessage({ error }: FormErrorMessageProps) {
  if (!error) {
    return null;
  }
  return (
    <div
      id="form-error"
      className="bg-red-100 flex items-center rounded-md text-sm text-red-600 px-4 py-2 ease-out animate-in fade-in-0 text-pretty"
    >
      {error}
    </div>
  );
}
