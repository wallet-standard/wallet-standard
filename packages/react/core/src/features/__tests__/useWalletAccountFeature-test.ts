import type { ReactWalletAccount } from '../../ReactWalletAccount.js';
import { renderHook } from '../../test-renderer.js';
import { useWalletAccountFeature } from '../useWalletAccountFeature.js';
import { useWalletFeature } from '../useWalletFeature.js';

jest.mock('../useWalletFeature.js');

describe('useWalletAccountFeature', () => {
    let mockWalletAccount: ReactWalletAccount;
    beforeEach(() => {
        mockWalletAccount = {
            '~walletHandle': Symbol() as ReactWalletAccount['~walletHandle'],
            address: 'abc',
            chains: [],
            features: ['feature:a'],
            publicKey: new Uint8Array([1, 2, 3]),
        };
        // Suppresses console output when an `ErrorBoundary` is hit.
        // See https://stackoverflow.com/a/72632884/802047
        jest.spyOn(console, 'error').mockImplementation();
        jest.spyOn(console, 'warn').mockImplementation();
    });
    it('throws if the account does not support the feature requested', () => {
        const { result } = renderHook(() => useWalletAccountFeature(mockWalletAccount, 'feature:b', '1.0.0'));
        expect(result.__type).toBe('error');
    });
    it('returns the feature of the underlying wallet', () => {
        const mockFeature = {};
        jest.mocked(useWalletFeature).mockReturnValue(mockFeature);
        const { result } = renderHook(() => useWalletAccountFeature(mockWalletAccount, 'feature:a', '1.0.0'));
        expect(result.current).toBe(mockFeature);
    });
});
