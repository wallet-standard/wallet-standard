import type {
    Wallet,
    WalletInterface,
    WalletAccount,
    WalletEventNames,
    WalletEvents,
    WalletAccountEventNames,
    WalletAccountEvents,
    WalletInterfaceEventNames,
    WalletInterfaceEvents,
} from '../src';

class GlowWallet implements Wallet {
    version = '1.0.0' as const;
    name = 'Glow';
    icon = 'glow.svg';
    interfaces = {
        solana: new GlowSolanaWalletInterface(),
    };

    on<E extends WalletEventNames<this>>(event: E, listener: WalletEvents<this>[E]): () => void {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return () => {};
    }
}

class GlowSolanaWalletInterface implements WalletInterface {
    version = '1.0.0' as const;
    name = 'solana';
    chains = ['solana:mainnet', 'solana:devnet'];
    features = {
        connect: {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            connect() {},
        },
    };
    extensions = {
        glow: {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            signIn() {},
        },
    };
    accounts = [new GlowSolanaWalletAccount()];

    on<E extends WalletInterfaceEventNames<this>>(event: E, listener: WalletInterfaceEvents<this>[E]): () => void {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return () => {};
    }
}

class GlowSolanaWalletAccount implements WalletAccount {
    address = new Uint8Array();
    publicKey = new Uint8Array();
    chains = ['solana:mainnet', 'solana:devnet', 'solana:testnet', 'solana:localnet'];
    features = {
        signTransaction: {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            signTransaction() {},
        },
        signMessage: {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            signMessage() {},
        },
    };
    extensions = {};

    on<E extends WalletAccountEventNames<this>>(event: E, listener: WalletAccountEvents<this>[E]): () => void {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return () => {};
    }
}

const wallet = new GlowWallet();
const solana = wallet.interfaces.solana;

solana.features.connect.connect();
solana.extensions.glow.signIn();

const account = solana.accounts[0]!;

account.features.signTransaction.signTransaction();
account.features.signMessage.signMessage();
