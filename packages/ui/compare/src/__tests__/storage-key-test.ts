import type { Wallet, WalletVersion } from '@wallet-standard/base';
import type { UiWalletAccount } from '@wallet-standard/ui-core';
import { getOrCreateUiWalletAccountForStandardWalletAccount } from '@wallet-standard/ui-registry';

import { getUiWalletAccountStorageKey } from '../storage-key.js';

describe('getUiWalletAccountStorageKey()', () => {
    let mockUiWalletAccount: UiWalletAccount;
    beforeEach(() => {
        const mockWalletAccount = {
            address: 'abc',
            chains: [],
            features: [],
            publicKey: new Uint8Array([1, 2, 3]),
        };
        const mockWallet: Wallet = {
            accounts: [],
            chains: [],
            features: {},
            icon: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=',
            name: 'Mock:Wallet',
            version: '1.0.0' as WalletVersion,
        };
        mockUiWalletAccount = getOrCreateUiWalletAccountForStandardWalletAccount(mockWallet, mockWalletAccount);
    });
    it('vends a colon separated key for a wallet account', () => {
        expect(getUiWalletAccountStorageKey(mockUiWalletAccount)).toBe('Mock_Wallet:abc');
    });
});
