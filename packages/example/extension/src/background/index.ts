import { generateMnemonic } from './wallet';

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        const mnemonic = generateMnemonic();
        chrome.storage.local.set({ mnemonic });
    }
});
