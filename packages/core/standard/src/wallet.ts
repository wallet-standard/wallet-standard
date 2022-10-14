import type { WalletAccount } from './account.js';
import type { IconString, IdentifierArray, IdentifierRecord } from './types.js';

/** TODO: docs */
export type WalletVersion = '1.0.0';

/** TODO: docs */
export interface Wallet {
    /**
     * Version of the Wallet Standard.
     */
    readonly version: WalletVersion;

    /**
     * Name of the wallet, to be displayed by apps.
     * Must be canonical to the wallet extension.
     */
    readonly name: string;

    /** Icon of the wallet, to be displayed by apps. */
    readonly icon: IconString;

    /** Chains supported by the wallet. */
    readonly chains: IdentifierArray;

    /** Features supported by the wallet. */
    readonly features: IdentifierRecord<unknown>;

    /**
     * List of accounts the app is authorized to use.
     * This can be set by the wallet so the app can use authorized accounts on the initial page load.
     */
    readonly accounts: ReadonlyArray<WalletAccount>;
}

/** TODO: docs */
export type WalletPropertyName = NonNullable<
    {
        [K in keyof Wallet]: Wallet[K] extends (...args: any) => any ? never : K;
    }[keyof Wallet]
>;

/** TODO: docs */
export type WalletProperties = Pick<Wallet, WalletPropertyName>;

/** TODO: docs */
export type WalletWithFeatures<Features extends Wallet['features']> = Omit<Wallet, 'features'> & {
    features: Features;
};
