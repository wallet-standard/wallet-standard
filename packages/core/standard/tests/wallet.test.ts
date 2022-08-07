import {
    CHAIN_ETHEREUM,
    CHAIN_SOLANA_DEVNET,
    CHAIN_SOLANA_MAINNET,
    CHAIN_SOLANA_TESTNET,
    CIPHER_DEFAULT,
    SignAndSendTransactionFeature,
    SignTransactionFeature,
    Wallet,
    WalletAccount,
    WalletAccountFeature,
} from '../src';

type SolanaWalletChain = typeof CHAIN_SOLANA_MAINNET | typeof CHAIN_SOLANA_DEVNET | typeof CHAIN_SOLANA_TESTNET;

// A Solana account that supports all the features
interface SolanaWalletAccount extends WalletAccount {
    chain: SolanaWalletChain;
    features: WalletAccountFeature<this>;
    ciphers: typeof CIPHER_DEFAULT[];
}

// A Solana account on a Ledger device that can only sign transactions
interface SolanaLedgerWalletAccount extends WalletAccount {
    chain: SolanaWalletChain;
    features: SignTransactionFeature<this> | SignAndSendTransactionFeature<this>;
    ciphers: never;
}

// A custom feature for an account to implement
interface SubscribeFeature {
    subscribe(event: string): void;
}

// An account on a different chain that supports all the features, and a custom one
interface EthereumWalletAccount extends WalletAccount {
    chain: typeof CHAIN_ETHEREUM;
    features: WalletAccountFeature<this> | SubscribeFeature;
    ciphers: typeof CIPHER_DEFAULT[];
}

// A wallet that supports multiple account types
type MultiChainWallet = Wallet<SolanaWalletAccount | SolanaLedgerWalletAccount | EthereumWalletAccount>;

(async function () {
    // A test instance of this interface
    const wallet = {} as MultiChainWallet;

    // Good -- this may be any of the Solana or Ethereum chains
    const chains = wallet.chains;
    // Good -- this may be any of the Solana, Ledger, or Ethereum features, even though some don't exist on Ledger
    const features = wallet.features;
    // Good -- this may be any of the Solana or Ethereum ciphers, even though Ledger never has them
    const ciphers = wallet.ciphers;
    // Good -- this may be a Solana, Ledger, or Ethereum account
    const account = wallet.accounts[0];

    // Good -- this fails because while `signTransaction` is a feature of the accounts, we don't know if we have access to it
    // @ts-expect-error expected
    account.features.signTransaction({ transactions: [] });

    if ('signTransaction' in account.features) {
        // Good -- this succeeds because we feature detected the feature, and statically know its signature
        account.features.signTransaction({ transactions: [] });
    }

    await wallet.connect({
        // Good -- this fails because it isn't a known chain for any of the accounts
        // @ts-expect-error expected
        chains: ['unknownChain', CHAIN_SOLANA_MAINNET],
        features: ['signTransaction'],
    });

    await wallet.connect({
        chains: [CHAIN_SOLANA_MAINNET],
        // Good -- this fails because it isn't a known feature for any of the accounts
        // @ts-expect-error expected
        features: ['unknownFeature', 'signTransaction'],
    });

    // Good -- this succeeds because `features` are not required, and the wallet should grant all
    const accountWithAnyFeatures = (
        await wallet.connect({
            chains: [CHAIN_ETHEREUM],
        })
    ).accounts[0];

    // Good -- this fails because we can't know that each account will actually have every feature just because we asked for it
    // @ts-expect-error expected
    accountWithAnyFeatures.features.signTransaction({ transactions: [] });

    if ('signTransaction' in accountWithAnyFeatures.features) {
        // Good -- this succeeds because if the account does have the feature, we know it's signature
        accountWithAnyFeatures.features.signTransaction({ transactions: [] });
    }

    // Good -- this succeeds because if `features` is empty, and the wallet should grant none (aka "readonly" access)
    const accountWithNoFeatures = (
        await wallet.connect({
            chains: [CHAIN_ETHEREUM],
            features: [],
        })
    ).accounts[0];

    // Good -- this fails because the account has no features
    // @ts-expect-error expected
    accountWithNoFeatures.features.signTransaction({ transactions: [] });

    if ('signTransaction' in accountWithNoFeatures.features) {
        // Good -- this fails because the account has no features, even though we know what its signature would be
        // @ts-expect-error expected
        accountWithNoFeatures.features.signTransaction({ transactions: [] });
    }

    // Good -- this succeeds because the chain and features are known
    const accountWithOneFeature = (
        await wallet.connect({
            chains: [CHAIN_SOLANA_MAINNET],
            features: ['signTransaction'],
        })
    ).accounts[0];

    // Good -- this succeeds because the account includes the feature
    accountWithOneFeature.features.signTransaction({ transactions: [] });
    // Good -- this fails because the account excludes the feature, even though the account type includes it
    // @ts-expect-error expected
    accountWithOneFeature.features.signMessage({ messages: [] });

    if ('signMessage' in accountWithOneFeature.features) {
        // Good -- this fails because the account has no signature for `signMessage`
        // @ts-expect-error expected
        accountWithOneFeature.features.signMessage({ messages: [] });
    }

    // Good -- this succeeds because the chain and features are known
    const accountWithMultipleFeatures = (
        await wallet.connect({
            chains: [CHAIN_SOLANA_MAINNET],
            features: ['signTransaction', 'signMessage'],
        })
    ).accounts[0];

    // Good -- these succeed because the account includes the feature
    accountWithMultipleFeatures.features.signTransaction({ transactions: [] });
    accountWithMultipleFeatures.features.signMessage({ messages: [] });

    // Good -- this fails because the account doesn't include the feature
    // @ts-expect-error expected
    accountWithMultipleFeatures.features.signAndSendTransaction({ transactions: [] });

    // Good -- this succeeds because the chain and features are known
    const accountWithCustomFeature = (
        await wallet.connect({
            chains: [CHAIN_ETHEREUM],
            features: ['subscribe'],
        })
    ).accounts[0];

    // Good -- this succeeds because the account includes the feature
    accountWithCustomFeature.features.subscribe('change');
})();
