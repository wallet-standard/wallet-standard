import type {
    ConnectInput,
    ConnectOutput,
    Wallet,
    WalletAccount,
    WalletAccountEventNames,
    WalletAccountEvents,
    WalletEventNames,
    WalletEvents,
} from '../src';

class GlowWallet implements Wallet {
    version = '1.0.0' as const;
    name = 'Glow';
    icon = 'glow.svg';
    chains = ['solana:mainnet', 'solana:devnet'];
    features = {
        signTransaction: {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            signTransaction(account: WalletAccount, chain: string, transaction: Uint8Array) {},
        },
        signMessage: {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            signMessage(account: WalletAccount, message: Uint8Array) {},
        },
    };
    extensions = {
        glow: {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            signIn() {},
        },
    };
    accounts = [new GlowSolanaWalletAccount()];

    async connect(input?: ConnectInput): Promise<ConnectOutput> {
        return { accounts: this.accounts };
    }

    on<E extends WalletEventNames<this>>(event: E, listener: WalletEvents<this>[E]): () => void {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return () => {};
    }
}

class GlowSolanaWalletAccount implements WalletAccount {
    address = '';
    publicKey = new Uint8Array();
    chains = ['solana:mainnet', 'solana:devnet', 'solana:testnet', 'solana:localnet'];
    features = ['signMessage', 'signTransaction'];
    extensions = [];

    on<E extends WalletAccountEventNames<this>>(event: E, listener: WalletAccountEvents<this>[E]): () => void {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return () => {};
    }
}

const wallet = new GlowWallet();

await wallet.connect();
const account = wallet.accounts[0]!;

wallet.features.signTransaction.signTransaction(account, 'solana', new Uint8Array());
wallet.features.signMessage.signMessage(account, new Uint8Array());

wallet.extensions.glow.signIn();
