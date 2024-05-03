import { getFeatureAssertionFunction, getFeatureGuardFunction } from '../assertions.js';

// [DESCRIBE] getFeatureGuardFunction.
{
    // It expands the existing features type of an object when the feature is found
    {
        const obj = null as unknown as { features: { 'bar:feature': { doBar(): boolean } } };
        const objectHasFooFeature: ReturnType<
            typeof getFeatureGuardFunction<{ 'foo:feature': { doFoo: () => void } }, 'foo:feature'>
        > = getFeatureGuardFunction('foo:feature');
        if (objectHasFooFeature(obj)) {
            obj.features['bar:feature'].doBar();
            obj.features['foo:feature'].doFoo();
        }
    }
    // It keeps the existing features type of the object the same when the feature is not found
    {
        const obj = null as unknown as { features: { 'bar:feature': { doBar(): boolean } } };
        const objectHasFooFeature: ReturnType<
            typeof getFeatureGuardFunction<{ 'foo:feature': { doFoo: () => void } }, 'foo:feature'>
        > = getFeatureGuardFunction('foo:feature');
        if (!objectHasFooFeature(obj)) {
            obj.features['bar:feature'].doBar();
            // @ts-expect-error
            obj.features['foo:feature'].doFoo();
        }
    }
}

// [DESCRIBE] getFeatureAssertionFunction.
{
    // It expands the existing features type of an object when the feature is found
    {
        const obj = null as unknown as { features: { 'bar:feature': { doBar(): boolean } }; name: string };
        const assertObjectHasFooFeature: ReturnType<
            typeof getFeatureAssertionFunction<{ 'foo:feature': { doFoo: () => void } }, 'foo:feature'>
        > = getFeatureAssertionFunction('foo:feature');
        assertObjectHasFooFeature(obj);
        obj.features['bar:feature'].doBar();
        obj.features['foo:feature'].doFoo();
    }
    // It keeps the existing features type of the object the same when the feature is not found
    {
        const obj = null as unknown as { features: { 'bar:feature': { doBar(): boolean } }; name: string };
        const assertObjectHasFooFeature: ReturnType<
            typeof getFeatureAssertionFunction<{ 'foo:feature': { doFoo: () => void } }, 'foo:feature'>
        > = getFeatureAssertionFunction('foo:feature');
        try {
            assertObjectHasFooFeature(obj);
        } catch {
            obj.features['bar:feature'].doBar();
            // @ts-expect-error
            obj.features['foo:feature'].doFoo();
        }
    }
}
