import type { WalletInterface } from '@wallet-standard/standard';
import type { PropertyNames } from '@wallet-standard/types';

export interface WalletInterfaceEventsFeature<I extends WalletInterface> {
    events: {
        /**
         * Add an event listener to subscribe to events.
         *
         * @param event    Event name to listen for.
         * @param listener Function that will be called when the event is emitted.
         *
         * @return Function to remove the event listener and unsubscribe.
         */
        on<E extends WalletInterfaceEventNames<I>>(event: E, listener: WalletInterfaceEvents<I>[E]): () => void;
    };
}

// TODO: test if this can be extended with custom events
/** Events emitted by wallets. */
export type WalletInterfaceEvents<I extends WalletInterface> = {
    /**
     * Emitted when properties of the wallet have changed.
     *
     * @param properties Names of the properties that changed.
     */
    change(properties: PropertyNames<I>[]): void;
};

/** TODO: docs */
export type WalletInterfaceEventNames<I extends WalletInterface> = keyof WalletInterfaceEvents<I>;
