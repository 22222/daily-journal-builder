// import React from "react";

// import { AsyncState } from "./AsyncState";

// // Based on https://usehooks.com/useAsync/

// /**
//  * Returns the state of an async operation.
//  */
// const useAsyncCallback = <T>(
//   asyncCallback: (signal?: AbortSignal) => Promise<T>,
//   deps: React.DependencyList,
//   options?: UseAsyncCallbackOptions,
// ): UseAsyncCallbackResult<T> => {
//   let immediate = options?.immediate ?? false;

//   const [pending, setPending] = React.useState(true);
//   const [value, setValue] = React.useState<T | undefined>(undefined);
//   const [error, setError] = React.useState<Error | undefined>(undefined);

//   const savedAsyncCallback = React.useRef(asyncCallback);
//   React.useEffect(() => {
//     savedAsyncCallback.current = asyncCallback;
//   }, [asyncCallback]);

//   const execute = React.useCallback(
//     (signal?: AbortSignal) => {
//       setPending(true);
//       setValue(undefined);
//       setError(undefined);

//       const currentAsyncCallback = savedAsyncCallback.current;
//       return currentAsyncCallback(signal)
//         .then((response) => {
//           if (signal && signal.aborted) {
//             return;
//           }
//           setValue(response);
//         })
//         .catch((error) => {
//           if (signal && signal.aborted) {
//             return;
//           }
//           setError(error);
//         })
//         .finally(() => {
//           if (signal && signal.aborted) {
//             return;
//           }
//           setPending(false);
//         });
//     },
//     [
//       savedAsyncCallback,
//       // eslint-disable-next-line
//       ...deps,
//     ],
//   );

//   React.useEffect(() => {
//     let abortController: AbortController | undefined;
//     if (immediate) {
//       abortController = new AbortController();
//       execute(abortController.signal).finally(() => {
//         abortController = undefined;
//       });
//     }
//     return () => {
//       abortController?.abort();
//       abortController = undefined;
//     };
//   }, [execute, immediate]);

//   const result = React.useMemo(() => {
//     const result: UseAsyncCallbackResult<T> = { execute, pending, value, error };
//     return result;
//   }, [execute, pending, value, error]);
//   return result;
// };
// export default useAsyncCallback;

// export interface UseAsyncCallbackOptions {
//   immediate?: boolean;
// }

// export interface UseAsyncCallbackResult<T> extends AsyncState<T> {
//   execute: (signal?: AbortSignal) => void;
// }

// export interface AsyncState<T> {
//   pending: boolean;
//   value?: T;
//   error?: Error;
// }
