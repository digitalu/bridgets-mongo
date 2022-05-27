import { Model as MongoModel, PipelineStage } from 'mongoose';
import { AggI } from './type';

export class Aggregate<ModelI, AllDBI> implements AggI<ModelI, AllDBI> {
  constructor(private mongoModel: MongoModel<ModelI>, public pipe: PipelineStage[] = []) {}

  public project: AggI<ModelI, AllDBI>['project'] = (proj) => {
    return new Aggregate(this.mongoModel, [{ $project: proj }, ...this.pipe]) as any;
  };

  public paginate: AggI<ModelI, AllDBI>['paginate'] = async (skip, limit) => {
    this.pipe.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    });

    const res: any = await this.mongoModel.aggregate(this.pipe);

    this.pipe = [];

    return {
      data: res[0].data,
      total: res[0].metadata[0].total,
      skip,
      limit,
    };
  };

  public lookup: AggI<ModelI, AllDBI>['lookup'] = () => {
    return {} as any;
  };

  public unwind: AggI<ModelI, AllDBI>['unwind'] = () => {
    return {} as any;
  };

  public match: AggI<ModelI, AllDBI>['match'] = () => {
    return {} as any;
  };

  // public exec = async (): Promise<ModelI[]> => {
  //   const res: any = await this.mongoModel.aggregate(this.pipe);
  //   // console.log(res[0]);
  //   return res[0];
  // };
}
