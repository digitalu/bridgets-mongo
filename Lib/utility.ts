export type StrictPropertyCheck<T, TExpected, TError> = Exclude<keyof T, keyof TExpected> extends never ? {} : TError;

type KeysWithValsOfType<T, V> = keyof { [P in keyof T as T[P] extends V ? P : never]: P };
// type OverrideProps<M, N> = { [P in keyof M]: P extends keyof N ? N[P] : M[P] };

type ProjElement = 0 | 1;
export type Projection<ModelI> = { [key in keyof ModelI]?: ProjElement };

type WithDollar<T extends string> = `$${T}`;

export type CreateData<ModelI> = Omit<ModelI, '_id' | 'createdAt' | 'updatedAt'>;
export type CreateDataParam<C, ModelI> = C &
  StrictPropertyCheck<C, CreateData<ModelI>, 'Only property of the model are allowed'>;

export type Filter<Data> = {
  [key in keyof Data]?: Partial<Data[key]> extends Array<infer TArr> | undefined
    ? TArr | Data[key]
    : Data[key] | { $gt?: Data[key]; $gte?: Data[key]; $lt?: Data[key]; $lte?: Data[key] };
} & {
  [key in keyof Data as Data[key] extends Array<any>
    ? `${key extends string ? key : ''}.${number}`
    : never]?: Data[key] extends Array<infer SubData> ? Filter<SubData> : never;
} & {
  $expr?: Filter<Data>;
} & { $and?: Array<Filter<Data>> } & {
  $eq?: [WithDollar<keyof Data extends string ? keyof Data : ''>, string];
} & {
  $ne?: [`$${keyof Data extends string ? keyof Data : never}`, string];
}; //& FilterQuery<Data>;

export type FilterParam<F, ModelI> = F & StrictPropertyCheck<F, Filter<ModelI>, 'Only property of the model are allowed'>;

export type UpdateData<Data> = Partial<Data> & {
  $inc?: { [key in KeysWithValsOfType<Required<Data>, number>]?: number };
  $push?: { [key in keyof Required<Data>]?: Required<Data>[key] extends Array<infer T> ? T : never };
};

export type UpdateDataParam<UD, ModelI> = UD &
  StrictPropertyCheck<UD, UpdateData<ModelI>, 'Only property of the model are allowed'>;
