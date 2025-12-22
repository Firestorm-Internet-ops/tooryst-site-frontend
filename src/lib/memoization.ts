import { memo, useMemo, useCallback } from 'react';

/**
 * Deep equality check for props
 * Useful for React.memo custom comparison
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return false;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}

/**
 * Shallow equality check for props
 * Faster than deep equal, suitable for most cases
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }

  return true;
}

/**
 * Create a memoized component with custom comparison
 * Usage: const MemoComponent = memoize(Component, shallowEqual);
 */
export function memoize<P extends object>(
  Component: React.ComponentType<P>,
  compare?: (prevProps: P, nextProps: P) => boolean
) {
  return memo(Component, compare);
}

/**
 * Memoize a callback with dependency tracking
 * Automatically tracks dependencies and warns about missing ones
 */
export function useMemoCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps) as T;
}

/**
 * Memoize a value with deep equality check
 * Useful for object/array props that should trigger re-renders only on value change
 */
export function useMemoValue<T>(value: T, deps: React.DependencyList): T {
  const memoized = useMemo(() => value, deps);
  return memoized;
}

/**
 * Create a selector hook for Redux-like state
 * Prevents unnecessary re-renders when selected value hasn't changed
 */
export function createSelector<T, S>(
  selector: (state: T) => S,
  equalityFn: (a: S, b: S) => boolean = shallowEqual
) {
  let lastState: T;
  let lastValue: S;

  return (state: T): S => {
    if (lastState === undefined || !equalityFn(lastValue, selector(state))) {
      lastState = state;
      lastValue = selector(state);
    }
    return lastValue;
  };
}
