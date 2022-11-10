import type { Wallet } from '@wallet-standard/base';

/**
 * `standard:events` is a {@link "@wallet-standard/base".Wallet.features | feature} that may be implemented by a
 * {@link "@wallet-standard/base".Wallet} to allow the app to add an event listener and subscribe to events emitted by
 * the Wallet when properties of the Wallet {@link EventsListeners.change}.
 *
 * @group Events
 */
export type EventsFeature = {
    /** Name of the feature. */
    readonly 'standard:events': {
        /** Version of the feature implemented by the {@link "@wallet-standard/base".Wallet}. */
        readonly version: EventsVersion;
        /** Method to call to use the feature. */
        readonly on: EventsOnMethod;
    };
};

/**
 * Version of the {@link EventsFeature} implemented by a {@link "@wallet-standard/base".Wallet}.
 *
 * @group Events
 */
export type EventsVersion = '1.0.0';

/**
 * Method to call to use the {@link EventsFeature}.
 *
 * @param event    Event type to listen for. {@link EventsListeners.change | `change`} is the only event type.
 * @param listener Function that will be called when an event of the type is emitted.
 *
 * @return
 * `off` function which may be called to remove the event listener and unsubscribe from events.
 *
 * As with all event listeners, be careful to avoid memory leaks.
 *
 * @group Events
 */
export type EventsOnMethod = <E extends EventsNames>(event: E, listener: EventsListeners[E]) => () => void;

/**
 * Types of event listeners of the {@link EventsFeature}.
 *
 * @group Events
 */
export interface EventsListeners {
    /**
     * Listener that will be called when {@link EventsChangeProperties | properties} of the
     * {@link "@wallet-standard/base".Wallet} have changed.
     *
     * @param properties Properties that changed with their **new** values.
     */
    change(properties: EventsChangeProperties): void;
}

/**
 * Names of {@link EventsListeners} that can be listened for.
 *
 * @group Events
 */
export type EventsNames = keyof EventsListeners;

/**
 * Properties of a {@link "@wallet-standard/base".Wallet} that {@link EventsListeners.change | changed} with their
 * **new** values.
 *
 * @group Events
 */
export interface EventsChangeProperties {
    /**
     * {@link "@wallet-standard/base".Wallet.chains | Chains} supported by the Wallet.
     *
     * The Wallet should only define this field if the value of the property has changed.
     *
     * The value must be the **new** value of the property.
     */
    readonly chains?: Wallet['chains'];
    /**
     * {@link "@wallet-standard/base".Wallet.features | Features} supported by the Wallet.
     *
     * The Wallet should only define this field if the value of the property has changed.
     *
     * The value must be the **new** value of the property.
     */
    readonly features?: Wallet['features'];
    /**
     * {@link "@wallet-standard/base".Wallet.accounts | Accounts} that the app is authorized to use.
     *
     * The Wallet should only define this field if the value of the property has changed.
     *
     * The value must be the **new** value of the property.
     */
    readonly accounts?: Wallet['accounts'];
}
