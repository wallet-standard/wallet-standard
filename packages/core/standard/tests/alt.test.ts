export {};

declare const window: any;
window.wallets.get(); // TODO: should this take args to filter for features/extensions?

const wallet = {} as any;
const account = wallet.accounts[0];
const chain = 'solana:mainnet';
const transaction = new Uint8Array();

wallet.features.connect.connect(); // or wallet.connect()? What about multiple versions?
wallet.features.connect['1.0.0'].connect(); // Too brittle, no way to detect

const feature = wallet.feature('signTransaction', '^1.0.0'); // Lose type safety
feature.signTransaction({ account, chain, transaction });

const backpack = wallet.feature('backpack', '*');
backpack.connection;

wallet.features.signTransaction.signTransaction({ account, chain, transaction });
wallet.features.signMessage['1.0.0'].signMessage({ account, chain, transaction });

wallet.extensions.glow['1.0.0'].signIn();
wallet.extensions.backpack.connection;

// Solana Account
account.chains = ['solana:mainnet', 'solana:devnet', 'solana:localnet'];
account.features = ['signTransaction', 'signMessage'];

// Solana Ledger Account
account.chains = ['solana:mainnet', 'solana:devnet', 'solana:localnet'];
account.features = ['signTransaction'];

// Ethereum Account
account.chains = ['ethereum'];
account.features = ['signTransaction', 'signMessage'];
account.extensions = ['ethereum'];
