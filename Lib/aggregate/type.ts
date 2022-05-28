import { PipelineStage, FilterQuery, ObjectId } from 'mongoose';
import { Filter, FilterParam } from '../utility';

type KeysWithValsOfType<T, V> = keyof { [P in keyof T as T[P] extends V ? P : never]: P };

type proj = 0 | 1;

type Projection<ModelI> = {
  [key in keyof ModelI]?: ModelI[key] extends Record<any, any> ? proj | Projection<ModelI[key]> : proj;
};

type SortData<ModelI> = { [key in keyof ModelI]?: -1 | 1 };

type Match<ModelI> = Filter<ModelI> & { $expr?: { $eq?: [`$${keyof ModelI extends string ? keyof ModelI : never}`, any] } };

export interface AggI<ModelI, AllDBI extends Record<string, any>> {
  pipe: PipelineStage[];

  paginate: (skip: number, limit: number) => Promise<{ data: ModelI[]; total: number; skip: number; limit: number }>;

  sort: (sortData: SortData<ModelI>) => AggI<ModelI, AllDBI>;

  project: <Proj extends Projection<ModelI>>(
    p: Proj
  ) => AggI<{ [key in keyof ModelI & keyof Proj]: ModelI[key] } & { _id: ObjectId }, AllDBI>;

  match: (match: Match<ModelI>) => AggI<ModelI, AllDBI>;

  lookup: <
    Let extends Record<string, `$${keyof ModelI extends string ? keyof ModelI : never}`>,
    From extends keyof AllDBI & string,
    NewModel,
    AS extends string = From
  >(
    p1: { from: `${From}${'s'}`; as: AS; let?: Let },
    p2: (
      p1: AggI<AllDBI[From], AllDBI>,
      p2: {
        [key in keyof Let]: `$$${key extends string ? key : never}`;
      }
    ) => AggI<NewModel, AllDBI>
  ) => AggI<ModelI & { [P in AS]: NewModel[] }, AllDBI>;

  // Still have to work on this
  // --> Improve VSCode readibility of interface
  // --> Make the key as optionnal if preserveNullAndEmptyArrays
  unwind: <KeyOfArrayToUnwind extends keyof ModelI & KeysWithValsOfType<ModelI, Array<any>>>(p: {
    path: `$${KeyOfArrayToUnwind extends string ? KeyOfArrayToUnwind : never}`;
    preserveNullAndEmptyArrays?: true;
  }) => AggI<
    Omit<ModelI, KeyOfArrayToUnwind> & {
      [P in KeyOfArrayToUnwind]: ModelI[KeyOfArrayToUnwind] extends Array<infer T> ? T : never;
    },
    AllDBI
  >;
}
