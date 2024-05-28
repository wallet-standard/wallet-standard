import type { ReadonlyUint8Array } from '@wallet-standard/core';

function serializeMessage(message: ReadonlyUint8Array): string {
    return Buffer.from(message).toString('base64');
}

function deserializeMessage(wireMessage: string): Uint8Array {
    return new Uint8Array(Buffer.from(wireMessage, 'base64'));
}

export function stringify(value: any): string {
    return JSON.stringify(value, (_key: string, value: any) => {
        if (value instanceof Uint8Array) {
            return { type: 'Bytes', data: serializeMessage(value) };
        }

        return value;
    });
}

export function parse(text: string) {
    return JSON.parse(text, (_key: string, value: any) => {
        if (value?.type === 'Bytes') {
            return deserializeMessage(value.data);
        }

        return value;
    });
}
