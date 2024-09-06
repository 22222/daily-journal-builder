import React from "react";

// Based on https://usehooks.com/useAsync/

export function useAsync<T>(promise: Promise<T>, deps?: React.DependencyList): UseAsyncResult<T> {
  const [isPending, setPending] = React.useState(true);
  const [data, setData] = React.useState<T | undefined>(undefined);
  const [error, setError] = React.useState<Error | undefined>(undefined);
  React.useEffect(() => {
    setPending(true);
    setData(undefined);
    setError(undefined);
    promise
      .then((response) => {
        setData(response);
      })
      .catch((error) => {
        setError(error);
      })
      .finally(() => {
        setPending(false);
      });
  }, [promise, ...(deps ?? [])]);

  const result = React.useMemo(() => {
    const result: UseAsyncResult<T> = { isPending, data, error };
    return result;
  }, [isPending, data, error]);
  return result;
}

export interface UseAsyncResult<T> {
  data?: T;
  isPending: boolean;
  error?: Error;
}
