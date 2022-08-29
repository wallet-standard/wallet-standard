import { CONTENT_PORT_NAME, createPortTransport, createRPC } from '../messages';
import { deriveEthereumAccount, deriveSolanaAccount, generateMnemonic } from './wallet';

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        const mnemonic = generateMnemonic();
        chrome.storage.local.set({ mnemonic });
    }
});

chrome.runtime.onConnect.addListener((port) => {
    if (port.name === CONTENT_PORT_NAME) {
        const transport = createPortTransport(port);
        const rpc = createRPC(transport);

        rpc.exposeMethod('connect', async () => {
            const { mnemonic } = await chrome.storage.local.get('mnemonic');
            const ethereumAccount = deriveEthereumAccount(mnemonic);
            const solanaAccount = deriveSolanaAccount(mnemonic);

            // TODO: Open popup and allow user to select accounts.
            return [
                { chain: 'ethereum', publicKey: ethereumAccount.publicKey },
                { chain: 'solana', publicKey: solanaAccount.publicKey },
            ];
        });

        port.onDisconnect.addListener(() => {
            rpc.end();
        });
    }
});
