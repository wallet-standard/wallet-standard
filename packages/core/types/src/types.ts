/** TODO: docs */
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

/** TODO: docs */
export type PropertyNames<T> = {
    [K in keyof T]: T[K] extends (...args: any) => any ? never : K;
}[keyof T];

/** TODO: docs */
export type Properties<T> = Pick<T, PropertyNames<T>>;

/** TODO: docs */
export type MethodNames<T> = {
    [K in keyof T]: T[K] extends (...args: any) => any ? K : never;
}[keyof T];

/** TODO: docs */
export type Methods<T> = Pick<T, MethodNames<T>>;

/** TODO: docs */
export type DistributiveOmit<T, K extends keyof T> = T extends any ? Omit<T, K> : never;

/** TODO: docs */
export type Tuple<T extends unknown[]> = [...T];

/** TODO: docs */
export type TupleOmit<T extends any[], K extends PropertyKey> = {
    [P in keyof T]: Omit<T[P], K>;
};

/** TODO: docs */
export type TuplePick<T extends any[], K extends PropertyKey> = {
    [P in keyof T]: Pick<T[P], K>;
};

/** TODO: docs */
export type MapTuple<Input extends unknown[], Value, Output extends unknown[] = []> = Input extends []
    ? []
    : Input extends [unknown]
    ? [...Output, Value]
    : Input extends [unknown, ...infer Tail]
    ? MapTuple<[...Tail], Value, [...Output, Value]>
    : Output extends []
    ? []
    : Readonly<Output>;

/** TODO: docs */
export type AsyncMapFunction<Arg, Return> = <Args extends Arg[]>(...args: Args) => Promise<MapTuple<Args, Return>>;

/** TODO: docs */
export type MapFunction<Arg, Return> = <Args extends Arg[]>(...args: Args) => MapTuple<Args, Return>;
