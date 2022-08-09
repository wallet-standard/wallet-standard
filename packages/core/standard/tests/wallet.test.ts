import {
    SignAndSendTransactionFeature,
    SignTransactionFeature,
    Wallet,
    WalletAccount,
    WalletAccountFeature,
} from '../src';

// A Solana account that supports all the features
interface SolanaWalletAccount extends WalletAccount {
    chain: 'solana:mainnet' | 'solana:devnet' | 'solana:testnet';
    features: WalletAccountFeature<this>;
}

// A Solana account on a Ledger device that can only sign transactions
interface SolanaLedgerWalletAccount extends WalletAccount {
    chain: 'solana:mainnet' | 'solana:devnet' | 'solana:testnet';
    features: SignTransactionFeature<this> | SignAndSendTransactionFeature<this>;
}

// A custom feature for an account to implement
type SubscribeFeature = {
    subscribe: {
        subscribe(event: string): void;
    };
};

// An account on a different chain that supports all the features, and a custom one
interface EthereumWalletAccount extends WalletAccount {
    chain: 'ethereum:mainnet';
    features: WalletAccountFeature<this> | SubscribeFeature;
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
    // Good -- this may be a Solana, Ledger, or Ethereum account
    const account = wallet.accounts[0];

    // Good -- this fails because while `signTransaction` is a feature of the accounts, we don't know if we have access to it
    // @ts-expect-error expected
    await account.features.signTransaction.signTransaction({ transactions: [] });

    if ('signTransaction' in account.features) {
        // Good -- this succeeds because we feature detected the feature, and statically know its signature
        await account.features.signTransaction.signTransaction({ transactions: [] });
    }

    await wallet.connect({
        // Good -- this fails because it isn't a known chain for any of the accounts
        // @ts-expect-error expected
        chains: ['unknownChain', 'solana:mainnet'],
        features: ['signTransaction'],
    });

    await wallet.connect({
        chains: ['solana:mainnet'],
        // Good -- this fails because it isn't a known feature for any of the accounts
        // @ts-expect-error expected
        features: ['unknownFeature', 'signTransaction'],
    });

    // Good -- this succeeds because `features` are not required, and the wallet should grant all
    const accountWithAnyFeatures = (
        await wallet.connect({
            chains: ['ethereum:mainnet'],
        })
    ).accounts[0];

    // Good -- this fails because we can't know that each account will actually have every feature just because we asked for it
    // @ts-expect-error expected
    await accountWithAnyFeatures.features.signTransaction.signTransaction({ transactions: [] });

    if ('signTransaction' in accountWithAnyFeatures.features) {
        // Good -- this succeeds because if the account does have the feature, we know it's signature
        await accountWithAnyFeatures.features.signTransaction.signTransaction({ transactions: [] });
    }

    // Good -- this succeeds because if `features` is empty, and the wallet should grant none (aka "readonly" access)
    const accountWithNoFeatures = (
        await wallet.connect({
            chains: ['ethereum:mainnet'],
            features: [],
        })
    ).accounts[0];

    // Good -- this fails because the account has no features
    // @ts-expect-error expected
    await accountWithNoFeatures.features.signTransaction.signTransaction({ transactions: [] });

    if ('signTransaction' in accountWithNoFeatures.features) {
        // Good -- this fails because the account has no features, even though we know what its signature would be
        // @ts-expect-error expected
        await accountWithNoFeatures.features.signTransaction.signTransaction({ transactions: [] });
    }

    // Good -- this succeeds because the chain and features are known
    const accountWithOneFeature = (
        await wallet.connect({
            chains: ['solana:mainnet'],
            features: ['signTransaction'],
        })
    ).accounts[0];

    // Good -- this succeeds because the account includes the feature
    await accountWithOneFeature.features.signTransaction.signTransaction({ transactions: [] });
    // Good -- this fails because the account excludes the feature, even though the account type includes it
    // @ts-expect-error expected
    await accountWithOneFeature.features.signMessage.signMessage({ messages: [] });

    if ('signMessage' in accountWithOneFeature.features) {
        // Good -- this fails because the account has no signature for `signMessage`
        // @ts-expect-error expected
        await accountWithOneFeature.features.signMessage.signMessage({ messages: [] });
    }

    // Good -- this succeeds because the chain and features are known
    const accountWithMultipleFeatures = (
        await wallet.connect({
            chains: ['solana:mainnet'],
            features: ['signTransaction', 'signMessage'],
        })
    ).accounts[0];

    // Good -- these succeed because the account includes the feature
    await accountWithMultipleFeatures.features.signTransaction.signTransaction({ transactions: [] });
    await accountWithMultipleFeatures.features.signMessage.signMessage({ messages: [] });

    // Good -- this fails because the account doesn't include the feature
    // @ts-expect-error expected
    await accountWithMultipleFeatures.features.signAndSendTransaction.signAndSendTransaction({ transactions: [] });

    // Good -- this succeeds because the chain and features are known
    const accountWithCustomFeature = (
        await wallet.connect({
            chains: ['ethereum:mainnet'],
            features: ['subscribe'],
        })
    ).accounts[0];

    // Good -- this succeeds because the account includes the feature
    await accountWithCustomFeature.features.subscribe.subscribe('change');

    // TODO: add test for encrypt/decrypt feature cipher
})();
