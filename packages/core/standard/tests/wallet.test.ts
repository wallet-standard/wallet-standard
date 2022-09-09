import type {
    Wallet,
    WalletAccount,
    WalletAccountEventNames,
    WalletAccountEvents,
    WalletEventNames,
    WalletEvents,
} from '..';

class GlowWallet implements Wallet {
    version = '1.0.0' as const;
    name = 'Glow';
    icon = `data:image/png;base64,` as const;
    chains = ['solana:mainnet', 'solana:devnet'] as const;
    features = {
        'standard:connect': {
            connect: async () => ({ accounts: this.accounts }),
        },
        'standard:signTransaction': {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            signTransaction(account: WalletAccount, chain: string, transaction: Uint8Array) {},
        },
        'standard:signMessage': {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            signMessage(account: WalletAccount, message: Uint8Array) {},
        },
        'glow:': {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            signIn() {},
        },
    };
    accounts = [new GlowSolanaWalletAccount()];

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

const account = wallet.accounts[0]!;

await wallet.features['standard:connect'].connect();

wallet.features['standard:signTransaction'].signTransaction(account, 'solana', new Uint8Array());
wallet.features['standard:signMessage'].signMessage(account, new Uint8Array());
wallet.features['glow:'].signIn();
