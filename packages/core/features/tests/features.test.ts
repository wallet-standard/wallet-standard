import type { WalletAccount, WalletWithFeatures } from '@wallet-standard/base';
import { StandardConnect, StandardDisconnect, StandardEvents, type StandardFeatures } from '../src/index';

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
    features: StandardFeatures & FooWalletFeature = {
        [StandardConnect]: {
            version: '1.0.0',
            connect: async () => ({ accounts: this.accounts }),
        },
        [StandardDisconnect]: {
            version: '1.0.0',
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            disconnect: async () => {},
        },
        [StandardEvents]: {
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

if (StandardEvents in wallet.features) {
    wallet.features[StandardEvents].on('change', (properties) => console.log(properties));
}

if (StandardConnect in wallet.features) {
    await wallet.features[StandardConnect].connect();
}

if (StandardDisconnect in wallet.features) {
    await wallet.features[StandardDisconnect].disconnect();
}

if ('foo:' in wallet.features) {
    wallet.features['foo:'].doSomethingCool();
}
