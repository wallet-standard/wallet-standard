import type { IconString, IdentifierArray } from './types.js';

/** An account in the wallet that the app has been authorized to use. */
export interface WalletAccount {
    /** Address of the account, corresponding with the public key. */
    readonly address: string;

    /** Public key of the account, corresponding with the secret key to sign, encrypt, or decrypt using. */
    readonly publicKey: Uint8Array;

    /** Chains supported by the account. */
    readonly chains: IdentifierArray;

    /** Features supported by the account. */
    readonly features: IdentifierArray;

    /** Optional user-friendly descriptive label or name for the account, to be displayed by apps. */
    readonly label?: string;

    /**
     * Optional user-friendly icon for the account, to be displayed by apps.
     */
    readonly icon?: IconString;
}
