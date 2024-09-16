/**
 * To add a new error, follow the instructions at
 * https://github.com/wallet-standard/wallet-standard/tree/master/packages/core/errors/#adding-a-new-error
 *
 * WARNING:
 *   - Don't remove error codes
 *   - Don't change or reorder error codes.
 *
 * Good naming conventions:
 *   - Prefixing common errors — e.g. under the same package — can be a good way to namespace them. E.g. All codec-related errors start with `WALLET_STANDARD_ERROR__ACCOUNT__`.
 *   - Use consistent names — e.g. choose `PDA` or `PROGRAM_DERIVED_ADDRESS` and stick with it. Ensure your names are consistent with existing error codes. The decision might have been made for you.
 *   - Recommended prefixes and suffixes:
 *     - `MALFORMED_`: Some input was not constructed properly. E.g. `MALFORMED_BASE58_ENCODED_ADDRESS`.
 *     - `INVALID_`: Some input is invalid (other than because it was MALFORMED). E.g. `INVALID_NUMBER_OF_BYTES`.
 *     - `EXPECTED_`: Some input was different than expected, no need to specify the "GOT" part unless necessary. E.g. `EXPECTED_DECODED_ACCOUNT`.
 *     - `_CANNOT_`: Some operation cannot be performed or some input cannot be used due to some condition. E.g. `CANNOT_DECODE_EMPTY_BYTE_ARRAY` or `PDA_CANNOT_END_WITH_PDA_MARKER`.
 *     - `_MUST_BE_`: Some condition must be true. E.g. `NONCE_TRANSACTION_FIRST_INSTRUCTION_MUST_BE_ADVANCE_NONCE`.
 *     - `_FAILED_TO_`: Tried to perform some operation and failed. E.g. `FAILED_TO_DECODE_ACCOUNT`.
 *     - `_NOT_FOUND`: Some operation lead to not finding something. E.g. `ACCOUNT_NOT_FOUND`.
 *     - `_OUT_OF_RANGE`: Some value is out of range. E.g. `ENUM_DISCRIMINATOR_OUT_OF_RANGE`.
 *     - `_EXCEEDED`: Some limit was exceeded. E.g. `PDA_MAX_SEED_LENGTH_EXCEEDED`.
 *     - `_MISMATCH`: Some elements do not match. E.g. `ENCODER_DECODER_FIXED_SIZE_MISMATCH`.
 *     - `_MISSING`: Some required input is missing. E.g. `TRANSACTION_FEE_PAYER_MISSING`.
 *     - `_UNIMPLEMENTED`: Some required component is not available in the environment. E.g. `SUBTLE_CRYPTO_VERIFY_FUNCTION_UNIMPLEMENTED`.
 */

// Registry-related errors.
// Reserve error codes in the range [3834000-3834999].
export const WALLET_STANDARD_ERROR__REGISTRY__WALLET_NOT_FOUND = 3834000 as const;
export const WALLET_STANDARD_ERROR__REGISTRY__WALLET_ACCOUNT_NOT_FOUND = 3834001 as const;

// User-related errors.
// Reserve error codes in the range [4001000-4001999].
export const WALLET_STANDARD_ERROR__USER__REQUEST_REJECTED = 4001000 as const;

// Feature-related errors.
// Reserve error codes in the range [6160000-6160999].
export const WALLET_STANDARD_ERROR__FEATURES__WALLET_ACCOUNT_CHAIN_UNSUPPORTED = 6160000 as const;
export const WALLET_STANDARD_ERROR__FEATURES__WALLET_ACCOUNT_FEATURE_UNIMPLEMENTED = 6160001 as const;
export const WALLET_STANDARD_ERROR__FEATURES__WALLET_FEATURE_UNIMPLEMENTED = 6160002 as const;

/**
 * A union of every Wallet Standard error code
 *
 * You might be wondering why this is not a TypeScript enum or const enum.
 *
 * One of the goals of this library is to enable people to use some or none of it without having to
 * bundle all of it.
 *
 * If we made the set of error codes an enum then anyone who imported it (even if to only use a
 * single error code) would be forced to bundle every code and its label.
 *
 * Const enums appear to solve this problem by letting the compiler inline only the codes that are
 * actually used. Unfortunately exporting ambient (const) enums from a library like
 * `@wallet-standard/errors` is not safe, for a variety of reasons covered here:
 * https://stackoverflow.com/a/28818850
 */
export type WalletStandardErrorCode =
    | typeof WALLET_STANDARD_ERROR__FEATURES__WALLET_ACCOUNT_CHAIN_UNSUPPORTED
    | typeof WALLET_STANDARD_ERROR__FEATURES__WALLET_ACCOUNT_FEATURE_UNIMPLEMENTED
    | typeof WALLET_STANDARD_ERROR__FEATURES__WALLET_FEATURE_UNIMPLEMENTED
    | typeof WALLET_STANDARD_ERROR__REGISTRY__WALLET_ACCOUNT_NOT_FOUND
    | typeof WALLET_STANDARD_ERROR__REGISTRY__WALLET_NOT_FOUND
    | typeof WALLET_STANDARD_ERROR__USER__REQUEST_REJECTED;
