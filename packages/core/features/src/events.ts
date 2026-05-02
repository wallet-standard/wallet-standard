import type { Wallet, WalletVersion1_0_0, WalletVersion1_1_0 } from '@wallet-standard/base';

/** Name of the feature. */
export const StandardEvents = 'standard:events';
/**
 * @deprecated Use {@link StandardEvents} instead.
 *
 * @group Deprecated
 */
export const Events = StandardEvents;

/**
 * `standard:events` is a {@link "@wallet-standard/base".Wallet.features | feature} that may be implemented by a
 * {@link "@wallet-standard/base".Wallet} to allow the app to add an event listener and subscribe to events emitted by
 * the Wallet when properties of the Wallet {@link StandardEventsListeners.change}.
 *
 * @group Events
 */
export type StandardEventsFeature<V extends StandardEventsVersion = StandardEventsVersion1_0_0> = {
    /** Name of the feature. */
    readonly [StandardEvents]: {
        /** Version of the feature implemented by the {@link "@wallet-standard/base".Wallet}. */
        readonly version: V;
        /** Method to call to use the feature. */
        readonly on: StandardEventsOnMethod<V>;
    };
};
/**
 * @deprecated Use {@link StandardEventsFeature} instead.
 *
 * @group Deprecated
 */
export type EventsFeature = StandardEventsFeature;

/**
 * Version of the {@link StandardEventsFeature} implemented by a {@link "@wallet-standard/base".Wallet}.
 *
 * @group Events
 */
export type StandardEventsVersion = StandardEventsVersion1_0_0 | StandardEventsVersion1_1_0;

/**
 * Initial version of the {@link StandardEventsFeature}.
 *
 * @group Events
 */
export type StandardEventsVersion1_0_0 = '1.0.0';

/**
 * Version of the {@link StandardEventsFeature} that supports HTTP/S URLs for account icons.
 *
 * @group Events
 */
export type StandardEventsVersion1_1_0 = '1.1.0';

/**
 * @deprecated Use {@link StandardEventsVersion} instead.
 *
 * @group Deprecated
 */
export type EventsVersion = StandardEventsVersion;

/**
 * Method to call to use the {@link StandardEventsFeature}.
 *
 * @param event    Event type to listen for. {@link StandardEventsListeners.change | `change`} is the only event type.
 * @param listener Function that will be called when an event of the type is emitted.
 *
 * @return
 * `off` function which may be called to remove the event listener and unsubscribe from events.
 *
 * As with all event listeners, be careful to avoid memory leaks.
 *
 * @group Events
 */
export type StandardEventsOnMethod<V extends StandardEventsVersion = StandardEventsVersion1_0_0> = <
    E extends StandardEventsNames,
>(
    event: E,
    listener: StandardEventsListeners<V>[E]
) => () => void;
/**
 * @deprecated Use {@link StandardEventsOnMethod} instead.
 *
 * @group Deprecated
 */
export type EventsOnMethod<V extends StandardEventsVersion = StandardEventsVersion1_0_0> = StandardEventsOnMethod<V>;

/**
 * Types of event listeners of the {@link StandardEventsFeature}.
 *
 * @group Events
 */
export interface StandardEventsListeners<V extends StandardEventsVersion = StandardEventsVersion1_0_0> {
    /**
     * Listener that will be called when {@link StandardEventsChangeProperties | properties} of the
     * {@link "@wallet-standard/base".Wallet} have changed.
     *
     * @param properties Properties that changed with their **new** values.
     */
    change(properties: StandardEventsChangeProperties<V>): void;
}
/**
 * @deprecated Use {@link StandardEventsListeners} instead.
 *
 * @group Deprecated
 */
export type EventsListeners<V extends StandardEventsVersion = StandardEventsVersion1_0_0> = StandardEventsListeners<V>;

/**
 * Names of {@link StandardEventsListeners} that can be listened for.
 *
 * @group Events
 */
export type StandardEventsNames = keyof StandardEventsListeners;
/**
 * @deprecated Use {@link StandardEventsNames} instead.
 *
 * @group Deprecated
 */
export type EventsNames = StandardEventsNames;

/**
 * Properties of a {@link "@wallet-standard/base".Wallet} that {@link StandardEventsListeners.change | changed} with their
 * **new** values.
 *
 * @group Events
 */
export interface StandardEventsChangeProperties<V extends StandardEventsVersion = StandardEventsVersion1_0_0> {
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
    readonly accounts?: Wallet<
        V extends StandardEventsVersion1_1_0 ? WalletVersion1_1_0 : WalletVersion1_0_0
    >['accounts'];
}
/**
 * @deprecated Use {@link StandardEventsChangeProperties} instead.
 *
 * @group Deprecated
 */
export type EventsChangeProperties<V extends StandardEventsVersion = StandardEventsVersion1_0_0> =
    StandardEventsChangeProperties<V>;
