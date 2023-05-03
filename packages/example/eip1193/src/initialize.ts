import type { EIP1193Provider } from 'eip1193-provider';
import { registerWallet } from './register.js';
import { EIP1193Wallet } from './wallet.js';

export function initialize(provider: EIP1193Provider): void {
    registerWallet(new EIP1193Wallet(provider));
}
