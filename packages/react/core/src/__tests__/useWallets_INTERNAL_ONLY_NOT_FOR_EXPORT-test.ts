import { getWallets } from '@wallet-standard/app';
import type { Wallet, WalletVersion } from '@wallet-standard/base';
import type { StandardEventsFeature, StandardEventsListeners } from '@wallet-standard/features';
import { act } from 'react-test-renderer';

import { renderHook } from '../test-renderer.js';
import { useWallets_INTERNAL_ONLY_NOT_FOR_EXPORT } from '../useWallets_INTERNAL_ONLY_NOT_FOR_EXPORT.js';

jest.mock('@wallet-standard/app');

describe('useWallets_INTERNAL_ONLY_NOT_FOR_EXPORT', () => {
    let mockGet: jest.MockedFn<ReturnType<typeof getWallets>['get']>;
    let mockOn: jest.MockedFn<ReturnType<typeof getWallets>['on']>;
    let mockRegister: jest.MockedFn<ReturnType<typeof getWallets>['register']>;
    beforeEach(() => {
        mockGet = jest.fn().mockReturnValue([] as readonly Wallet[]);
        mockOn = jest.fn();
        mockRegister = jest.fn();
        jest.mocked(getWallets).mockReturnValue({
            get: mockGet,
            on: mockOn,
            register: mockRegister,
        });
        // Suppresses console output when an `ErrorBoundary` is hit.
        // See https://stackoverflow.com/a/72632884/802047
    });
    it('returns a list of registered wallets', () => {
        const expectedWallets = [] as readonly Wallet[];
        mockGet.mockReturnValue(expectedWallets);
        const { result } = renderHook(() => useWallets_INTERNAL_ONLY_NOT_FOR_EXPORT());
        expect(result.current).toBe(expectedWallets);
    });
    describe.each(['register', 'unregister'])('when the %s event fires', (expectedEvent) => {
        let initialWallets: readonly Wallet[];
        let listeners: (((...wallets: Wallet[]) => void) | ((...wallets: Wallet[]) => void))[] = [];
        beforeEach(() => {
            initialWallets = [] as readonly Wallet[];
            listeners = [];
            mockGet.mockReturnValue(initialWallets);
            mockOn.mockImplementation((event, listener) => {
                if (event === expectedEvent) {
                    listeners.push(listener);
                }
                return () => {
                    /* unsubscribe */
                };
            });
            mockGet.mockReturnValue(initialWallets);
        });
        it('updates if the wallet array has changed', () => {
            const { result } = renderHook(() => useWallets_INTERNAL_ONLY_NOT_FOR_EXPORT());
            const expectedWalletsAfterUpdate = ['new' as unknown as Wallet] as readonly Wallet[];
            mockGet.mockReturnValue(expectedWalletsAfterUpdate);
            act(() => {
                listeners.forEach((l) => {
                    l(/* doesn't really matter what the listener receives */);
                });
            });
            expect(result.current).toBe(expectedWalletsAfterUpdate);
        });
        it('does not update if the wallet array has not changed', () => {
            const { result } = renderHook(() => useWallets_INTERNAL_ONLY_NOT_FOR_EXPORT());
            act(() => {
                listeners.forEach((l) => {
                    l(/* doesn't really matter what the listener receives */);
                });
            });
            expect(result.current).toBe(initialWallets);
        });
    });
    it('recycles the wallets array when the `change` event fires on a wallet', () => {
        const listeners: StandardEventsListeners['change'][] = [];
        const mockWallets = [
            {
                accounts: [],
                chains: ['solana:mainnet'] as const,
                features: {
                    'standard:events': {
                        on(event, listener) {
                            if (event === 'change') {
                                listeners.push(listener);
                            }
                            return () => {
                                /* unsubscribe */
                            };
                        },
                        version: '1.0.0' as const,
                    },
                } as StandardEventsFeature,
                icon: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=',
                name: 'Mock Wallet',
                version: '1.0.0' as WalletVersion,
            } as const,
        ];
        mockGet.mockReturnValue(mockWallets);
        const { result } = renderHook(() => useWallets_INTERNAL_ONLY_NOT_FOR_EXPORT());
        act(() => {
            listeners.forEach((l) => {
                l({
                    /* doesn't really matter what the listener receives */
                });
            });
        });
        expect(result.current).toStrictEqual(mockWallets);
        expect(result.current).not.toBe(mockWallets);
    });
});
