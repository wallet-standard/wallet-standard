import type { Wallet, WalletVersion } from '@wallet-standard/base';
import { StandardDisconnect } from '@wallet-standard/features';
import type { UiWallet } from '@wallet-standard/ui';
import { getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED } from '@wallet-standard/ui-registry';

import { useDisconnect } from '../features/useDisconnect.js';
import { renderHook } from '../test-renderer.js';

jest.mock('@wallet-standard/ui-registry');

describe('useDisconnect', () => {
    let mockDisconnect: jest.Mock;
    let mockUiWallet: UiWallet;
    beforeEach(() => {
        mockDisconnect = jest.fn().mockResolvedValue({ accounts: [] });
        const mockWallet: Wallet = {
            accounts: [],
            chains: [],
            features: {
                [StandardDisconnect]: {
                    disconnect: mockDisconnect,
                },
            },
            icon: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=',
            name: 'Mock Wallet',
            version: '1.0.0' as WalletVersion,
        };
        jest.mocked(getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED).mockReturnValue(mockWallet);
        // Suppresses console output when an `ErrorBoundary` is hit.
        // See https://stackoverflow.com/a/72632884/802047
        jest.spyOn(console, 'error').mockImplementation();
        jest.spyOn(console, 'warn').mockImplementation();
    });
    describe('the `isDisconnecting` property', () => {
        it('is `false` before calling `disconnect()`', () => {
            const { result } = renderHook(() => useDisconnect(mockUiWallet));
            if (result.__type === 'error' || !result.current) {
                throw result.current;
            }
            const [isDisconnecting, _] = result.current;
            expect(isDisconnecting).toBe(false);
        });
        it('is `false` after the disconnection resolves', async () => {
            expect.assertions(1);
            const { result } = renderHook(() => useDisconnect(mockUiWallet));
            if (result.__type === 'error' || !result.current) {
                throw result.current;
            }
            const [_A, disconnectA] = result.current;
            await disconnectA();
            const [isDisconnecting, _B] = result.current;
            expect(isDisconnecting).toBe(false);
        });
        it('is `true` after calling `disconnect()`', () => {
            const { result } = renderHook(() => useDisconnect(mockUiWallet));
            if (result.__type === 'error' || !result.current) {
                throw result.current;
            }
            const [_, disconnect] = result.current;
            disconnect();
            const [isDisconnecting] = result.current;
            expect(isDisconnecting).toBe(true);
        });
        it('is `true` on hooks that did not trigger the disconnect', () => {
            const { result: resultA } = renderHook(() => useDisconnect(mockUiWallet));
            const { result: resultB } = renderHook(() => useDisconnect(mockUiWallet));
            if (resultA.__type === 'error' || !resultA.current) {
                throw resultA.current;
            }
            if (resultB.__type === 'error' || !resultB.current) {
                throw resultB.current;
            }
            const [_, disconnectA] = resultA.current;
            disconnectA();
            const [isDisconnectingB] = resultB.current;
            expect(isDisconnectingB).toBe(true);
        });
    });
    describe('the `disconnect` property', () => {
        it("calls the wallet's disconnect implementation when called ", () => {
            const { result } = renderHook(() => useDisconnect(mockUiWallet));
            if (result.__type === 'error' || !result.current) {
                throw result.current;
            } else {
                const [_, disconnect] = result.current;
                disconnect();
                expect(mockDisconnect).toHaveBeenCalled();
            }
        });
        it("calls the wallet's disconnect implementation once despite multiple calls", () => {
            const { result } = renderHook(() => useDisconnect(mockUiWallet));
            if (result.__type === 'error' || !result.current) {
                throw result.current;
            } else {
                const [_, disconnect] = result.current;
                disconnect();
                disconnect();
                expect(mockDisconnect).toHaveBeenCalledTimes(1);
            }
        });
        it("calls the wallet's disconnect implementation once despite calls from different hooks", () => {
            const { result: resultA } = renderHook(() => useDisconnect(mockUiWallet));
            const { result: resultB } = renderHook(() => useDisconnect(mockUiWallet));
            if (resultA.__type === 'error' || !resultA.current) {
                throw resultA.current;
            } else if (resultB.__type === 'error' || !resultB.current) {
                throw resultB.current;
            } else {
                const [_A, disconnectA] = resultA.current;
                const [_B, disconnectB] = resultB.current;
                disconnectA();
                disconnectB();
                expect(mockDisconnect).toHaveBeenCalledTimes(1);
            }
        });
        it("calls the wallet's disconnect implementation anew after the first disconnection resolves", async () => {
            expect.assertions(1);
            const { result } = renderHook(() => useDisconnect(mockUiWallet));
            if (result.__type === 'error' || !result.current) {
                throw result.current;
            } else {
                const [_, disconnect] = result.current;
                disconnect();
                await jest.runAllTimersAsync();
                disconnect();
                expect(mockDisconnect).toHaveBeenCalledTimes(2);
            }
        });
    });
});
