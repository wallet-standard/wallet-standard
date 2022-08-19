import { initialize } from '@wallet-standard/app';
import type { WalletsWindow } from '@wallet-standard/standard';
import type { EthereumWalletAccount } from './ethereumWallet';
import { EthereumWallet } from './ethereumWallet';
import type { MultiChainWalletAccount } from './multiChainWallet';
import { MultiChainWallet } from './multiChainWallet';
import type { SolanaWalletAccount } from './solanaWallet';
import { SolanaWallet } from './solanaWallet';

(function () {
    // The dapp hasn't loaded yet, so the first wallet to load gets or creates a queue, and registers itself on the window
    ((window as WalletsWindow<SolanaWalletAccount>).navigator.wallets ||= []).push({
        method: 'register',
        wallets: [new SolanaWallet()],
        callback() {},
    });

    // The second wallet does the same thing
    ((window as WalletsWindow<EthereumWalletAccount>).navigator.wallets ||= []).push({
        method: 'register',
        wallets: [new EthereumWallet()],
        callback() {},
    });

    // ... time passes, the dapp loads ...

    // The dapp replaces the queue with a push function, and runs any queued commands
    const { push } = initialize();

    // The dapp adds an event listener for new wallets that get registered after this point
    push({
        method: 'on',
        event: 'register',
        listener(wallets) {
            // The dapp can add new wallets to its own state context as they are registered
        },
        callback(unsubscribe) {
            // The dapp will receive the unsubscribe function when this runs, which it can later use to remove the listener
        },
    });

    // The dapp gets all the wallets that have been registered so far
    push({
        method: 'get',
        callback(wallets) {
            // The dapp will receive all the registered wallets when this runs, and can add them to its own state context
        },
    });

    // ... time passes, other wallets load ...

    // The third wallet to load registers itself on the window
    ((window as WalletsWindow<MultiChainWalletAccount>).navigator.wallets ||= []).push({
        method: 'register',
        wallets: [new MultiChainWallet()],
        callback() {},
    });

    // The dapp has an event listener now, so it sees new wallets immediately and doesn't need to poll or list them again
    // This also works if the dapp loads before any wallets (it will initialize the push function, see no wallets on the first call, then see wallets as they load)
})();
