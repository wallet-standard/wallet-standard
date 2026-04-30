import type { Wallet } from '@wallet-standard/base';
import type { UiWalletHandle } from '@wallet-standard/ui-core';

import { getWalletForHandle, registerWalletHandle } from '../UiWalletHandleRegistry.js';

describe('the wallet registry', () => {
    describe('given a handle against which a Standard wallet is registered', () => {
        let mockWallet: Wallet;
        let uiWalletHandle: UiWalletHandle;
        beforeEach(() => {
            mockWallet = {} as Wallet;
            uiWalletHandle = {} as UiWalletHandle;
            registerWalletHandle(uiWalletHandle, mockWallet);
        });
        it('lets you recover a registered wallet by its handle', () => {
            const recoveredWallet = getWalletForHandle(uiWalletHandle);
            expect(recoveredWallet).toBe(mockWallet);
        });
    });
    it('throws if there is no registered wallet pertaining to the supplied handle', () => {
        const unregisteredHandle = {} as UiWalletHandle;
        expect(() => {
            getWalletForHandle(unregisteredHandle);
        }).toThrow();
    });
});
