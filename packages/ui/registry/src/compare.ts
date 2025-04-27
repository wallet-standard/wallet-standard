import type { IdentifierArray, ReadonlyUint8Array } from '@wallet-standard/base';

export function identifierArraysAreDifferent(a: IdentifierArray, b: IdentifierArray): boolean {
    // NOTE: Do not optimize this with an `a.length !== b.length` check. A length check does not
    // take into consideration that the array might contain duplicate items.
    const itemsSetA = new Set(a);
    const itemsSetB = new Set(b);
    if (itemsSetA.size !== itemsSetB.size) {
        return true;
    }
    for (const itemFromA of itemsSetA) {
        if (!itemsSetB.has(itemFromA)) {
            return true;
        }
    }
    return false;
}

export function byteArraysAreDifferent(a: ReadonlyUint8Array, b: ReadonlyUint8Array): boolean {
    if (a.length !== b.length) {
        return true;
    }

    for (let i = 0; i < a.length; i += 1) {
        if (a[i] !== b[i]) {
            return true;
        }
    }

    return false;
}
