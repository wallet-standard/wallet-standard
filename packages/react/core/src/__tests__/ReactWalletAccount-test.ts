import type { Wallet, WalletAccount, WalletVersion } from '@wallet-standard/base';

import type { ReactWallet } from '../ReactWallet.js';
import type { ReactWalletAccount } from '../ReactWalletAccount.js';
import { reactWalletAccountBelongsToReactWallet, reactWalletAccountsAreSame } from '../ReactWalletAccount.js';
import { getReactWalletAccountStorageKey } from '../ReactWalletAccount.js';
import { getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT } from '../WalletAccountRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT.js';
import { getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT } from '../WalletRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT.js';

describe('getReactWalletAccountStorageKey()', () => {
    let mockReactWalletAccount: ReactWalletAccount;
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
        mockReactWalletAccount = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
    });
    it('vends a colon separated key for a wallet account', () => {
        expect(getReactWalletAccountStorageKey(mockReactWalletAccount)).toBe('Mock_Wallet:abc');
    });
});

describe('reactWalletAccountsAreSame()', () => {
    let mockReactWalletAccount: ReactWalletAccount;
    let mockWallet: Wallet;
    let mockWalletAccount: WalletAccount;
    beforeEach(() => {
        mockWalletAccount = {
            address: 'abc',
            chains: [],
            features: [],
            publicKey: new Uint8Array([1, 2, 3]),
        } as WalletAccount;
        mockWallet = {
            accounts: [],
            chains: [],
            features: {},
            icon: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=',
            name: 'Mock:Wallet',
            version: '1.0.0' as WalletVersion,
        };
        mockReactWalletAccount = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
    });
    it('returns true for the same account object', () => {
        expect(reactWalletAccountsAreSame(mockReactWalletAccount, mockReactWalletAccount)).toBe(true);
    });
    it('returns true if the addresses and underlying `Wallet` match, despite the objects being different', () => {
        const clonedMockReactWalletAccount =
            getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet, {
                ...mockWalletAccount,
                chains: ['solana:danknet'],
            } as WalletAccount);
        expect(reactWalletAccountsAreSame(mockReactWalletAccount, clonedMockReactWalletAccount)).toBe(true);
    });
    it('returns false if the addresses match but the underlying `Wallet` does not', () => {
        const clonedMockReactWalletAccount =
            getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
                { ...mockWallet },
                mockWalletAccount
            );
        expect(reactWalletAccountsAreSame(mockReactWalletAccount, clonedMockReactWalletAccount)).toBe(false);
    });
    it('returns false if the addresses do not match even if the underlying `Wallet` does', () => {
        const clonedMockReactWalletAccount =
            getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet, {
                ...mockWalletAccount,
                address: 'xyz',
            });
        expect(reactWalletAccountsAreSame(mockReactWalletAccount, clonedMockReactWalletAccount)).toBe(false);
    });
});

describe('reactWalletAccountBelongsToReactWallet()', () => {
    let mockWalletAccount: WalletAccount;
    let mockWallet: Wallet;
    let mockReactWalletAccount: ReactWalletAccount;
    let mockReactWallet: ReactWallet;
    beforeEach(() => {
        mockWalletAccount = {
            address: 'abc',
            chains: [],
            features: [],
            publicKey: new Uint8Array([1, 2, 3]),
        };
        mockWallet = {
            accounts: [],
            chains: [],
            features: {},
            icon: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=',
            name: 'Mock:Wallet',
            version: '1.0.0' as WalletVersion,
        };
        mockReactWalletAccount = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        mockReactWallet = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
    });
    it('returns true if the React wallet account belongs to the React wallet', () => {
        expect(reactWalletAccountBelongsToReactWallet(mockReactWalletAccount, mockReactWallet)).toBe(true);
    });
    it('returns false if the React wallet account does not belong to the React wallet', () => {
        const differentWallet = { ...mockWallet } as Wallet; /* different object */
        const identicalAccountInDifferentWallet =
            getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
                differentWallet,
                mockWalletAccount
            );
        expect(reactWalletAccountBelongsToReactWallet(identicalAccountInDifferentWallet, mockReactWallet)).toBe(false);
    });
});
