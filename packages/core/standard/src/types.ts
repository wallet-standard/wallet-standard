/** A namespaced string in the format `${namespace}:${string}`. */
export type IdentifierString = `${string}:${string}`;

/** An array of namespaced strings in the format `${namespace}:${string}`. */
export type IdentifierArray = ReadonlyArray<IdentifierString>;

/** An object where the keys are namespaced strings in the format `${namespace}:${string}`. */
export type IdentifierRecord<T> = Record<IdentifierString, T>;

/** A data URI containing a base64-encoded SVG, WebP, PNG, or GIF image. */
export type IconString = `data:image/${'svg+xml' | 'webp' | 'png' | 'gif'};base64,${string}`;
