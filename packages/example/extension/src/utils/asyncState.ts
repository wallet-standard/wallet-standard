export function asyncState<S>() {
    let resolveValue: ((value: S) => void) | null;
    let valuePromise: Promise<S>;

    const init = () => {
        resolveValue = null;
        valuePromise = new Promise((resolve) => {
            resolveValue = (value) => {
                resolve(value);
            };
        });
    };

    init();

    const get = () => valuePromise;

    const set = (value: S) => resolveValue?.(value);

    const reset = init;

    return { get, set, reset };
}
