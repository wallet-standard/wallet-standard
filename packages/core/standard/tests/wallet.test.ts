import type { ConnectInput, ConnectOutput, Wallet, WalletAccount, WalletEventNames, WalletEvents } from '../src';

interface WalletAccountWithChainAndFeatures<
    W extends Wallet,
    Chain extends keyof W['chains'],
    Feature extends keyof W['features']
> extends Omit<WalletAccount, 'chains' | 'features'> {
    chains: { [name in Chain]: true };
    features: { [name in Feature]: true };
}

// Standard feature for an account to implement
type SignTransactionFeature<W extends Wallet> = {
    signTransaction: {
        signTransaction<Chain extends keyof W['chains']>(input: {
            chain: Chain;
            account: WalletAccountWithChainAndFeatures<W, Chain, 'signTransaction'>;
        }): void;
    };
};

type SignMessageFeature<W extends Wallet> = {
    signMessage: {
        signMessage<Chain extends keyof W['chains']>(input: {
            chain: Chain;
            account: WalletAccountWithChainAndFeatures<W, Chain, 'signMessage'>;
        }): void;
    };
};

// A Solana account that supports all the features
interface SolanaWallet extends Wallet {
    chains: { 'solana:mainnet': true; 'solana:devnet': true; 'solana:testnet': true };
    features: SignTransactionFeature<this> & SignMessageFeature<this>;
    extensions: Record<never, unknown>;
    accounts: WalletAccount<this>[];
}

// A Solana account on a Ledger device that can only sign transactions
interface SolanaLedgerWallet extends Wallet {
    chains: { 'solana:mainnet': true; 'solana:devnet': true; 'solana:testnet': true };
    features: SignTransactionFeature<this>;
    extensions: Record<never, unknown>;
    accounts: WalletAccount<this>[];
}

// A nonstandard feature for an account to implement
type SubscribeExtension<W extends Wallet> = {
    subscribe: {
        subscribe<Chain extends keyof W['chains']>(input: { chain: Chain }): void;
    };
};

// An account on a different chain that supports all the features, and a custom one
interface EthereumWallet extends Wallet {
    chains: { 'ethereum:mainnet': true };
    features: SignTransactionFeature<this> & SignMessageFeature<this>;
    extensions: SubscribeExtension<this>;
    accounts: WalletAccount<this>[];
}

// A wallet that supports multiple account types
class MultiChainWallet implements Wallet {
    version = '1.0.0' as const;
    name = '';
    icon = '';
    chains = {
        'solana:mainnet': true,
        'solana:devmet': true,
        'solana:testnet': true,
        'ethereum:mainnet': true,
    };
    features: SignTransactionFeature<this> & SignMessageFeature<this> = {
        signTransaction: {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            signTransaction() {},
        },
        signMessage: {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            signMessage() {},
        },
    };
    extensions: SubscribeExtension<this> = {
        subscribe: {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            subscribe() {},
        },
    };
    accounts: WalletAccount<this>[] = [];
    async connect(input?: ConnectInput<this>): Promise<ConnectOutput<this>> {
        return { accounts: [] };
    }
    on<E extends WalletEventNames<this>>(event: E, listener: WalletEvents<this>[E]): () => void {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return () => {};
    }
}

const w = {} as MultiChainWallet;
const a = {} as WalletAccount<MultiChainWallet>;

if (a.chains['solana:mainnet'] && a.features.signMessage) {
    w.features.signMessage.signMessage({ chain: 'solana:mainnet', account: a });
}

// w.extensions.subscribe.subscribe({ chain: 'solana:mainnet' });

/*

subscribe should only be valid with ethereum wallet

wallet needs a way to express features only valid for some chains

perhaps the impedance mismatch here is that

*/

// (async function () {
//     // A test instance of this interface
//     const wallet = {} as MultiChainWallet;
//
//     // Good -- this may be any of the Solana or Ethereum chains
//     const chains = wallet.chains;
//     // Good -- this may be any of the Solana, Ledger, or Ethereum features, even though some don't exist on Ledger
//     const features = wallet.features;
//     // Good -- this may be a Solana, Ledger, or Ethereum account
//     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//     const account = wallet.accounts[0]!;
//
//     // Good -- this fails because while `signTransaction` is a feature of the accounts, we don't know if we have access to it
//     // @ts-expect-error expected
//     await wallet.features.signTransaction.signTransaction({ account });
//
//     if ('signTransaction' in account.features) {
//         // Good -- this succeeds because we feature detected the feature, and statically know its signature
//         await wallet.features.signTransaction.signTransaction({ account });
//     }
//
//     await wallet.connect({
//         // Good -- this fails because it isn't a known chain for any of the accounts
//         // @ts-expect-error expected
//         chains: ['unknownChain', 'solana:mainnet'],
//         features: ['signTransaction'],
//     });
//
//     await wallet.connect({
//         chains: ['solana:mainnet'],
//         // Good -- this fails because it isn't a known feature for any of the accounts
//         // @ts-expect-error expected
//         features: ['unknownFeature', 'signTransaction'],
//     });
//
//     // Good -- this succeeds because `features` are not required, and the wallet should grant all
//     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//     const accountWithAnyFeatures = (
//         await wallet.connect({
//             chains: ['ethereum:mainnet'],
//         })
//     ).accounts[0]!;
//
//     // Good -- this fails because we can't know that each account will actually have every feature just because we asked for it
//     // @ts-expect-error expected
//     await wallet.features.signTransaction.signTransaction({ account: accountWithAnyFeatures });
//
//     if ('signTransaction' in accountWithAnyFeatures.features) {
//         // Good -- this succeeds because if the account does have the feature, we know it's signature
//         await wallet.features.signTransaction.signTransaction({ account: accountWithAnyFeatures });
//     }
//
//     // Good -- this succeeds because if `features` is empty, and the wallet should grant none (aka "readonly" access)
//     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//     const accountWithNoFeatures = (
//         await wallet.connect({
//             chains: ['ethereum:mainnet'],
//             features: [],
//         })
//     ).accounts[0]!;
//
//     // Good -- this fails because the account has no features
//     // @ts-expect-error expected
//     await wallet.features.signTransaction.signTransaction({ account: accountWithNoFeatures });
//
//     if ('signTransaction' in accountWithNoFeatures.features) {
//         // Good -- this fails because the account has no features, even though we know what its signature would be
//         // @ts-expect-error expected
//         await wallet.features.signTransaction.signTransaction({ account: accountWithNoFeatures });
//     }
//
//     // Good -- this succeeds because the chain and features are known
//     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//     const accountWithOneFeature = (
//         await wallet.connect({
//             chains: ['solana:mainnet'],
//             features: ['signTransaction'],
//         })
//     ).accounts[0]!;
//
//     // Good -- this succeeds because the account includes the feature
//     await wallet.features.signTransaction.signTransaction({ account: accountWithOneFeature });
//     // Good -- this fails because the account excludes the feature, even though the account type includes it
//     // @ts-expect-error expected
//     await wallet.features.signMessage.signMessage({ account: accountWithOneFeature });
//
//     if ('signMessage' in accountWithOneFeature.features) {
//         // Good -- this fails because the account has no signature for `signMessage`
//         // @ts-expect-error expected
//         await wallet.features.signMessage.signMessage({ account: accountWithOneFeature });
//     }
//
//     // Good -- this succeeds because the chain and features are known
//     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//     const accountWithMultipleFeatures = (
//         await wallet.connect({
//             chains: ['solana:mainnet'],
//             features: ['signTransaction', 'signMessage'],
//         })
//     ).accounts[0]!;
//
//     // Good -- these succeed because the account includes the feature
//     await wallet.features.signTransaction.signTransaction({ account: accountWithMultipleFeatures });
//     await wallet.features.signMessage.signMessage({ account: accountWithMultipleFeatures });
//
//     // Good -- this fails because the account doesn't include the feature
//     // @ts-expect-error expected
//     await wallet.features.signAndSendTransaction.signAndSendTransaction({ account: accountWithMultipleFeatures });
//
//     // Good -- this succeeds because the chain and extensions are known
//     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//     const accountWithExtension = (
//         await wallet.connect({
//             chains: ['ethereum:mainnet'],
//             extensions: ['subscribe'],
//         })
//     ).accounts[0]!;
//
//     // Good -- this succeeds because the account includes the nonstandard feature
//     await wallet.extensions.subscribe.subscribe({ account: accountWithExtension });
//
//     // TODO: add test for encrypt/decrypt feature cipher
// })();
