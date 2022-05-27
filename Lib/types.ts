import { ObjectId, FilterQuery, UpdateQuery } from 'mongoose';

type KeysWithValsOfType<T, V> = keyof { [P in keyof T as T[P] extends V ? P : never]: P };
// type OverrideProps<M, N> = { [P in keyof M]: P extends keyof N ? N[P] : M[P] };

type ProjElement = 0 | 1;
type Projection<ModelI> = { [key in keyof ModelI]?: ProjElement };

type CreateData<ModelI> = Omit<ModelI, '_id' | 'createdAt' | 'updatedAt'>;
type CreateDataParam<C, ModelI> = C & StrictPropertyCheck<C, CreateData<ModelI>, 'Only property of the model are allowed'>;

type Filter<Data> = Partial<Data>; //& FilterQuery<Data>;
type FilterParam<F, ModelI> = F & StrictPropertyCheck<F, Filter<ModelI>, 'Only property of the model are allowed'>;

type StrictPropertyCheck<T, TExpected, TError> = Exclude<keyof T, keyof TExpected> extends never ? {} : TError;

type UpdateData<Data> = Partial<Data> & {
  $inc?: { [key in KeysWithValsOfType<Required<Data>, number>]?: number };
  $push?: { [key in keyof Required<Data>]?: Required<Data>[key] extends Array<infer T> ? T : never };
};
type UpdateDataParam<UD, ModelI> = UD &
  StrictPropertyCheck<UD, UpdateData<ModelI>, 'Only property of the model are allowed'>;

export interface BridgeMongoModelI<ModelI> {
  create: <Crea extends CreateData<ModelI>>(
    p: CreateDataParam<Crea, ModelI>
  ) => Promise<Crea & (ModelI extends { createdAt: Date } ? { createdAt: Date; updatedAt: Date } : {})>;

  findOne: <Proj extends Projection<ModelI>, Fil extends Filter<ModelI>>(
    filter: FilterParam<Fil, ModelI>,
    proj?: Proj
  ) => Promise<
    | ({ [key in keyof ModelI & keyof Proj]: Proj[key] extends 1 ? ModelI[key] : never } & { _id: string })
    | { error: { status: 404; name: 'Document not found' } }
  >;

  updateOne: <Proj extends Projection<ModelI>, Fil extends Filter<ModelI>, Upd extends UpdateData<ModelI>>(
    filter: FilterParam<Fil, ModelI>,
    dataToUpdate: UpdateDataParam<Upd, ModelI>,
    proj?: Proj
  ) => Promise<
    | ({ [key in keyof ModelI & keyof Proj]: Proj[key] extends 0 ? never : ModelI[key] } & { _id: string })
    | { error: { status: 404; name: 'Document not found' } }
  >;

  exists: <F extends Filter<ModelI>>(filter: FilterParam<F, ModelI>) => Promise<{ exists: boolean }>;

  count: <F extends Filter<ModelI>>(filter: FilterParam<F, ModelI>) => Promise<{ total: number }>;

  deleteOne: <F extends Filter<ModelI>>(filter: FilterParam<F, ModelI>) => Promise<{ deleted: boolean }>;
}

// UpdateQuery from the official mongoose code is not powerfull enough and need to be replaced
// Omit<UpdateQuery<Data>, "$inc"> does not work
// type UpdateData<Data> = Partial<Data> &
//   OverrideProps<
//     UpdateQuery<Data>,
//     {
//       $inc?: { [key in KeysWithValsOfType<Data, number>]?: number };
//       $push?: { [key in keyof Required<Data>]?: Required<Data>[key] extends Array<infer T> ? T : never };
//     }
//   >;
