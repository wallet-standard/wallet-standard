import type { IdentifierString } from '@wallet-standard/base';

type NamedObject =
    // Typically `WalletAccounts`
    | {
          address: string;
          label?: string;
      }
    // Typically `Wallets`
    | {
          name: string;
      };
type NamedObjectWithFeatures = NamedObject & ObjectWithFeatures;
type ObjectWithFeatures = {
    features: Record<IdentifierString, unknown>;
};

export function getFeatureGuardFunction<
    TFeature extends Record<IdentifierString, unknown>,
    TFeatureName extends IdentifierString
>(featureName: TFeatureName) {
    return function objectHasFeature(object: ObjectWithFeatures): object is { features: Pick<TFeature, TFeatureName> } {
        return featureName in object.features;
    };
}

/**
 * In order to make use of the assertion this produces, you need to recast it to an assertion
 * function, like this:
 *
 *   const assertWalletHasConnectFeature: ReturnType<
 *     typeof getFeatureAssertionFunction<StandardConnectFeature, typeof StandardConnect>
 *   > = getFeatureAssertionFunction(StandardConnect);
 *
 * Read more about why, here: https://github.com/microsoft/TypeScript/issues/36931
 */
export function getFeatureAssertionFunction<
    TFeature extends Record<IdentifierString, unknown>,
    TFeatureName extends IdentifierString
>(featureName: TFeatureName) {
    const objectHasFeature = getFeatureGuardFunction<TFeature, TFeatureName>(featureName);
    return function assertObjectHasFeature(
        object: NamedObjectWithFeatures
    ): asserts object is typeof object & { features: Pick<TFeature, TFeatureName> } {
        if (!objectHasFeature(object)) {
            const objectName =
                'address' in object
                    ? `the address \`${object.address}\`${object.label ? ` (${object.label})` : ''}`
                    : `the wallet '${object.name}'`;
            const err = new Error(`The \`${featureName}\` feature is not supported by ${objectName}`);
            if ('captureStackTrace' in Error) {
                Error.captureStackTrace(err, assertObjectHasFeature);
            }
            throw err;
        }
    };
}
