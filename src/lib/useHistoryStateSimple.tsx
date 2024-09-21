import React from "react";

export interface HistoryStateOptions<T> {
  initialPast?: T[];
  initialFuture?: T[];
  onChange?: (action: Action<T>) => void;
}

export interface HistoryState<T> {
  state: T;
  set: (newPresent: T) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  canUndo: boolean;
  canRedo: boolean;
  get future(): readonly T[];
  get past(): readonly T[];
}

export function useHistoryState<T>(initialPresent: T, options?: HistoryStateOptions<T>): HistoryState<T> {
  const initialPresentRef = React.useRef(initialPresent);
  const [state, dispatch] = React.useReducer(useHistoryStateReducer<T>, {
    past: options?.initialPast ?? [],
    present: initialPresentRef.current,
    future: options?.initialFuture ?? [],
  });

  const onChange = options?.onChange;
  const dispatchWithCallback = React.useCallback(
    (action: Action<T>) => {
      dispatch(action);
      onChange?.(action);
    },
    [onChange],
  );

  const canUndo = state.past.length !== 0;
  const canRedo = state.future.length !== 0;

  const undo = React.useCallback(() => {
    if (canUndo) {
      dispatchWithCallback({ type: "UNDO" });
    }
  }, [canUndo, dispatchWithCallback]);

  const redo = React.useCallback(() => {
    if (canRedo) {
      dispatchWithCallback({ type: "REDO" });
    }
  }, [canRedo, dispatchWithCallback]);

  const set = React.useCallback(
    (newPresent: T) => dispatchWithCallback({ type: "SET", newPresent }),
    [dispatchWithCallback],
  );

  const clear = React.useCallback(
    () => dispatchWithCallback({ type: "CLEAR", initialPresent: initialPresentRef.current }),
    [dispatchWithCallback],
  );

  const getPast = React.useCallback(() => {
    return Object.freeze(state.past);
  }, [state.past]);

  const getFuture = React.useCallback(() => {
    return Object.freeze(state.future);
  }, [state.future]);

  const result: Omit<HistoryState<T>, "past" | "future"> = {
    state: state.present,
    set,
    undo,
    redo,
    clear,
    canUndo,
    canRedo,
  };
  Object.defineProperty(result, "past", {
    get: getPast,
  });
  Object.defineProperty(result, "future", {
    get: getFuture,
  });
  return result as HistoryState<T>;
}

interface UseHistoryStateReducerState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface UndoAction {
  type: "UNDO";
}
interface RedoAction {
  type: "REDO";
}
interface SetAction<T> {
  type: "SET";
  newPresent: T;
}
interface ClearAction<T> {
  type: "CLEAR";
  initialPresent: T;
}
type Action<T> = UndoAction | RedoAction | SetAction<T> | ClearAction<T>;

function useHistoryStateReducer<T>(
  state: UseHistoryStateReducerState<T>,
  action: Action<T>,
): UseHistoryStateReducerState<T> {
  const { past, present, future } = state;

  if (action.type === "UNDO") {
    return {
      past: past.slice(0, past.length - 1),
      present: past[past.length - 1],
      future: [present, ...future],
    };
  } else if (action.type === "REDO") {
    return {
      past: [...past, present],
      present: future[0],
      future: future.slice(1),
    };
  } else if (action.type === "SET") {
    const { newPresent } = action;
    if (action.newPresent === present) {
      return state;
    }
    return {
      past: [...past, present],
      present: newPresent,
      future: [],
    };
  } else if (action.type === "CLEAR") {
    return {
      past: [],
      present: action.initialPresent,
      future: [],
    };
  } else {
    throw new Error("Unsupported action type");
  }
}
