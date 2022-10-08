/** TODO: docs */
export type IdentifierString = `${string}:${string}`;

/** TODO: docs */
export type IdentifierArray = ReadonlyArray<IdentifierString>;

/** TODO: docs */
export type IdentifierRecord<T> = Record<IdentifierString, T>;

// TODO: is base64 actually needed? should other types be allowed?
/** A data URI containing a base64-encoded SVG or PNG image. */
export type IconString = `data:${'image/svg+xml' | 'image/png'};base64,${string}`;
