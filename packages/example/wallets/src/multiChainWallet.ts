import { CHAIN_ETHEREUM, CHAIN_SOLANA_MAINNET, Wallet } from '@solana/wallet-standard';
import { AbstractWallet } from './abstractWallet';
import { EthereumWalletAccount, SignerEthereumWalletAccount } from './ethereumWallet';
import { LedgerSolanaWalletAccount, SignerSolanaWalletAccount, SolanaWalletAccount } from './solanaWallet';

export type MultiChainWalletAccount = SolanaWalletAccount | EthereumWalletAccount;

export class MultiChainWallet
    extends AbstractWallet<MultiChainWalletAccount>
    implements Wallet<MultiChainWalletAccount>
{
    private _name = 'MultiChain Wallet';
    private _icon = '';

    get name(): string {
        return this._name;
    }

    get icon(): string {
        return this._icon;
    }

    constructor() {
        super([
            new SignerSolanaWalletAccount({ chain: CHAIN_SOLANA_MAINNET }),
            new LedgerSolanaWalletAccount({ chain: CHAIN_SOLANA_MAINNET }),
            new SignerEthereumWalletAccount({ chain: CHAIN_ETHEREUM }),
        ]);
    }
}
