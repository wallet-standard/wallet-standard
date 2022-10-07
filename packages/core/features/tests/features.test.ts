import type { WalletAccount, WalletWithFeatures } from '@wallet-standard/standard';
import type { ConnectFeature, EventsFeature, SignMessageFeature, SignTransactionFeature, StandardFeatures } from '..';

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
    features: ConnectFeature & EventsFeature & SignTransactionFeature & SignMessageFeature & GlowFeature = {
        'standard:connect': {
            version: '1.0.0',
            connect: async () => ({ accounts: this.accounts }),
        },
        'standard:events': {
            version: '1.0.0',
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            on: (event, listener) => () => {},
        },
        'standard:signTransaction': {
            version: '1.0.0',
            async signTransaction(...inputs) {
                return [] as any;
            },
        },
        'standard:signMessage': {
            version: '1.0.0',
            async signMessage(...inputs) {
                return [] as any;
            },
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
    features = ['standard:signMessage', 'standard:signTransaction'] as const;
}

const wallet: WalletWithFeatures<StandardFeatures & GlowFeature> = new GlowWallet();

if ('standard:events' in wallet.features) {
    wallet.features['standard:events'].on('change', (properties) => console.log(properties));
}

let accounts: ReadonlyArray<WalletAccount>;
if ('standard:connect' in wallet.features) {
    ({ accounts } = await wallet.features['standard:connect'].connect());
} else {
    ({ accounts } = wallet);
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const account = accounts[0]!;

if ('standard:signTransaction' in wallet.features) {
    await wallet.features['standard:signTransaction'].signTransaction({
        account,
        chain: 'solana:devnet',
        transaction: new Uint8Array(),
    });
}

if ('standard:signMessage' in wallet.features) {
    await wallet.features['standard:signMessage'].signMessage({
        account,
        message: new Uint8Array(),
    });
}

if ('glow:' in wallet.features) {
    wallet.features['glow:'].signIn();
}
