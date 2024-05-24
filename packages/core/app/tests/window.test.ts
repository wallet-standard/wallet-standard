import type { Wallet, WalletAccount, WalletEventsWindow } from '@wallet-standard/base';

import { getWallets } from '../src/index';

type FooSignTransactionFeature = {
    'foo:signTransaction': {
        signTransaction(): void;
    };
};

type FooSignMessageFeature = {
    'foo:signMessage': {
        signMessage(): void;
    };
};

class FooWalletAccount implements WalletAccount {
    address = '';
    publicKey = new Uint8Array();
    chains = ['foo:mainnet'] as const;
    features: readonly (keyof FooSignTransactionFeature | keyof FooSignMessageFeature)[] = [
        'foo:signTransaction',
        'foo:signMessage',
    ] as const;
}

class FooWallet implements Wallet {
    version = '1.0.0' as const;
    name = 'Foo';
    icon = `data:image/png;base64,` as const;
    chains = ['foo:mainnet'] as const;
    features: FooSignTransactionFeature & FooSignMessageFeature = {
        'foo:signTransaction': {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            signTransaction() {},
        },
        'foo:signMessage': {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            signMessage() {},
        },
    };
    accounts = [new FooWalletAccount()];
}

declare const window: WalletEventsWindow;

(async function () {
    window.addEventListener('wallet-standard:app-ready', ({ detail: { register } }) => register(new FooWallet()));

    const wallets = getWallets();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const wallet = wallets.get()[0]!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const account = wallet.accounts[0]!;

    if ('foo:signTransaction' in wallet.features) {
        (wallet as Wallet & { features: FooSignTransactionFeature }).features['foo:signTransaction'].signTransaction();
    }
})();
