import type { Wallet, WalletAccount, WalletVersion } from '@wallet-standard/base';
import type { UiWalletAccount, UiWallet } from '@wallet-standard/ui-core';
import {
    getOrCreateUiWalletAccountForStandardWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
    getOrCreateUiWalletForStandardWallet_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
} from '@wallet-standard/ui-registry';

import { uiWalletAccountBelongsToUiWallet, uiWalletAccountsAreSame } from '../compare.js';

describe('uiWalletAccountsAreSame()', () => {
    let mockUiWalletAccount: UiWalletAccount;
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
        mockUiWalletAccount = getOrCreateUiWalletAccountForStandardWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(
            mockWallet,
            mockWalletAccount
        );
    });
    it('returns true for the same account object', () => {
        expect(uiWalletAccountsAreSame(mockUiWalletAccount, mockUiWalletAccount)).toBe(true);
    });
    it('returns true if the addresses and underlying `Wallet` match, despite the objects being different', () => {
        const clonedMockUiWalletAccount =
            getOrCreateUiWalletAccountForStandardWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(mockWallet, {
                ...mockWalletAccount,
                chains: ['solana:danknet'],
            } as WalletAccount);
        expect(uiWalletAccountsAreSame(mockUiWalletAccount, clonedMockUiWalletAccount)).toBe(true);
    });
    it('returns false if the addresses match but the underlying `Wallet` does not', () => {
        const clonedMockUiWalletAccount =
            getOrCreateUiWalletAccountForStandardWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(
                { ...mockWallet },
                mockWalletAccount
            );
        expect(uiWalletAccountsAreSame(mockUiWalletAccount, clonedMockUiWalletAccount)).toBe(false);
    });
    it('returns false if the addresses do not match even if the underlying `Wallet` does', () => {
        const clonedMockUiWalletAccount =
            getOrCreateUiWalletAccountForStandardWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(mockWallet, {
                ...mockWalletAccount,
                address: 'xyz',
            });
        expect(uiWalletAccountsAreSame(mockUiWalletAccount, clonedMockUiWalletAccount)).toBe(false);
    });
});

describe('uiWalletAccountBelongsToUiWallet()', () => {
    let mockWalletAccount: WalletAccount;
    let mockWallet: Wallet;
    let mockUiWalletAccount: UiWalletAccount;
    let mockUiWallet: UiWallet;
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
        mockUiWalletAccount = getOrCreateUiWalletAccountForStandardWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(
            mockWallet,
            mockWalletAccount
        );
        mockUiWallet = getOrCreateUiWalletForStandardWallet_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(mockWallet);
    });
    it('returns true if the UI wallet account belongs to the UI wallet', () => {
        expect(uiWalletAccountBelongsToUiWallet(mockUiWalletAccount, mockUiWallet)).toBe(true);
    });
    it('returns false if the UI wallet account does not belong to the UI wallet', () => {
        const differentWallet = { ...mockWallet } as Wallet; /* different object */
        const identicalAccountInDifferentWallet =
            getOrCreateUiWalletAccountForStandardWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(
                differentWallet,
                mockWalletAccount
            );
        expect(uiWalletAccountBelongsToUiWallet(identicalAccountInDifferentWallet, mockUiWallet)).toBe(false);
    });
});
