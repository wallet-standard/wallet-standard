import type { Wallet, WalletVersion } from '@wallet-standard/base';

import { renderHook } from '../../test-renderer.js';
import type { WalletHandle } from '../../WalletHandleRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT.js';
import { useWalletFeature } from '../useWalletFeature.js';
import { getWalletForHandle_INTERNAL_ONLY_NOT_FOR_EXPORT } from '../../WalletHandleRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT.js';

jest.mock('../../WalletHandleRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT');

describe('useWalletFeature', () => {
    let mockFeatureA: object;
    let mockWallet: Wallet;
    let mockWalletHandle: WalletHandle;
    beforeEach(() => {
        mockFeatureA = {};
        mockWallet = {
            accounts: [],
            chains: [],
            features: {
                'feature:a': mockFeatureA,
            },
            icon: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=',
            name: 'Mock Wallet',
            version: '1.0.0' as WalletVersion,
        };
        mockWalletHandle = {
            '~walletHandle': Symbol(),
            features: ['feature:a'],
        } as WalletHandle;
        // Suppresses console output when an `ErrorBoundary` is hit.
        // See https://stackoverflow.com/a/72632884/802047
        jest.spyOn(console, 'error').mockImplementation();
        jest.spyOn(console, 'warn').mockImplementation();
    });
    it('throws if the handle provided does not support the feature requested', () => {
        const { result } = renderHook(() => useWalletFeature(mockWalletHandle, 'feature:b', '1.0.0'));
        expect(result.__type).toBe('error');
    });
    it('throws if the wallet version is different than was expected', () => {
        jest.mocked(getWalletForHandle_INTERNAL_ONLY_NOT_FOR_EXPORT).mockReturnValue({
            ...mockWallet,
            version: '2.0.0' as WalletVersion,
        });
        const { result } = renderHook(() => useWalletFeature(mockWalletHandle, 'feature:b', '1.0.0'));
        expect(result.__type).toBe('error');
    });
    it('returns the feature of the underlying wallet', () => {
        jest.mocked(getWalletForHandle_INTERNAL_ONLY_NOT_FOR_EXPORT).mockReturnValue(mockWallet);
        const { result } = renderHook(() => useWalletFeature(mockWalletHandle, 'feature:a', '1.0.0'));
        expect(result.current).toBe(mockFeatureA);
    });
});
