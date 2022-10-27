import type { WalletAccount, WalletWithFeatures } from '@wallet-standard/base';
import type { ConnectFeature, EventsFeature, StandardFeatures } from '..';

type GlowFeature = {
    'glow:': {
        signIn(): void;
    };
};

class GlowWallet implements WalletWithFeatures<StandardFeatures & GlowFeature> {
    version = '1.0.0' as const;
    name = 'Glow';
    icon = `data:image/png;base64,` as const;
    chains = ['solana:mainnet', 'solana:devnet'] as const;
    features: ConnectFeature & EventsFeature & GlowFeature = {
        'standard:connect': {
            version: '1.0.0',
            connect: async () => ({ accounts: this.accounts }),
        },
        'standard:events': {
            version: '1.0.0',
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            on: (event, listener) => () => {},
        },
        'glow:': {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            signIn() {},
        },
    };
    accounts = [new GlowSolanaWalletAccount()];
}

class GlowSolanaWalletAccount implements WalletAccount {
    address = '';
    publicKey = new Uint8Array();
    chains = ['solana:mainnet', 'solana:devnet', 'solana:testnet', 'solana:localnet'] as const;
    features = [] as const;
}

const wallet: WalletWithFeatures<StandardFeatures & GlowFeature> = new GlowWallet();

if ('standard:events' in wallet.features) {
    wallet.features['standard:events'].on('change', (properties) => console.log(properties));
}

if ('standard:connect' in wallet.features) {
    await wallet.features['standard:connect'].connect();
}

if ('glow:' in wallet.features) {
    wallet.features['glow:'].signIn();
}
