// Inspired by EIP-1193.
// See: https://eips.ethereum.org/EIPS/eip-1193#provider-errors.

export class UserRejectedRequestError extends Error {
    code: number;

    constructor() {
        super('The user rejected the request through the wallet.');
        this.name = 'UserRejectedRequestError';
        this.code = 4001;
    }
}

export class UnauthorizedError extends Error {
    code: number;

    constructor() {
        super('The requested method and/or account has not been authorized by the user.');
        this.name = 'UnauthorizedError';
        this.code = 4100;
    }
}

export class DisconnectedError extends Error {
    code: number;

    constructor() {
        super('The wallet could not connect to the network.');
        this.name = 'DisconnectedError';
        this.code = 4900;
    }
}

// Inspired by EIP-1474.
// See: https://eips.ethereum.org/EIPS/eip-1474#error-codes.

export class InvalidInputError extends Error {
    code: number;

    constructor() {
        super('Missing or invalid parameters.');
        this.name = 'InvalidInputError';
        this.code = -32000;
    }
}

export class MethodNotFoundError extends Error {
    code: number;

    constructor() {
        super('The requested method is not recognized by the wallet.');
        this.name = 'MethodNotFoundError';
        this.code = -32601;
    }
}

export class InternalError extends Error {
    code: number;

    constructor() {
        super('Something went wrong within the wallet.');
        this.name = 'InternalError';
        this.code = -32603;
    }
}
