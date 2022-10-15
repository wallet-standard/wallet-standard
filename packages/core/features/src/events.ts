import type { Wallet } from '@wallet-standard/base';

/** TODO: docs */
export type EventsFeature = {
    /** Namespace for the feature. */
    'standard:events': {
        /** Version of the feature API. */
        version: EventsVersion;

        /** TODO: docs */
        on: EventsOnMethod;
    };
};

/** TODO: docs */
export type EventsVersion = '1.0.0';

/**
 * Add an event listener to subscribe to events.
 *
 * @param event    Event name to listen for.
 * @param listener Function that will be called when the event is emitted.
 *
 * @return Function to remove the event listener and unsubscribe.
 */
export type EventsOnMethod = <E extends EventsNames>(event: E, listener: EventsListeners[E]) => () => void;

/** Events emitted by wallets. */
export interface EventsListeners {
    /**
     * Emitted when properties of the wallet have changed.
     *
     * @param properties Properties that changed with their new values.
     */
    change(properties: EventsChangeProperties): void;
}

/** TODO: docs */
export type EventsNames = keyof EventsListeners;

/** TODO: docs */
export interface EventsChangeProperties {
    chains?: Wallet['chains'];
    features?: Wallet['features'];
    accounts?: Wallet['accounts'];
}
