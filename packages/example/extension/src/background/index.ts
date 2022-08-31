import { CONTENT_PORT_NAME, createPortTransport, createRPC } from '../messages';
import { getMnemonic, setMnemonic } from './storage';
import { generateMnemonic, getAccounts } from './wallet';

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        const mnemonic = generateMnemonic();
        setMnemonic(mnemonic);
    }
});

chrome.runtime.onConnect.addListener((port) => {
    if (port.name === CONTENT_PORT_NAME) {
        const transport = createPortTransport(port);
        const rpc = createRPC(transport);

        rpc.exposeMethod('connect', async () => {
            // TODO: Open popup and allow user to select accounts.
            const mnemonic = await getMnemonic();
            return getAccounts(mnemonic);
        });

        port.onDisconnect.addListener(() => {
            rpc.end();
        });
    }
});
