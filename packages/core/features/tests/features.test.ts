import type {
    ConnectInput,
    ConnectOutput,
    Wallet,
    WalletAccount,
    WalletAccountEventNames,
    WalletAccountEvents,
    WalletEventNames,
    WalletEvents,
} from '@wallet-standard/standard';
import type { SignMessageFeature, SignTransactionFeature } from '..';

type GlowFeature = {
    'glow:': {
        signIn(): void;
    };
};

class GlowWallet implements Wallet {
    version = '1.0.0' as const;
    name = 'Glow';
    icon = `data:image/png;base64,` as const;
    chains = ['solana:mainnet', 'solana:devnet'] as const;
    features: SignTransactionFeature & SignMessageFeature & GlowFeature = {
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

    async connect(input?: ConnectInput): Promise<ConnectOutput> {
        return { accounts: this.accounts };
    }

    on<E extends WalletEventNames>(event: E, listener: WalletEvents[E]): () => void {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return () => {};
    }
}

class GlowSolanaWalletAccount implements WalletAccount {
    address = '';
    publicKey = new Uint8Array();
    chains = ['solana:mainnet', 'solana:devnet', 'solana:testnet', 'solana:localnet'] as const;
    features = ['standard:signMessage', 'standard:signTransaction'] as const;

    on<E extends WalletAccountEventNames>(event: E, listener: WalletAccountEvents[E]): () => void {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return () => {};
    }
}

const wallet = new GlowWallet();

await wallet.connect();
const account = wallet.accounts[0]!;

const [{ signedTransaction }] = await wallet.features['standard:signTransaction'].signTransaction({
    account,
    chain: 'solana',
    transaction: new Uint8Array(),
});
const [{ signedMessage, signature }] = await wallet.features['standard:signMessage'].signMessage({
    account,
    message: new Uint8Array(),
});

wallet.features['glow:'].signIn();
