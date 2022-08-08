import { Wallet, WalletAccount, WalletEvents, WalletsNavigator } from '@solana/wallet-standard';
import { initialize } from '../src';

interface SolanaWalletAccount extends WalletAccount {
    chain: 'solana:mainnet';
    features: { one: 1; two: 2 };
    ciphers: never;
}

// A wallet that supports multiple account types
type SolanaWallet = Wallet<SolanaWalletAccount>;

class FooWalletAccount implements WalletAccount {
    address = new Uint8Array();
    publicKey = new Uint8Array();
    chain = 'mainnet' as const;
    ciphers = [] as const;
    features = {
        signTransaction: {
            signTransaction() {},
        },
        signMessage: {
            signTransaction() {},
        },
    };
}

class FooWallet implements Wallet<FooWalletAccount> {
    version = '1.0.0';
    name = 'Foo';
    icon = 'image';
    accounts = [new FooWalletAccount()];
    hasMoreAccounts = false;
    chains = ['mainnet'] as const;
    features = ['signTransaction', 'signMessage'] as const;
    ciphers = [] as const;
    connect(...args: Parameters<Wallet<FooWalletAccount>['connect']>): ReturnType<Wallet<FooWalletAccount>['connect']> {
        throw new Error('Method not implemented.');
    }
    on<E extends keyof WalletEvents>(event: E, listener: WalletEvents[E]): () => void {
        throw new Error('Method not implemented.');
    }
}

const fooWallet = new FooWallet();

fooWallet.connect({
    chains: ['mainnet'],
    features: ['signTransaction', 'signMessage'],
});

(async function () {
    const navigator: WalletsNavigator<SolanaWalletAccount> = window.navigator;

    navigator.wallets = navigator.wallets || [];
    navigator.wallets.push({ method: 'register', wallets: [{} as SolanaWallet], callback() {} });

    const wallets = initialize<SolanaWalletAccount>();
    const wallet = wallets.get()[0];
    const account = wallet.accounts[0];

    account.features.one;
    account.features.two;
    // @ts-expect-error expected
    account.features.three;
})();
