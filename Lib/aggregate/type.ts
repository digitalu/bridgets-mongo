import { PipelineStage, FilterQuery, ObjectId } from 'mongoose';

type KeysWithValsOfType<T, V> = keyof { [P in keyof T as T[P] extends V ? P : never]: P };
type Filter<Data> = Partial<Data> & FilterQuery<Data>;
type proj = 0 | 1;

type Projection<ModelI> = {
  [key in keyof ModelI]?: ModelI[key] extends Record<any, any> ? proj | Projection<ModelI[key]> : proj;
};

export interface AggI<ModelI, AllDBI extends Record<string, any>> {
  pipe: PipelineStage[];

  // paginate: (skip: number, limit: number) => AggI<AllDBI, ModelI>;

  paginate: (skip: number, limit: number) => Promise<{ data: ModelI[]; total: number; skip: number; limit: number }>;

  project: <Proj extends Projection<ModelI>>(
    p: Proj
  ) => AggI<{ [key in keyof ModelI & keyof Proj]: ModelI[key] } & { _id: ObjectId }, AllDBI>;

  match: (filter: Filter<ModelI>) => AggI<ModelI, AllDBI>;

  lookup: <Let extends Record<string, keyof ModelI>, From extends keyof AllDBI & string, NewModel, AS extends string = From>(
    p1: { from: From; as?: AS; let?: Let },
    p2: (
      p1: AggI<AllDBI[From], AllDBI>,
      p2: {
        [key in keyof Let]: ModelI[Let[key]];
      }
    ) => AggI<NewModel, AllDBI>
  ) => AggI<ModelI & { [P in AS]: NewModel[] }, AllDBI>;

  unwind: <KeyOfArrayToUnwind extends keyof ModelI & KeysWithValsOfType<ModelI, Array<any>>>(p: {
    path: KeyOfArrayToUnwind;
  }) => AggI<
    Omit<ModelI, KeyOfArrayToUnwind> & {
      [P in KeyOfArrayToUnwind]: ModelI[KeyOfArrayToUnwind] extends Array<infer T> ? T : never;
    },
    AllDBI
  >;

  // exec: () => Promise<ModelI[]>;
}
