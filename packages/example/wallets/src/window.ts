import { initializeApp, initializeWallet } from '@wallet-standard/core';
import { EthereumWallet } from './ethereumWallet.js';
import { SolanaWallet } from './solanaWallet.js';

(function () {
    // TODO: update comments

    // The dapp hasn't loaded yet, so the first wallet to load registers itself on the window
    initializeWallet(new SolanaWallet());

    // ... time passes, the dapp loads ...

    // The dapp replaces the queue with an object API, and runs any queued commands
    const { get, on } = initializeApp();

    // The dapp gets all the wallets that have been registered so far, receiving all the registered wallets, which it
    // can add to its own state context
    let wallets = get();

    // The dapp adds an event listener for new wallets that get registered after this point, receiving an unsubscribe
    // function, which it can later use to remove the listener
    const removeRegisterListener = on('register', function () {
        // The dapp can add new wallets to its own state context as they are registered
        wallets = get();
    });

    const removeUnregisterListener = on('unregister', function () {
        wallets = get();
    });

    // ... time passes, other wallets load ...

    // The second wallet to load registers itself on the window
    initializeWallet(new EthereumWallet());

    // The dapp has an event listener now, so it sees new wallets immediately and doesn't need to poll or list them again
    // This also works if the dapp loads before any wallets (it will initialize, see no wallets, then see wallets as they load)
})();
