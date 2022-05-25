import { ObjectId, FilterQuery, UpdateQuery } from 'mongoose';

type KeysWithValsOfType<T, V> = keyof { [P in keyof T as T[P] extends V ? P : never]: P };
type OverrideProps<M, N> = { [P in keyof M]: P extends keyof N ? N[P] : M[P] };

type ProjElement = 0 | 1;

type Filter<Data> = Partial<Data>; //& FilterQuery<Data>;

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
type UpdateData<Data> = Partial<Data> & {
  $inc?: { [key in KeysWithValsOfType<Data, number>]?: number };
  $push?: { [key in keyof Required<Data>]?: Required<Data>[key] extends Array<infer T> ? T : never };
};

export interface BridgeMongoModelI<ModelI> {
  create: <CreateData extends Omit<ModelI, '_id' | 'createdAt' | 'updatedAt'>>(
    p: CreateData
  ) => Promise<CreateData & (ModelI extends { createdAt: Date } ? { createdAt: Date; updatedAt: Date } : {})>;

  findOne: <Proj extends { [key in keyof ModelI]?: ProjElement }>(
    filter: Filter<ModelI>,
    proj?: Proj
  ) => Promise<
    | ({ [key in keyof ModelI & keyof Proj]: Proj[key] extends 1 ? ModelI[key] : never } & { _id: string })
    | { error: { status: 404; name: 'Document not found' } }
  >;

  updateOne: <Proj extends { [key in keyof ModelI]?: ProjElement }>(
    filter: Filter<ModelI>,
    dataToUpdate: UpdateData<ModelI>,
    proj?: Proj
  ) => Promise<
    | ({ [key in keyof ModelI & keyof Proj]: Proj[key] extends 0 ? never : ModelI[key] } & { _id: string })
    | { error: { status: 404; name: 'Document not found' } }
  >;

  exists: (filter: Filter<ModelI>) => Promise<{ exists: boolean }>;

  count: (filter: Filter<ModelI>) => Promise<{ total: number }>;

  deleteOne: (filter: Readonly<Filter<ModelI>>) => Promise<{ deleted: boolean }>;
}
