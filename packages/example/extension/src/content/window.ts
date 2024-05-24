import { registerWallet } from '@wallet-standard/core';
import { createRPC, createWindowTransport } from '../messages/index';
import { MultiChainWallet } from './multiChainWallet';

function register(): void {
    const transport = createWindowTransport(window);
    const rpc = createRPC(transport);
    registerWallet(new MultiChainWallet(rpc));
}

register();
