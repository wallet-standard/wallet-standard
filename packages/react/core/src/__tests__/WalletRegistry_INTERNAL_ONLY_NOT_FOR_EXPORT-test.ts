import '@wallet-standard/test-matchers/toBeFrozenObject';

import type { Wallet, WalletAccount, WalletVersion } from '@wallet-standard/base';

import type { ReactWalletAccount } from '../ReactWalletAccount.js';
import { getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT } from '../WalletAccountRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT.js';
import { registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT } from '../WalletHandleRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT.js';
import { getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT } from '../WalletRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT.js';

jest.mock('../WalletAccountRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT.js');
jest.mock('../WalletHandleRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT.js');

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

describe('getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT', () => {
    let mockWallet: Mutable<Wallet>;
    let mockWalletAccount: WalletAccount;
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
        const reactWallet = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        expect(reactWallet).toBeFrozenObject();
    });
    it('registers the Standard wallet associated with the React wallet account with the wallet handle registry', () => {
        const reactWallet = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        expect(registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT).toHaveBeenCalledWith(reactWallet, mockWallet);
    });
    it('returns the same React wallet given the same underlying Standard wallet', () => {
        const reactWalletA = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        const reactWalletB = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        expect(reactWalletB).toBe(reactWalletA);
        expect(registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT).toHaveBeenCalledTimes(1);
        expect(reactWalletB).toBeFrozenObject();
    });
    /**
     * Accounts
     */
    it('returns a React wallet with a frozen list of React wallet accounts', () => {
        const mockReactWalletAccount = {} as ReactWalletAccount;
        jest.mocked(getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT).mockReturnValue(
            mockReactWalletAccount
        );
        const reactWallet = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        expect(reactWallet).toHaveProperty('accounts', [mockReactWalletAccount]);
        expect(reactWallet.accounts).toBeFrozenObject();
    });
    it('returns a new React wallet given the same underlying Standard wallet that mutated the accounts to add one', () => {
        const reactWalletA = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        (mockWallet.accounts as Mutable<Wallet['accounts']>).unshift({ ...mockWalletAccount, address: 'def' });
        const reactWalletB = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        expect(reactWalletB).not.toBe(reactWalletA);
        expect(registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT).toHaveBeenCalledWith(reactWalletB, mockWallet);
    });
    it('returns a new React wallet given the same underlying Standard wallet that mutated the accounts to remove one', () => {
        const reactWalletA = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        (mockWallet.accounts as Mutable<Wallet['accounts']>).pop();
        const reactWalletB = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        expect(reactWalletB).not.toBe(reactWalletA);
        expect(registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT).toHaveBeenCalledWith(reactWalletB, mockWallet);
    });
    it('returns a new React wallet given the same underlying Standard wallet that mutated the accounts to modify one', () => {
        const reactWalletA = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        jest.mocked(getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT).mockReturnValue(
            // Doesn't matter what this is, so long as it's a new object.
            {} as ReactWalletAccount
        );
        const reactWalletB = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        expect(reactWalletB).not.toBe(reactWalletA);
        expect(registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT).toHaveBeenCalledWith(reactWalletB, mockWallet);
    });
    /**
     * Chains
     */
    it('returns a React wallet with a frozen chains array', () => {
        const reactWallet = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        expect(reactWallet).toHaveProperty('chains', mockWallet.chains);
        expect(reactWallet.chains).toBeFrozenObject();
    });
    it('returns a new React wallet given the same underlying Standard wallet that mutated the chains to add one', () => {
        const reactWalletA = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        (mockWallet.chains as Mutable<Wallet['chains']>).unshift('solana:boomernet');
        const reactWalletB = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        expect(reactWalletB).not.toBe(reactWalletA);
        expect(registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT).toHaveBeenCalledWith(reactWalletB, mockWallet);
    });
    it('returns a new React wallet given the same underlying Standard wallet that mutated the chains to remove one', () => {
        const reactWalletA = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        (mockWallet.chains as Mutable<Wallet['chains']>).splice(0, 1);
        const reactWalletB = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        expect(reactWalletB).not.toBe(reactWalletA);
        expect(registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT).toHaveBeenCalledWith(reactWalletB, mockWallet);
    });
    it('returns a new React wallet given the same underlying Standard wallet whose existing chains have been mutated', () => {
        const reactWalletA = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        (mockWallet.chains as Mutable<Wallet['chains']>)[0] = 'solana:danknet';
        const reactWalletB = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        expect(reactWalletB).not.toBe(reactWalletA);
        expect(registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT).toHaveBeenCalledWith(reactWalletB, mockWallet);
    });
    /**
     * Features
     */
    it('returns a React wallet with a flat frozen feature names array', () => {
        const reactWallet = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        expect(reactWallet).toHaveProperty('features', Object.keys(mockWallet.features));
        expect(reactWallet.chains).toBeFrozenObject();
    });
    it('returns a new React wallet given the same underlying Standard wallet that mutated the features to add one', () => {
        const reactWalletA = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        (mockWallet.features as Mutable<Wallet['features']>)['feature:new'] = { version: '1.0.0' as const };
        const reactWalletB = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        expect(reactWalletB).not.toBe(reactWalletA);
        expect(registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT).toHaveBeenCalledWith(reactWalletB, mockWallet);
    });
    it('returns a new React wallet given the same underlying Standard wallet that mutated the features to remove one', () => {
        const reactWalletA = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        delete (mockWallet.features as Mutable<Wallet['features']>)['feature:a'];
        const reactWalletB = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        expect(reactWalletB).not.toBe(reactWalletA);
        expect(registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT).toHaveBeenCalledWith(reactWalletB, mockWallet);
    });
    it('returns the same React wallet given the same underlying Standard wallet whose existing features have been mutated', () => {
        const reactWalletA = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        (mockWallet.features as { 'feature:a': { version: string } })['feature:a'].version = '2.0.0' as const;
        const reactWalletB = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        expect(reactWalletB).toBe(reactWalletA);
        expect(registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT).toHaveBeenCalledTimes(1);
    });
    /**
     * Icon
     */
    it('returns a React wallet with an icon', () => {
        const reactWallet = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        expect(reactWallet).toHaveProperty('icon', mockWallet.icon);
    });
    it('returns a new React wallet given the same underlying Standard wallet whose icon has been mutated', () => {
        const reactWalletA = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        mockWallet.icon = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        const reactWalletB = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        expect(reactWalletB).not.toBe(reactWalletA);
        expect(registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT).toHaveBeenCalledWith(reactWalletB, mockWallet);
    });
    /**
     * Name
     */
    it('returns a React wallet with a name', () => {
        const reactWallet = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        expect(reactWallet).toHaveProperty('name', mockWallet.name);
    });
    it('returns a new React wallet given the same underlying Standard wallet whose name has been mutated', () => {
        const reactWalletA = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        mockWallet.name = 'Based Wallet';
        const reactWalletB = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        expect(reactWalletB).not.toBe(reactWalletA);
        expect(registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT).toHaveBeenCalledWith(reactWalletB, mockWallet);
    });
    /**
     * Version
     */
    it('returns a React wallet with a version', () => {
        const reactWallet = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        expect(reactWallet).toHaveProperty('version', mockWallet.version);
    });
    it('returns a new React wallet given the same underlying Standard wallet whose version has been mutated', () => {
        const reactWalletA = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        mockWallet.version = '2.0.0' as WalletVersion;
        const reactWalletB = getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(mockWallet);
        expect(reactWalletB).not.toBe(reactWalletA);
        expect(registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT).toHaveBeenCalledWith(reactWalletB, mockWallet);
    });
});
