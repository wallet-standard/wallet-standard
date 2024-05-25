import type React from 'react';
import { useCallback, useRef, useSyncExternalStore } from 'react';

const values = new WeakMap();
const subscribers = new Map<WeakKey, Set<() => void>>();

function getServerSnapshot() {
    return { current: undefined };
}

function createMutableRef<TValue>(keyObj: WeakKey): React.MutableRefObject<TValue | undefined> {
    return {
        get current(): TValue | undefined {
            return values.get(keyObj) as TValue | undefined;
        },
        set current(newValue: TValue | undefined) {
            if (newValue === values.get(keyObj)) {
                return;
            }
            if (newValue === undefined) {
                values.delete(keyObj);
            } else {
                values.set(keyObj, newValue);
            }
            subscribers.get(keyObj)?.forEach((cb) => cb());
        },
    };
}

/**
 * Given an object as a key, this hook will vend you a mutable ref that causes all of its consumers
 * to rerender whenever the `current` property is mutated. At all times, the value of `current`
 * points to the latest value.
 *
 * This is particularly useful when you need to share a `Promise` across your entire application and
 * you need every consumer to have access to the latest value of it synchronously, without having to
 * wait for a rerender. Use this hook to create a ref related to some stable object, then store your
 * promise in that ref.
 *
 * Note that the value related to the key object will persist even when every component that uses
 * this hook unmounts. The next component to mount and call this hook with the same `keyObj` will
 * recieve the same value. The value will only be released when `keyObj` is garbage collected.
 */
export function useWeakRef<TValue>(keyObj: WeakKey): React.MutableRefObject<TValue | undefined> {
    const subscribe = useCallback(
        (onStoreChange: () => void) => {
            let callbacks = subscribers.get(keyObj);
            if (callbacks == null) {
                subscribers.set(keyObj, (callbacks = new Set()));
            }
            function handleChange() {
                // This is super subtle; When there's a change, we want to create a new ref object
                // so that `useSyncExternalStore()` perceives it as changed and triggers a rerender.
                ref.current = createMutableRef(keyObj);
                onStoreChange();
            }
            callbacks.add(handleChange);
            return () => {
                ref.current = undefined;
                callbacks.delete(handleChange);
                if (callbacks.size === 0) {
                    subscribers.delete(keyObj);
                }
            };
        },
        [keyObj]
    );
    const ref = useRef<React.MutableRefObject<TValue | undefined>>();
    const getSnapshot = useCallback(() => (ref.current ||= createMutableRef<TValue>(keyObj)), [keyObj]);
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
