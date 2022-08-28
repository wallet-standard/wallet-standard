import { CONTENT_PORT_NAME, createChannel, createPortTransport, serializeMessage } from '../messages';
import { generateMnemonic } from './wallet';

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        const mnemonic = generateMnemonic();
        chrome.storage.local.set({ mnemonic });
    }
});

chrome.runtime.onConnect.addListener((port) => {
    if (port.name === CONTENT_PORT_NAME) {
        const transport = createPortTransport(port);

        const channel = createChannel(transport);
    }
});
