import { CreateData, CreateDataParam, Projection, FilterParam, Filter, UpdateData, UpdateDataParam } from './utility';
import { ClientSession } from 'mongoose';

export interface BridgeMongoModelI<ModelI> {
  // onCreate: (data: ModelI) => Promise<void>;
  // onUpdate: (data: ModelI) => Promise<void>;
  // onDelete: (data: ModelI) => Promise<void>;

  create: <Crea extends CreateData<ModelI>>(
    p: CreateDataParam<Crea, ModelI>,
    opts?: { session?: ClientSession }
  ) => Promise<
    | (Crea & (ModelI extends { createdAt: Date } ? { _id: string; createdAt: Date; updatedAt: Date } : {}))
    | { error: { status: 409; name: 'Already exists'; data: Record<any, any> } }
  >;

  createMany: <Crea extends CreateData<ModelI>>(
    p: Array<CreateDataParam<Crea, ModelI>>,
    opts?: { session?: ClientSession }
  ) => Promise<Array<Crea & (ModelI extends { createdAt: Date } ? { _id: string; createdAt: Date; updatedAt: Date } : {})>>;

  findOne: <Proj extends Projection<ModelI>, Fil extends Filter<ModelI>>(
    filter: FilterParam<Fil, ModelI>,
    opts?: { proj?: Proj; session?: ClientSession }
  ) => Promise<
    | ({ [key in keyof ModelI & keyof Proj]: Proj[key] extends 1 ? ModelI[key] : never } & { _id: string })
    | { error: { status: 404; name: 'Document not found' } }
  >;

  updateOne: <Proj extends Projection<ModelI>, Fil extends Filter<ModelI>, Upd extends UpdateData<ModelI>>(
    filter: FilterParam<Fil, ModelI>,
    dataToUpdate: UpdateDataParam<Upd, ModelI>,
    opts?: { proj?: Proj; session?: ClientSession }
  ) => Promise<
    | ({ [key in keyof ModelI & keyof Proj]: Proj[key] extends 0 ? never : ModelI[key] } & { _id: string })
    | { error: { status: 404; name: 'Document not found' } }
  >;

  updateMany: <Fil extends Filter<ModelI>, Upd extends UpdateData<ModelI>>(
    filter: FilterParam<Fil, ModelI>,
    dataToUpdate: UpdateDataParam<Upd, ModelI>,
    opts?: { session?: ClientSession }
  ) => Promise<{ modifiedCount: number }>;

  exists: <F extends Filter<ModelI>>(filter: FilterParam<F, ModelI>) => Promise<{ exists: boolean }>;

  count: <F extends Filter<ModelI>>(filter: FilterParam<F, ModelI>) => Promise<{ total: number }>;

  deleteOne: <F extends Filter<ModelI>>(
    filter: FilterParam<F, ModelI>,
    opts?: { session?: ClientSession }
  ) => Promise<{ deleted: boolean }>;

  deleteMany: <F extends Filter<ModelI>>(
    filter: FilterParam<F, ModelI>,
    opts?: { session?: ClientSession }
  ) => Promise<{ deletedCount: number }>;
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
