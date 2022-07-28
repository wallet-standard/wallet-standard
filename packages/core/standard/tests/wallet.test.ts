import {
    CHAIN_ETHEREUM,
    CHAIN_SOLANA_DEVNET,
    CHAIN_SOLANA_MAINNET,
    CHAIN_SOLANA_TESTNET,
    CIPHER_DEFAULT,
    SignAndSendTransactionMethod,
    SignTransactionMethod,
    Wallet,
    WalletAccount,
    WalletAccountMethod,
} from '../src';

type SolanaWalletChain = typeof CHAIN_SOLANA_MAINNET | typeof CHAIN_SOLANA_DEVNET | typeof CHAIN_SOLANA_TESTNET;

// A Solana account that supports all the methods
interface SolanaWalletAccount extends WalletAccount {
    chain: SolanaWalletChain;
    methods: WalletAccountMethod<this>;
    ciphers: typeof CIPHER_DEFAULT[];
}

// A Solana account on a Ledger device that can only sign transactions
interface SolanaLedgerWalletAccount extends WalletAccount {
    chain: SolanaWalletChain;
    methods: SignTransactionMethod<this> | SignAndSendTransactionMethod<this>;
    ciphers: never;
}

// A custom method for an account to implement
interface SubscribeMethod {
    subscribe(event: string): void;
}

// An account on a different chain that supports all the methods, and a custom one
interface EthereumWalletAccount extends WalletAccount {
    chain: typeof CHAIN_ETHEREUM;
    methods: WalletAccountMethod<this> | SubscribeMethod;
    ciphers: typeof CIPHER_DEFAULT[];
}

// A wallet that supports multiple account types
type MultiChainWallet = Wallet<SolanaWalletAccount | SolanaLedgerWalletAccount | EthereumWalletAccount>;

(async function () {
    // A test instance of this interface
    const wallet = {} as MultiChainWallet;

    // Good -- this may be any of the Solana or Ethereum chains
    const chains = wallet.chains;
    // Good -- this may be any of the Solana, Ledger, or Ethereum methods, even though some don't exist on Ledger
    const methods = wallet.methods;
    // Good -- this may be any of the Solana or Ethereum ciphers, even though Ledger never has them
    const ciphers = wallet.ciphers;
    // Good -- this may be a Solana, Ledger, or Ethereum account
    const account = wallet.accounts[0];

    // Good -- this fails because while `signTransaction` is a method of the accounts, we don't know if we have access to it
    // @ts-expect-error
    account.methods.signTransaction({ transactions: [] });

    if ('signTransaction' in account.methods) {
        // Good -- this succeeds because we feature detected the method, and statically know its signature
        account.methods.signTransaction({ transactions: [] });
    }

    await wallet.connect({
        // Good -- this fails because it isn't a known chain for any of the accounts
        // @ts-expect-error
        chains: ['unknownChain', CHAIN_SOLANA_MAINNET],
        methods: ['signTransaction'],
    });

    await wallet.connect({
        chains: [CHAIN_SOLANA_MAINNET],
        // Good -- this fails because it isn't a known method for any of the accounts
        // @ts-expect-error
        methods: ['unknownMethod', 'signTransaction'],
    });

    // Good -- this succeeds because `methods` are not required, and the wallet should grant all
    const accountWithAnyMethods = (
        await wallet.connect({
            chains: [CHAIN_ETHEREUM],
        })
    ).accounts[0];

    // Good -- this fails because we can't know that each account will actually have every method just because we asked for it
    // @ts-expect-error
    accountWithAnyMethods.methods.signTransaction({ transactions: [] });

    if ('signTransaction' in accountWithAnyMethods.methods) {
        // Good -- this succeeds because if the account does have the method, we know it's signature
        accountWithAnyMethods.methods.signTransaction({ transactions: [] });
    }

    // Good -- this succeeds because if `methods` is empty, and the wallet should grant none (aka "readonly" access)
    const accountWithNoMethods = (
        await wallet.connect({
            chains: [CHAIN_ETHEREUM],
            methods: [],
        })
    ).accounts[0];

    // Good -- this fails because the account has no methods
    // @ts-expect-error
    accountWithNoMethods.methods.signTransaction({ transactions: [] });

    if ('signTransaction' in accountWithNoMethods.methods) {
        // Good -- this fails because the account has no methods, even though we know what its signature would be
        // @ts-expect-error
        accountWithNoMethods.methods.signTransaction({ transactions: [] });
    }

    // Good -- this succeeds because the chain and methods are known
    const accountWithOneMethod = (
        await wallet.connect({
            chains: [CHAIN_SOLANA_MAINNET],
            methods: ['signTransaction'],
        })
    ).accounts[0];

    // Good -- this succeeds because the account includes the method
    accountWithOneMethod.methods.signTransaction({ transactions: [] });
    // Good -- this fails because the account excludes the method, even though the account type includes it
    // @ts-expect-error
    accountWithOneMethod.methods.signMessage({ messages: [] });

    if ('signMessage' in accountWithOneMethod.methods) {
        // Good -- this fails because the account has no signature for `signMessage`
        // @ts-expect-error
        accountWithOneMethod.methods.signMessage({ messages: [] });
    }

    // Good -- this succeeds because the chain and methods are known
    const accountWithMultipleMethods = (
        await wallet.connect({
            chains: [CHAIN_SOLANA_MAINNET],
            methods: ['signTransaction', 'signMessage'],
        })
    ).accounts[0];

    // Good -- these succeed because the account includes the method
    accountWithMultipleMethods.methods.signTransaction({ transactions: [] });
    accountWithMultipleMethods.methods.signMessage({ messages: [] });

    // Good -- this fails because the account doesn't include the method
    // @ts-expect-error
    accountWithMultipleMethods.methods.signAndSendTransaction({ transactions: [] });

    // Good -- this succeeds because the chain and methods are known
    const accountWithCustomMethod = (
        await wallet.connect({
            chains: [CHAIN_ETHEREUM],
            methods: ['subscribe'],
        })
    ).accounts[0];

    // Good -- this succeeds because the account includes the method
    accountWithCustomMethod.methods.subscribe('change');
})();
