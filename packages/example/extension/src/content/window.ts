import { initializeWallet } from '@wallet-standard/core';
import { createRPC, createWindowTransport } from '../messages';
import { MultiChainWallet } from './multiChainWallet';

function register(): void {
    const transport = createWindowTransport(window);
    const rpc = createRPC(transport);
    initializeWallet(new MultiChainWallet(rpc));
}

register();
