import '@wallet-standard/test-matchers/toBeFrozenObject';

import type { Wallet, WalletAccount } from '@wallet-standard/base';

import { getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT } from '../WalletAccountRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT.js';
import {
    getWalletForHandle_INTERNAL_ONLY_NOT_FOR_EXPORT,
    registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT,
} from '../WalletHandleRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT.js';

jest.mock('../WalletHandleRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT.js');

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

describe('getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT', () => {
    let mockWallet: Wallet;
    let mockWalletAccount: Mutable<WalletAccount>;
    beforeEach(() => {
        mockWalletAccount = {
            address: 'abc',
            chains: ['solana:basednet'],
            features: ['feature:b'],
            icon: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=',
            label: 'Mock Account A',
            publicKey: new Uint8Array([1, 2, 3]),
        };
        mockWallet = {
            accounts: [mockWalletAccount],
            chains: ['solana:basednet', 'solana:goatnet'],
            features: {
                'feature:a': { version: '1.0.0' as const },
                'feature:b': { version: '1.0.0' as const },
            },
            icon: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=',
            name: 'Mock wallet',
            version: '1.0.0' as const,
        };
    });
    it('returns a frozen object', () => {
        const reactWalletAccount = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        expect(reactWalletAccount).toBeFrozenObject();
    });
    it('registers the Standard wallet associated with the React wallet account with the wallet handle registry', () => {
        const reactWalletAccount = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        expect(registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT).toHaveBeenCalledWith(reactWalletAccount, mockWallet);
    });
    it('returns the same React wallet account given the same underlying Standard wallet account', () => {
        jest.mocked(getWalletForHandle_INTERNAL_ONLY_NOT_FOR_EXPORT).mockReturnValue(mockWallet);
        const reactWalletAccountA = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        const reactWalletAccountB = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        expect(reactWalletAccountA).toBe(reactWalletAccountB);
    });
    it('returns a different React wallet account given a different underlying Standard wallet account', () => {
        jest.mocked(getWalletForHandle_INTERNAL_ONLY_NOT_FOR_EXPORT).mockReturnValue(mockWallet);
        const reactWalletAccountA = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        jest.mocked(getWalletForHandle_INTERNAL_ONLY_NOT_FOR_EXPORT).mockReturnValue(
            { ...mockWallet } /* a different object */
        );
        const reactWalletAccountB = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        expect(reactWalletAccountA).not.toBe(reactWalletAccountB);
    });
    /**
     * Address
     */
    it('returns a React wallet account with an address', () => {
        const reactWalletAccount = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        expect(reactWalletAccount).toHaveProperty('address', mockWalletAccount.address);
    });
    it('returns a new React wallet account given the same underlying Standard wallet account whose address has been mutated', () => {
        const reactWalletAccountA = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        mockWalletAccount.address = 'def'; // As unlikely is it that an account's address would be mutated, we test it none the less.
        const reactWalletAccountB = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        expect(reactWalletAccountB).not.toBe(reactWalletAccountA);
        expect(registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT).toHaveBeenCalledWith(reactWalletAccountB, mockWallet);
    });
    /**
     * Chains
     */
    it('returns a React wallet account with a frozen chains array', () => {
        const reactWalletAccount = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        expect(reactWalletAccount).toHaveProperty('chains', mockWalletAccount.chains);
        expect(reactWalletAccount.chains).toBeFrozenObject();
    });
    it('returns a new React wallet account given the same underlying Standard wallet account that mutated the chains to add one', () => {
        const reactWalletAccountA = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        (mockWalletAccount.chains as Mutable<Wallet['chains']>).unshift('solana:boomernet');
        const reactWalletAccountB = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        expect(reactWalletAccountB).not.toBe(reactWalletAccountA);
        expect(registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT).toHaveBeenCalledWith(reactWalletAccountB, mockWallet);
    });
    it('returns a new React wallet account given the same underlying Standard wallet account that mutated the chains to remove one', () => {
        const reactWalletAccountA = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        (mockWalletAccount.chains as Mutable<Wallet['chains']>).splice(0, 1);
        const reactWalletAccountB = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        expect(reactWalletAccountB).not.toBe(reactWalletAccountA);
        expect(registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT).toHaveBeenCalledWith(reactWalletAccountB, mockWallet);
    });
    it('returns a new React wallet account given the same underlying Standard wallet account whose existing chains have been mutated', () => {
        const reactWalletAccountA = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        (mockWalletAccount.chains as Mutable<Wallet['chains']>)[0] = 'solana:danknet';
        const reactWalletAccountB = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        expect(reactWalletAccountB).not.toBe(reactWalletAccountA);
        expect(registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT).toHaveBeenCalledWith(reactWalletAccountB, mockWallet);
    });
    /**
     * Features
     */
    it('returns a React wallet account with a flat frozen feature names array', () => {
        const reactWalletAccount = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        expect(reactWalletAccount).toHaveProperty('features', mockWalletAccount.features);
        expect(reactWalletAccount.chains).toBeFrozenObject();
    });
    it('returns a new React wallet account given the same underlying Standard wallet account that mutated the features to add one', () => {
        const reactWalletAccountA = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        (mockWalletAccount.features as Mutable<WalletAccount['features']>).push('feature:new');
        const reactWalletAccountB = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        expect(reactWalletAccountB).not.toBe(reactWalletAccountA);
        expect(registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT).toHaveBeenCalledWith(reactWalletAccountB, mockWallet);
    });
    it('returns a new React wallet account given the same underlying Standard wallet account that mutated the features to remove one', () => {
        const reactWalletAccountA = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        (mockWalletAccount.features as Mutable<WalletAccount['features']>).pop();
        const reactWalletAccountB = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        expect(reactWalletAccountB).not.toBe(reactWalletAccountA);
        expect(registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT).toHaveBeenCalledWith(reactWalletAccountB, mockWallet);
    });
    it('returns a new React wallet given the same underlying Standard wallet whose existing features have been mutated', () => {
        const reactWalletAccountA = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        (mockWalletAccount.features as Mutable<WalletAccount['features']>)[0] = 'feature:z';
        const reactWalletAccountB = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        expect(reactWalletAccountB).not.toBe(reactWalletAccountA);
        expect(registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT).toHaveBeenCalledWith(reactWalletAccountB, mockWallet);
    });
    /**
     * Icon
     */
    it('returns a React wallet account with an icon', () => {
        const reactWalletAccount = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        expect(reactWalletAccount).toHaveProperty('icon', mockWalletAccount.icon);
    });
    it('returns a new React wallet account given the same underlying Standard wallet account whose icon has been mutated', () => {
        const reactWalletAccountA = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        mockWalletAccount.icon = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        const reactWalletAccountB = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        expect(reactWalletAccountB).not.toBe(reactWalletAccountA);
        expect(registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT).toHaveBeenCalledWith(reactWalletAccountB, mockWallet);
    });
    /**
     * Label
     */
    it('returns a React wallet account with a label', () => {
        const reactWalletAccount = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        expect(reactWalletAccount).toHaveProperty('label', mockWalletAccount.label);
    });
    it('returns a new React wallet account given the same underlying Standard wallet account whose label has been mutated', () => {
        const reactWalletAccountA = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        mockWalletAccount.label = 'Based Account A';
        const reactWalletAccountB = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        expect(reactWalletAccountB).not.toBe(reactWalletAccountA);
        expect(registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT).toHaveBeenCalledWith(reactWalletAccountB, mockWallet);
    });
    /**
     * Public key
     */
    it('returns a React wallet account with a public key', () => {
        const reactWalletAccount = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        expect(reactWalletAccount).toHaveProperty('publicKey', mockWalletAccount.publicKey);
    });
    it('returns a new React wallet account given the same underlying Standard wallet account whose label has been mutated', () => {
        const reactWalletAccountA = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        mockWalletAccount.publicKey = new Uint8Array([4, 5, 6]);
        const reactWalletAccountB = getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
            mockWallet,
            mockWalletAccount
        );
        expect(reactWalletAccountB).not.toBe(reactWalletAccountA);
        expect(registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT).toHaveBeenCalledWith(reactWalletAccountB, mockWallet);
    });
});
