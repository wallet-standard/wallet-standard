import { isWalletStandardError, WalletStandardError } from '../error.js';
import { getErrorMessage } from '../message-formatter.js';

jest.mock('../message-formatter');

describe('WalletStandardError', () => {
    describe('given an error with context', () => {
        let errorWithContext: WalletStandardError;
        beforeEach(() => {
            errorWithContext = new WalletStandardError(
                // @ts-expect-error Mock error codes don't conform to `WalletStandardErrorCode`
                123,
                { foo: 'bar' }
            );
        });
        it('exposes its error code', () => {
            expect(errorWithContext.context).toHaveProperty('__code', 123);
        });
        it('exposes its context', () => {
            expect(errorWithContext.context).toHaveProperty('foo', 'bar');
        });
        it('exposes no cause', () => {
            expect(errorWithContext.cause).toBeUndefined();
        });
        it('calls the message formatter with the code and context', () => {
            expect(getErrorMessage).toHaveBeenCalledWith(123, { foo: 'bar' });
        });
    });
    describe('given an error with no context', () => {
        beforeEach(() => {
            new WalletStandardError(
                // @ts-expect-error Mock error codes don't conform to `WalletStandardErrorCode`
                123,
                undefined
            );
        });
        it('calls the message formatter with undefined context', () => {
            expect(getErrorMessage).toHaveBeenCalledWith(123, undefined);
        });
    });
    describe('given an error with a cause', () => {
        let errorWithCause: WalletStandardError;
        let cause: unknown;
        beforeEach(() => {
            cause = {};
            errorWithCause = new WalletStandardError(
                // @ts-expect-error Mock error codes don't conform to `WalletStandardErrorCode`
                123,
                { cause }
            );
        });
        it('exposes its cause', () => {
            expect(errorWithCause.cause).toBe(cause);
        });
    });
    describe.each(['cause'])('given an error with only the `%s` property from `ErrorOptions` present', (propName) => {
        let errorOptionValue: unknown;
        let errorWithOption: WalletStandardError;
        beforeEach(() => {
            errorOptionValue = Symbol();
            errorWithOption = new WalletStandardError(
                // @ts-expect-error Mock error codes don't conform to `WalletStandardErrorCode`
                123,
                { [propName]: errorOptionValue }
            );
        });
        it('omits the error option from its context', () => {
            expect(errorWithOption.context).not.toHaveProperty(propName);
        });
        it('calls the message formatter with the error option omitted', () => {
            expect(getErrorMessage).toHaveBeenCalledWith(
                123,
                expect.not.objectContaining({ [propName]: errorOptionValue })
            );
        });
    });
    it('sets its message to the output of the message formatter', async () => {
        expect.assertions(1);
        jest.mocked(getErrorMessage).mockReturnValue('o no');
        await jest.isolateModulesAsync(async () => {
            const WalletStandardErrorModule =
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                await import('../error');
            // @ts-expect-error Mock error codes don't conform to `WalletStandardErrorCode`
            const error456 = new WalletStandardErrorModule.WalletStandardError(456);
            expect(error456).toHaveProperty('message', 'o no');
        });
    });
});

describe('isWalletStandardError()', () => {
    let error123: WalletStandardError;
    beforeEach(() => {
        // @ts-expect-error Mock error codes don't conform to `WalletStandardErrorCode`
        error123 = new WalletStandardError(123);
    });
    it('returns `true` for an instance of `WalletStandardError`', () => {
        expect(isWalletStandardError(error123)).toBe(true);
    });
    it('returns `false` for an instance of `Error`', () => {
        expect(isWalletStandardError(new Error('bad thing'))).toBe(false);
    });
    it('returns `true` when the error code matches', () => {
        expect(
            isWalletStandardError(
                error123,
                // @ts-expect-error Mock error codes don't conform to `WalletStandardErrorCode`
                123
            )
        ).toBe(true);
    });
    it('returns `false` when the error code does not match', () => {
        expect(
            isWalletStandardError(
                error123,
                // @ts-expect-error Mock error codes don't conform to `WalletStandardErrorCode`
                456
            )
        ).toBe(false);
    });
});
