/** TODO: docs */
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

/** TODO: docs */
export type PropertyNames<T> = {
    [K in keyof T]: T[K] extends (...args: any) => any ? never : K;
}[keyof T];

/** TODO: docs */
export type MethodNames<T> = {
    [K in keyof T]: T[K] extends (...args: any) => any ? K : never;
}[keyof T];
