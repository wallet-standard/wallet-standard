import type { RPC } from '../messages/index';
import { CONTENT_PORT_NAME, createPortTransport, createRPC, POPUP_PORT_NAME } from '../messages/index';
import { asyncState } from '../utils/asyncState';
import { openPopup } from '../utils/popup';
import { getMnemonic, setMnemonic } from './storage';
import { generateMnemonic, getAccounts } from './wallet';

// This allows the background process to communicate with the popup in response
// to content script requests.
const asyncPopupRPC = asyncState<RPC>();

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        const mnemonic = generateMnemonic();
        setMnemonic(mnemonic);
    }
});

chrome.runtime.onConnect.addListener((port) => {
    if (port.name === POPUP_PORT_NAME) {
        const transport = createPortTransport(port);
        const rpc = createRPC(transport);

        rpc.exposeMethod('getAccounts', async () => {
            const mnemonic = await getMnemonic();
            return getAccounts(mnemonic);
        });

        port.onDisconnect.addListener(() => {
            asyncPopupRPC.reset();
            rpc.end();
        });

        asyncPopupRPC.set(rpc);
    }

    if (port.name === CONTENT_PORT_NAME) {
        const transport = createPortTransport(port);
        const rpc = createRPC(transport);

        rpc.exposeMethod('connect', async () => {
            const { closePopup, popupClosed } = await openPopup();

            const popupRPC = await asyncPopupRPC.get();
            const connectResult = popupRPC.callMethod('connect');

            const response = await Promise.race([connectResult, popupClosed]);

            closePopup();

            return response;
        });

        port.onDisconnect.addListener(() => {
            rpc.end();
        });
    }
});
