type StrictPropertyCheck<T, TExpected, TError> = Exclude<keyof T, keyof TExpected> extends never ? {} : TError;

type KeysWithValsOfType<T, V> = keyof { [P in keyof T as T[P] extends V ? P : never]: P };
// type OverrideProps<M, N> = { [P in keyof M]: P extends keyof N ? N[P] : M[P] };

type ProjElement = 0 | 1;
export type Projection<ModelI> = { [key in keyof ModelI]?: ProjElement };

export type CreateData<ModelI> = Omit<ModelI, '_id' | 'createdAt' | 'updatedAt'>;
export type CreateDataParam<C, ModelI> = C &
  StrictPropertyCheck<C, CreateData<ModelI>, 'Only property of the model are allowed'>;

export type Filter<Data> = Partial<Data>; //& FilterQuery<Data>;

export type FilterParam<F, ModelI> = F & StrictPropertyCheck<F, Filter<ModelI>, 'Only property of the model are allowed'>;

export type UpdateData<Data> = Partial<Data> & {
  $inc?: { [key in KeysWithValsOfType<Required<Data>, number>]?: number };
  $push?: { [key in keyof Required<Data>]?: Required<Data>[key] extends Array<infer T> ? T : never };
};

export type UpdateDataParam<UD, ModelI> = UD &
  StrictPropertyCheck<UD, UpdateData<ModelI>, 'Only property of the model are allowed'>;
