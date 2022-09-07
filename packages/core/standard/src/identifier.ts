/** TODO: docs */
export type IdentifierString = `${string}:${string}`;

/** TODO: docs */
export type IdentifierArray = ReadonlyArray<IdentifierString>;

/** TODO: docs */
export type IdentifierRecord<T> = Record<IdentifierString, T>;
