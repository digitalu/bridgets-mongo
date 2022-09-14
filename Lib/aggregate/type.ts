import { PipelineStage, FilterQuery } from 'mongoose';
import { Filter, FilterParam, StrictPropertyCheck } from '../utility';

type KeysWithValsOfType<T, V> = keyof { [P in keyof T as T[P] extends V ? P : never]: P } & string;

type Plurial<T extends string> = T extends `${string}${'s' | 'sh' | 'ch' | 'x' | 'z'}` ? `${T}es` : `${T}s`;
// let a: Test['ah.oui']

type FlatPath<T> = keyof {
  [key in keyof T as T[key] extends Record<any, any>
    ? `${key extends string ? key : ''}.${FlatPath<T[key]> extends string ? FlatPath<T[key]> : ''}`
    : keyof T]: 1;
};

type ExtractFromPath<Path extends string, Obj extends any> = Path extends `${infer A}.${infer B}`
  ? A extends keyof Obj
    ? ExtractFromPath<B, Obj[A]>
    : never
  : Path extends keyof Obj
  ? Obj[Path]
  : never;

type ValueFromFlatPath<Data, Path> = Path extends `${infer A & keyof Data & string}.${infer B}`
  ? A extends keyof Data
    ? ValueFromFlatPath<Data[A], B>
    : 'Wrong Path'
  : Path extends keyof Data
  ? Data[Path]
  : 'Wrong Path';

const test = {
  a: 4,
  nb: 8,
  sah: [1, 2],
  too: {
    po: 9,
    pal: {
      op: '',
    },
  },
};

type IndexArray<Data> = `${KeysWithValsOfType<Required<Data>, any[]> & string}.${number}`;

type TT = KeysWithValsOfType<typeof test, Array<any>>;

type T = FlatPath<typeof test>;

type HHH = IndexArray<typeof test>;

type kkld = ValueFromFlatPath<typeof test, 'too.pal.op'>;

type ProjBase<ModelI> = {
  [key in `${FlatPath<ModelI> extends string ? FlatPath<ModelI> : ''}`]?: 0 | 1;
};
type ProjAssign<ModelI> = Record<string, `$${FlatPath<ModelI> extends string ? FlatPath<ModelI> : ''}`>;

type ProjectionENERVAX<ModelI> = ProjBase<ModelI> & ProjAssign<ModelI>;

type DateOperator =
  | '$year'
  | '$month'
  | '$dayOfMonth'
  | '$hour'
  | '$minute'
  | '$second'
  | '$millisecond'
  | '$dayOfYear'
  | '$dayOfWeek'
  | '$week';

type proj = 0 | 1;

type AddDate<ModelI> = { [key in DateOperator]?: `$${KeysWithValsOfType<Required<ModelI>, Date>}` };

type AddAssign<ModelI> = { $assign?: `$${FlatPath<ModelI> & string}` };

type AddFields<ModelI> = {
  [key: string]: AddDate<ModelI> | AddAssign<ModelI> | string | number;
};

type Projection<ModelI> = {
  [key in keyof ModelI]?: ModelI[key] extends Record<any, any> ? proj | Projection<ModelI[key]> : proj;
};

type SortData<ModelI> = { [key in keyof ModelI]?: -1 | 1 };

type ExecProj<ModelI, Proj extends Projection<ModelI>> = {
  [key in keyof ModelI & keyof Proj]: Proj[key] extends Record<any, any> ? ExecProj<ModelI[key], Proj[key]> : ModelI[key];
} & {
  _id: string;
};

type Group<ModelI> = {
  _id: null | `$${keyof ModelI & string}`;
} & { [key: string]: `$${keyof ModelI & string}` };

export interface AggI<ModelI, AllDBI extends Record<string, any>> {
  pipe: PipelineStage[];

  paginate: (skip: number, limit: number) => Promise<{ data: ModelI[]; total: number; skip: number; limit: number }>;

  sort: (sortData: SortData<ModelI>) => AggI<ModelI, AllDBI>;

  addFields: <Proj extends AddFields<ModelI>>(
    p: Proj
  ) => AggI<
    ModelI & {
      [key in keyof Proj]: Proj[key] extends AddDate<ModelI>
        ? number
        : Proj[key] extends AddAssign<ModelI> & { $assign: `$${infer Path}` }
        ? ValueFromFlatPath<ModelI, Path>
        : Proj[key];
    },
    AllDBI
  >;

  project: <Proj extends Projection<ModelI>>(
    p: Proj
  ) => AggI<
    // Could have written directly ExecProj<ModelI, Proj> but did this not for fun but for VSCode interface readibility
    {
      [key in keyof ModelI & keyof Proj]: Proj[key] extends Record<any, any>
        ? {
            [key2 in keyof ModelI[key] & keyof Proj[key]]: Proj[key][key2] extends Record<any, any>
              ? ExecProj<ModelI[key][key2], Proj[key][key2]>
              : ModelI[key][key2];
          } & {
            _id: string;
          }
        : ModelI[key];
    } & {
      _id: string;
    },
    AllDBI
  >;

  match: <MP extends Filter<ModelI>>(match: MP) => AggI<ModelI, AllDBI>;

  limit: (limit: number) => AggI<ModelI, AllDBI>;

  unset: <UN extends Array<keyof ModelI> | keyof ModelI>(
    unsetP: UN
  ) => AggI<{ [key in Exclude<keyof ModelI, UN extends Array<any> ? UN[number] : UN>]: ModelI[key] }, AllDBI>;

  group: <G extends Group<ModelI>>(
    p: G
  ) => AggI<
    {
      [key in keyof G]: G[key] extends `$${infer KeyFromModel}`
        ? KeyFromModel extends keyof ModelI
          ? ModelI[KeyFromModel]
          : never
        : never;
    },
    AllDBI
  >;

  lookup: <
    Let extends Record<string, `$${keyof ModelI extends string ? keyof ModelI : never}`>,
    From extends keyof AllDBI & string,
    NewModel,
    AS extends string = From
  >(
    p1: {
      from: From;
      //from: Plurial<From>;
      as: AS;
      let?: Let;
    },
    p2: (
      p1: AggI<AllDBI[From], AllDBI>,
      p2: {
        [key in keyof Let]: `$$${key extends string ? key : never}`;
      }
    ) => AggI<NewModel, AllDBI>
  ) => AggI<ModelI & { [P in AS]: NewModel[] }, AllDBI>;

  unwind: <
    KeyOfArrayToUnwind extends keyof ModelI & KeysWithValsOfType<ModelI, Array<any>>,
    PreserveNull extends boolean = false
  >(p: {
    path: `$${KeyOfArrayToUnwind extends string ? KeyOfArrayToUnwind : never}`;
    preserveNullAndEmptyArrays?: PreserveNull;
  }) => AggI<
    {
      [key in keyof ModelI]: key extends KeyOfArrayToUnwind
        ? ModelI[key] extends Array<infer Type>
          ? PreserveNull extends true
            ? Type | undefined
            : Type
          : never
        : ModelI[key];
    },
    AllDBI
  >;
}

// { [key: string]: { [key in dateOperator]: `$${KeysWithValsOfType<ModelI, Date>}` } };

// type ProjectionParam<P, ModelI> = P & StrictPropertyCheck<P, Projection<ModelI>, 'Only property of the model are allowed'>;

// type Match<ModelI> = Filter<ModelI> & { $expr?: { $eq?: [`$${keyof ModelI extends string ? keyof ModelI : never}`, any] } };
// type MatchParam<M, ModelI> = M & StrictPropertyCheck<M, Match<ModelI>, 'Only property of the model are allowed'>;
