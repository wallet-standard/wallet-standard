import {
    WALLET_STANDARD_ERROR__FEATURES__WALLET_ACCOUNT_FEATURE_UNIMPLEMENTED,
    WalletStandardError,
} from '@wallet-standard/errors';
import type { UiWalletAccount } from '@wallet-standard/ui-core';

import { getWalletAccountFeature } from '../getWalletAccountFeature.js';
import { getWalletFeature } from '../getWalletFeature.js';

jest.mock('../getWalletFeature.js');

describe('getWalletAccountFeature', () => {
    let mockWalletAccount: UiWalletAccount;
    beforeEach(() => {
        mockWalletAccount = {
            '~uiWalletHandle': Symbol() as UiWalletAccount['~uiWalletHandle'],
            address: 'abc',
            chains: ['solana:mainnet'],
            features: ['feature:a'],
            publicKey: new Uint8Array([1, 2, 3]),
        };
        // Suppresses console output when an `ErrorBoundary` is hit.
        // See https://stackoverflow.com/a/72632884/802047
        jest.spyOn(console, 'error').mockImplementation();
        jest.spyOn(console, 'warn').mockImplementation();
    });
    it('throws if the account does not support the feature requested', () => {
        expect(() => {
            getWalletAccountFeature(mockWalletAccount, 'feature:b');
        }).toThrow(
            new WalletStandardError(WALLET_STANDARD_ERROR__FEATURES__WALLET_ACCOUNT_FEATURE_UNIMPLEMENTED, {
                address: 'abc',
                supportedChains: ['solana:mainnet'],
                supportedFeatures: ['feature:a'],
                featureName: 'feature:b',
            })
        );
    });
    it('returns the feature of the underlying wallet', () => {
        const mockFeature = {};
        jest.mocked(getWalletFeature).mockReturnValue(mockFeature);
        expect(getWalletAccountFeature(mockWalletAccount, 'feature:a')).toBe(mockFeature);
    });
});
