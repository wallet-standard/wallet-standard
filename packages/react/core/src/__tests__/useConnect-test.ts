import type { Wallet, WalletVersion } from '@wallet-standard/base';
import { StandardConnect } from '@wallet-standard/features';
import type { UiWallet } from '@wallet-standard/ui';
import { getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED } from '@wallet-standard/ui-registry';

import { useConnect } from '../features/useConnect.js';
import { renderHook } from '../test-renderer.js';

jest.mock('@wallet-standard/ui-registry');

describe('useConnect', () => {
    let mockConnect: jest.Mock;
    let mockUiWallet: UiWallet;
    beforeEach(() => {
        mockConnect = jest.fn().mockResolvedValue({ accounts: [] });
        const mockWallet: Wallet = {
            accounts: [],
            chains: [],
            features: {
                [StandardConnect]: {
                    connect: mockConnect,
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
    describe('the `isConnecting` property', () => {
        it('is `false` before calling `connect()`', () => {
            const { result } = renderHook(() => useConnect(mockUiWallet));
            if (result.__type === 'error' || !result.current) {
                throw result.current;
            }
            const [isConnecting, _] = result.current;
            expect(isConnecting).toBe(false);
        });
        it('is `false` after the connection resolves', async () => {
            expect.assertions(1);
            const { result } = renderHook(() => useConnect(mockUiWallet));
            if (result.__type === 'error' || !result.current) {
                throw result.current;
            }
            const [_A, connect] = result.current;
            await connect();
            const [isConnecting, _B] = result.current;
            expect(isConnecting).toBe(false);
        });
        it('is `true` after calling `connect()`', () => {
            const { result } = renderHook(() => useConnect(mockUiWallet));
            if (result.__type === 'error' || !result.current) {
                throw result.current;
            }
            const [_, connect] = result.current;
            connect();
            const [isConnecting] = result.current;
            expect(isConnecting).toBe(true);
        });
        it('is `true` on hooks that did not trigger the connect', () => {
            const { result: resultA } = renderHook(() => useConnect(mockUiWallet));
            const { result: resultB } = renderHook(() => useConnect(mockUiWallet));
            if (resultA.__type === 'error' || !resultA.current) {
                throw resultA.current;
            }
            if (resultB.__type === 'error' || !resultB.current) {
                throw resultB.current;
            }
            const [_, connectA] = resultA.current;
            connectA();
            const [isConnectingB] = resultB.current;
            expect(isConnectingB).toBe(true);
        });
    });
    describe('the `connect` property', () => {
        it("calls the wallet's connect implementation when called ", () => {
            const { result } = renderHook(() => useConnect(mockUiWallet));
            if (result.__type === 'error' || !result.current) {
                throw result.current;
            } else {
                const [_, connect] = result.current;
                connect();
                expect(mockConnect).toHaveBeenCalled();
            }
        });
        it("calls the wallet's connect implementation once despite multiple calls", () => {
            const { result } = renderHook(() => useConnect(mockUiWallet));
            if (result.__type === 'error' || !result.current) {
                throw result.current;
            } else {
                const [_, connect] = result.current;
                connect();
                connect();
                expect(mockConnect).toHaveBeenCalledTimes(1);
            }
        });
        it("calls the wallet's connect implementation once despite calls from different hooks", () => {
            const { result: resultA } = renderHook(() => useConnect(mockUiWallet));
            const { result: resultB } = renderHook(() => useConnect(mockUiWallet));
            if (resultA.__type === 'error' || !resultA.current) {
                throw resultA.current;
            } else if (resultB.__type === 'error' || !resultB.current) {
                throw resultB.current;
            } else {
                const [_A, connectA] = resultA.current;
                const [_B, connectB] = resultB.current;
                connectA();
                connectB();
                expect(mockConnect).toHaveBeenCalledTimes(1);
            }
        });
        it("calls the wallet's connect implementation anew after the first connection resolves", async () => {
            expect.assertions(1);
            const { result } = renderHook(() => useConnect(mockUiWallet));
            if (result.__type === 'error' || !result.current) {
                throw result.current;
            } else {
                const [_, connect] = result.current;
                connect();
                await jest.runAllTimersAsync();
                connect();
                expect(mockConnect).toHaveBeenCalledTimes(2);
            }
        });
    });
});
