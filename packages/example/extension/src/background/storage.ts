const mnemonicKey = 'mnemonic';
export async function getMnemonic() {
    const { mnemonic } = await chrome.storage.local.get('mnemonic');
    return mnemonic;
}
export async function setMnemonic(mnemonic: string): Promise<void> {
    return chrome.storage.local.set({ [mnemonicKey]: mnemonic });
}
