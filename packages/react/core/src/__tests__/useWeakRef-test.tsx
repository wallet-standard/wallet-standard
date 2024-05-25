import React from 'react';
import { act, create } from 'react-test-renderer';

import { renderHook } from '../test-renderer.js';
import { useWeakRef } from '../useWeakRef.js';

function TestComponent({
    keyObject,
    thiefRef,
}: {
    keyObject: WeakKey;
    thiefRef?: React.MutableRefObject<React.MutableRefObject<unknown> | undefined>;
}) {
    const weakRef = useWeakRef(keyObject);
    if (thiefRef) {
        thiefRef.current = weakRef;
    }
    return <>{weakRef.current}</>;
}

describe('useWeakRef', () => {
    it('rerenders every component in which it is used when the value of `current` is mutated', async () => {
        expect.assertions(2);
        const keyObject = {};
        const thiefRef: React.MutableRefObject<React.MutableRefObject<unknown> | undefined> = { current: undefined }; // We use this to reach in and grab the ref produced.
        let testRenderer;
        await act(() => {
            testRenderer = create(
                <>
                    <TestComponent keyObject={keyObject} thiefRef={thiefRef} />
                    {'/'}
                    <TestComponent keyObject={keyObject} />
                </>
            );
        });
        expect(testRenderer).toMatchInlineSnapshot(`"/"`);
        await act(() => {
            const weakRefFromRendererA = thiefRef.current!;
            // Merely mutating this ref should cause both values to update.
            weakRefFromRendererA.current = 'updated value';
        });
        expect(testRenderer).toMatchInlineSnapshot(`
            [
              "updated value",
              "/",
              "updated value",
            ]
        `);
    });
    it('vends the latest value of the ref to new components that mount', async () => {
        expect.assertions(1);
        // STEP 1: Set a value on the ref.
        const keyObject = {};
        let result: ReturnType<typeof renderHook>['result'];
        await act(() => {
            ({ result } = renderHook(() => useWeakRef(keyObject)));
            if (result.__type === 'error') {
                fail('`useWeakRef()` threw an unexpected exception');
            }
        });
        await act(() => {
            const weakRefFromRenderer = result.current! as React.MutableRefObject<unknown>;
            // Mutating this value should cause a re-render of the hook from above.
            weakRefFromRenderer.current = 'initial value';
        });
        // STEP 2: Ensure that a brand new component receives that value on mount
        let testRenderer;
        await act(() => {
            testRenderer = create(<TestComponent keyObject={keyObject} />);
        });
        expect(testRenderer).toMatchInlineSnapshot(`"initial value"`);
    });
});
