import { useSyncExternalStore } from 'react';

/**
 * A tiny external store: `get`, `set` (partial or updater), `subscribe`, and a selector hook.
 * Enough for the mock app state without pulling in a state library.
 */
export function createStore<S extends object>(initial: S) {
  let state = initial;
  const listeners = new Set<() => void>();

  const get = () => state;

  const set = (patch: Partial<S> | ((s: S) => Partial<S>)) => {
    const next = typeof patch === 'function' ? patch(state) : patch;
    state = { ...state, ...next };
    listeners.forEach((l) => l());
  };

  const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  };

  function useStore(): S;
  function useStore<T>(selector: (s: S) => T): T;
  function useStore<T>(selector?: (s: S) => T) {
    const read = () => (selector ? selector(state) : state);
    return useSyncExternalStore(subscribe, read, read);
  }

  return { get, set, subscribe, useStore, reset: () => set(initial) };
}
