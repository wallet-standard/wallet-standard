import { getFeatureAssertionFunction, getFeatureGuardFunction } from '../assertions.js';

const Bar = 'bar:feature' as const;
const Foo = 'foo:feature' as const;
type Features = {
    [Bar]: {
        doBar(): void;
    };
    [Foo]: {
        doFoo(): void;
    };
};

describe('getFeatureGuardFunction()', () => {
    it('returns a function that returns `false` when the input is missing the specified feature', () => {
        const objectHasBarFeature: ReturnType<typeof getFeatureGuardFunction<Features, typeof Bar>> =
            getFeatureGuardFunction(Bar);
        expect(objectHasBarFeature({ features: {} })).toBe(false);
    });
    it('returns a function that returns `true` when its input has the specified feature', () => {
        const objectHasFooFeature: ReturnType<typeof getFeatureGuardFunction<Features, typeof Foo>> =
            getFeatureGuardFunction(Foo);
        expect(
            objectHasFooFeature({
                features: {
                    [Foo]: {
                        doFoo() {
                            /* empty */
                        },
                    },
                },
            })
        ).toBe(true);
    });
});

describe('getFeatureAssertionFunction()', () => {
    it('returns a function that throws when a address-having input is missing the specified feature', () => {
        const assertObjectHasBarFeature: ReturnType<typeof getFeatureAssertionFunction<Features, typeof Bar>> =
            getFeatureAssertionFunction(Bar);
        expect(() => {
            assertObjectHasBarFeature({ address: 'ABC', features: {} });
        }).toThrow(`The \`${Bar}\` feature is not supported by the address \`ABC\``);
    });
    it('returns a function that throws when a address-and-label-having input is missing the specified feature', () => {
        const assertObjectHasBarFeature: ReturnType<typeof getFeatureAssertionFunction<Features, typeof Bar>> =
            getFeatureAssertionFunction(Bar);
        expect(() => {
            assertObjectHasBarFeature({ address: 'ABC', features: {}, label: 'Mock Label' });
        }).toThrow(`The \`${Bar}\` feature is not supported by the address \`ABC\` (Mock Label)`);
    });
    it('returns a function that throws when a name-having input is missing the specified feature', () => {
        const assertObjectHasBarFeature: ReturnType<typeof getFeatureAssertionFunction<Features, typeof Bar>> =
            getFeatureAssertionFunction(Bar);
        expect(() => {
            assertObjectHasBarFeature({ features: {}, name: 'Mock Name' });
        }).toThrow(`The \`${Bar}\` feature is not supported by the wallet 'Mock Name'`);
    });
    it('returns a function that does not throw when its input has the specified feature', () => {
        const assertObjectHasFooFeature: ReturnType<typeof getFeatureAssertionFunction<Features, typeof Foo>> =
            getFeatureAssertionFunction(Foo);
        expect(() => {
            assertObjectHasFooFeature({
                features: {
                    [Foo]: {
                        doFoo() {
                            /* empty */
                        },
                    },
                },
                name: 'Mock Wallet',
            });
        }).not.toThrow();
    });
});
