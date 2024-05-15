import type { Wallet } from '@wallet-standard/base';

import type { WalletHandle } from '../WalletHandleRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT.js';
import {
    getWalletForHandle_INTERNAL_ONLY_NOT_FOR_EXPORT,
    registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT,
} from '../WalletHandleRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT.js';

describe('the wallet registry', () => {
    describe('given a handle against which a Standard wallet is registered', () => {
        let mockWallet: Wallet;
        let walletHandle: WalletHandle;
        beforeEach(() => {
            mockWallet = {} as Wallet;
            walletHandle = {} as WalletHandle;
            registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(walletHandle, mockWallet);
        });
        it('lets you recover a registered wallet by its handle', () => {
            const recoveredWallet = getWalletForHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(walletHandle);
            expect(recoveredWallet).toBe(mockWallet);
        });
    });
    it('throws if there is no registered wallet pertaining to the supplied handle', () => {
        const unregisteredHandle = {} as WalletHandle;
        expect(() => {
            getWalletForHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(unregisteredHandle);
        }).toThrow();
    });
});
