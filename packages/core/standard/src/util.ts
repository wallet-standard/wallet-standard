import { Bytes } from './types';

/** TODO: docs */
export function bytesEqual(a: Bytes, b: Bytes): boolean {
    const length = a.length;
    if (length !== b.length) return false;
    for (let i = 0; i < length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

/** TODO: docs */
export function pick<T, K extends keyof T>(object: T, ...keys: K[]): Pick<T, K> {
    const picked = {} as Pick<T, K>;
    for (const key of keys) {
        picked[key] = object[key];
    }
    return picked;
}
