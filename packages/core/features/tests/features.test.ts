import type { WalletAccount, WalletWithFeatures } from '@wallet-standard/base';
import type { ConnectFeature, EventsFeature, StandardFeatures } from '..';

type FooWalletFeature = {
    'foo:': {
        doSomethingCool(): void;
    };
};

class FooWallet implements WalletWithFeatures<StandardFeatures & FooWalletFeature> {
    version = '1.0.0' as const;
    name = 'Foo';
    icon = `data:image/png;base64,` as const;
    chains = ['foochain:mainnet', 'foochain:devnet'] as const;
    features: ConnectFeature & EventsFeature & FooWalletFeature = {
        'standard:connect': {
            version: '1.0.0',
            connect: async () => ({ accounts: this.accounts }),
        },
        'standard:events': {
            version: '1.0.0',
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            on: (event, listener) => () => {},
        },
        'foo:': {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            doSomethingCool() {},
        },
    };
    accounts = [new FooWalletAccount()];
}

class FooWalletAccount implements WalletAccount {
    address = '';
    publicKey = new Uint8Array();
    chains = ['foochain:mainnet', 'foochain:devnet', 'foochain:testnet', 'foochain:localnet'] as const;
    features = [] as const;
}

const wallet: WalletWithFeatures<StandardFeatures & FooWalletFeature> = new FooWallet();

if ('standard:events' in wallet.features) {
    wallet.features['standard:events'].on('change', (properties) => console.log(properties));
}

if ('standard:connect' in wallet.features) {
    await wallet.features['standard:connect'].connect();
}

if ('foo:' in wallet.features) {
    wallet.features['foo:'].doSomethingCool();
}
