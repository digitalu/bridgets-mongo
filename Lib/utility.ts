export type StrictPropertyCheck<T, TExpected, TError> = Exclude<keyof T, keyof TExpected> extends never ? {} : TError;

type KeysWithValsOfType<T, V> = keyof { [P in keyof T as T[P] extends V ? P : never]: P };
// type OverrideProps<M, N> = { [P in keyof M]: P extends keyof N ? N[P] : M[P] };

type ProjElement = 0 | 1;
export type Projection<ModelI> = { [key in keyof ModelI]?: ProjElement };

type numbers = '0' | '1';
// | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

type WithDollar<T extends string> = `$${T}`;

export type FlatPath<T> = keyof {
  [key in keyof T as T[key] extends Record<any, any>
    ? `${key extends string ? key : ''}.${FlatPath<T[key]> extends string ? FlatPath<T[key]> : ''}`
    : keyof T]: 1;
};

type IndexArray<Data, K = {}> = `${KeysWithValsOfType<Required<Data>, Array<K>> & string}.${numbers}${K extends Record<
  any,
  any
>
  ? Data[KeysWithValsOfType<Required<Data>, Array<K>> & keyof Data] & string
  : ''}`;

type WithoutPointNbr<G, key extends string = ''> = G extends `${key}.${numbers}` ? key : never;

// type ValueOfPoint<Path

export type CreateData<ModelI> = Omit<ModelI, '_id' | 'createdAt' | 'updatedAt'>;
export type CreateDataParam<C, ModelI> = C &
  StrictPropertyCheck<C, CreateData<ModelI>, 'Only property of the model are allowed'>;

export type Filter<Data, R = {}> = {
  [key in keyof Data]?: Partial<Data[key]> extends Array<infer TArr> | undefined
    ? TArr | Data[key]
    :
        | Data[key]
        | {
            $gt?: Data[key];
            $gte?: Data[key];
            $lt?: Data[key];
            $lte?: Data[key];
            $in?: Array<Data[key]>;
            $nin?: Array<Data[key]>;
          };
} & {
  // }; //     : never]?: Data[key] extends Array<infer SubData> ? Filter<SubData> | { $exists?: boolean } : never; //     ? `${key extends string ? key : ''}.${number}` //   [key in keyof Data as Data[key] extends Array<any> // & {
  [key in `${KeysWithValsOfType<Required<Data>, Array<R>> & string}.${numbers}`]?: { $exists?: boolean }; //Filter<R> |
} & {
  // } //     : never]?: Data[key] extends Array<infer SubData> ? Filter<SubData> | { $exists?: boolean } : never; //  [key in keyof Data as Data[key] extends any[] // & { // Record<IndexArray<Data>, 4>; //     ? `${key extends string ? key : ''}.${number}` //
  $expr?: Filter<Data>;
} & { $and?: Array<Filter<Data>> } & { $or?: Array<Filter<Data>> } & {
  $eq?: [WithDollar<keyof Data extends string ? keyof Data : ''>, string];
} & {
  $ne?: [`$${keyof Data extends string ? keyof Data : never}`, string];
};
//& FilterQuery<Data>;

export type FilterParam<F, ModelI> = F & StrictPropertyCheck<F, Filter<ModelI>, 'Only property of the model are allowed'>;

export type UpdateData<Data> = Partial<Data> & {
  $inc?: { [key in KeysWithValsOfType<Required<Data>, number>]?: number };
  $push?: { [key in keyof Required<Data>]?: Required<Data>[key] extends Array<infer T> ? T : never };
};

export type UpdateDataParam<UD, ModelI> = UD &
  StrictPropertyCheck<UD, UpdateData<ModelI>, 'Only property of the model are allowed'>;
