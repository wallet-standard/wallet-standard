export function serializeMessage(message: Uint8Array): string {
    return Buffer.from(message).toString('base64');
}

export function deserializeMessage(wireMessage: string): Uint8Array {
    return new Uint8Array(Buffer.from(wireMessage, 'base64'));
}
