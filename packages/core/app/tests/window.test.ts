import type {
    ConnectInput,
    ConnectOutput,
    Wallet,
    WalletAccount,
    WalletAccountEventNames,
    WalletAccountEvents,
    WalletEventNames,
    WalletEvents,
    WalletsWindow,
} from '@wallet-standard/standard';
import { initialize } from '..';

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
    features: ReadonlyArray<keyof FooSignTransactionFeature | keyof FooSignMessageFeature> = [
        'foo:signTransaction',
        'foo:signMessage',
    ] as const;
    on<E extends WalletAccountEventNames>(event: E, listener: WalletAccountEvents[E]): () => void {
        throw new Error('Method not implemented.');
    }
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
    async connect(input: ConnectInput): Promise<ConnectOutput> {
        throw new Error('Method not implemented.');
    }
    on<E extends WalletEventNames>(event: E, listener: WalletEvents[E]): () => void {
        throw new Error('Method not implemented.');
    }
}

declare const window: WalletsWindow;

(async function () {
    (window.navigator.wallets ||= []).push({
        method: 'register',
        wallets: [new FooWallet()],
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        callback() {},
    });

    const wallets = initialize();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const wallet = wallets.get()[0]!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const account = (await wallet.connect({ chains: ['foo:mainnet'] })).accounts[0]!;

    if ('foo:signTransaction' in wallet.features) {
        (wallet as Wallet & { features: FooSignTransactionFeature }).features['foo:signTransaction'].signTransaction();
    }
})();
