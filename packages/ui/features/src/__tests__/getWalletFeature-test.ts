import type { Wallet, WalletVersion } from '@wallet-standard/base';
import {
    WALLET_STANDARD_ERROR__FEATURES__WALLET_FEATURE_UNIMPLEMENTED,
    WalletStandardError,
} from '@wallet-standard/errors';
import type { UiWalletHandle } from '@wallet-standard/ui-core';
import { getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED } from '@wallet-standard/ui-registry';

import { getWalletFeature } from '../getWalletFeature.js';

jest.mock('@wallet-standard/ui-registry');

describe('getWalletFeature', () => {
    let mockFeatureA: object;
    let mockWallet: Wallet;
    let mockWalletHandle: UiWalletHandle;
    beforeEach(() => {
        mockFeatureA = {};
        mockWallet = {
            accounts: [],
            chains: ['solana:mainnet'],
            features: {
                'feature:a': mockFeatureA,
            },
            icon: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=',
            name: 'Mock Wallet',
            version: '1.0.0' as WalletVersion,
        };
        mockWalletHandle = {
            '~uiWalletHandle': Symbol(),
            features: ['feature:a'],
        } as UiWalletHandle;
        jest.mocked(getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED).mockReturnValue(mockWallet);
        // Suppresses console output when an `ErrorBoundary` is hit.
        // See https://stackoverflow.com/a/72632884/802047
        jest.spyOn(console, 'error').mockImplementation();
        jest.spyOn(console, 'warn').mockImplementation();
    });
    it('throws if the handle provided does not support the feature requested', () => {
        expect(() => {
            getWalletFeature(mockWalletHandle, 'feature:b');
        }).toThrow(
            new WalletStandardError(WALLET_STANDARD_ERROR__FEATURES__WALLET_FEATURE_UNIMPLEMENTED, {
                featureName: 'feature:b',
                supportedChains: ['solana:mainnet'],
                supportedFeatures: ['feature:a'],
                walletName: 'Mock Wallet',
            })
        );
    });
    it('returns the feature of the underlying wallet', () => {
        jest.mocked(getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED).mockReturnValue(mockWallet);
        expect(getWalletFeature(mockWalletHandle, 'feature:a')).toBe(mockFeatureA);
    });
});
