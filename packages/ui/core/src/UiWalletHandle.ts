import type { IdentifierArray } from '@wallet-standard/base';

export type UiWalletHandle = {
    readonly '~uiWalletHandle': unique symbol;
    readonly features: IdentifierArray;
};
