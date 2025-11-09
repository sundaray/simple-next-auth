export function lazyInit<T>(fn: () => T): () => T {
  let result: T;
  let hasBeenCalled = false;

  return () => {
    if (!hasBeenCalled) {
      hasBeenCalled = true;
      result = fn();
    }
    return result;
  };
}
