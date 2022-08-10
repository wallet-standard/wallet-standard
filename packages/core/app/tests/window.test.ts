import { Wallet, WalletAccount, WalletEvents, WalletsWindow } from '@solana/wallet-standard';
import { initialize } from '../src';

interface SolanaWalletAccount extends WalletAccount {
    chain: 'solana:mainnet';
    nonstandardFeatures: { one: 1; two: 2 };
}

// A wallet that supports multiple account types
type SolanaWallet = Wallet<SolanaWalletAccount>;

class FooWalletAccount implements WalletAccount {
    address = new Uint8Array();
    publicKey = new Uint8Array();
    chain = 'mainnet' as const;
    features = {
        signTransaction: {} as any,
        signMessage: {} as any,
    };
    nonstandardFeatures = {};
}

class FooWallet implements Wallet<FooWalletAccount> {
    version = '1.0.0';
    name = 'Foo';
    icon = 'image';
    chains = ['mainnet'] as const;
    features = ['signTransaction', 'signMessage'] as const;
    nonstandardFeatures = [] as const;
    accounts = [new FooWalletAccount()];
    hasMoreAccounts = false;
    connect(...args: Parameters<Wallet<FooWalletAccount>['connect']>): ReturnType<Wallet<FooWalletAccount>['connect']> {
        throw new Error('Method not implemented.');
    }
    on<E extends keyof WalletEvents<FooWalletAccount>>(
        event: E,
        listener: WalletEvents<FooWalletAccount>[E]
    ): () => void {
        throw new Error('Method not implemented.');
    }
}

const fooWallet1 = new FooWallet();
const fooWallet2: Wallet<FooWalletAccount> = fooWallet1;

fooWallet1.connect({
    chains: ['mainnet'],
    features: ['signTransaction', 'signMessage'],
});

fooWallet2.connect({
    chains: ['mainnet'],
    features: ['signTransaction', 'signMessage'],
});

(async function () {
    ((window as WalletsWindow<SolanaWalletAccount>).navigator.wallets ||= []).push({
        method: 'register',
        wallets: [{} as SolanaWallet],
        callback() {},
    });
    ((window as WalletsWindow<FooWalletAccount>).navigator.wallets ||= []).push({
        method: 'register',
        wallets: [fooWallet1],
        callback() {},
    });
    ((window as WalletsWindow<FooWalletAccount>).navigator.wallets ||= []).push({
        method: 'register',
        wallets: [fooWallet2],
        callback() {},
    });

    const wallets = initialize<SolanaWalletAccount | FooWalletAccount>();
    const wallet = wallets.get()[0];
    const account = (await wallet.connect({ chains: ['solana:mainnet'] })).accounts[0];

    // @ts-expect-error expected
    account.features.signTransaction;
    // @ts-expect-error expected
    account.features.one;
    // @ts-expect-error expected
    account.features.two;
    // @ts-expect-error expected
    account.features.three;

    // FIXME: passing the chain here should eliminate FooWallet
    if ('signTransaction' in account.features) {
        account.features.signTransaction.signTransaction();
    }
})();
