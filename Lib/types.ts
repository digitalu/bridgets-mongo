import { CreateData, CreateDataParam, Projection, FilterParam, Filter, UpdateData, UpdateDataParam } from './utility';

export interface BridgeMongoModelI<ModelI> {
  create: <Crea extends CreateData<ModelI>>(
    p: CreateDataParam<Crea, ModelI>
  ) => Promise<
    | (Crea & (ModelI extends { createdAt: Date } ? { _id: string; createdAt: Date; updatedAt: Date } : {}))
    | { error: { status: 409; message: 'Already exists'; data: Record<any, any> } }
  >;

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
