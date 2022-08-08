export const EMPTY_ARRAY: ReadonlyArray<never> = [] as const;

export function createDefaultContext<V, T extends Record<string, V>>(name: string, defaults: T): T {
    for (const property of Object.keys(defaults)) {
        const value = defaults[property];
        Object.defineProperty(defaults, property, {
            get(): V {
                console.error(
                    'You have tried to access `' +
                        property +
                        '` on a ' +
                        name +
                        'Context without providing one. ' +
                        'Make sure to render a ' +
                        name +
                        'Provider as an ancestor of the component that calls `use' +
                        name +
                        '`.'
                );
                return value;
            },
        });
    }
    return defaults;
}
