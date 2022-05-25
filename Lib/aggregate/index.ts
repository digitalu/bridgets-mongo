import { Model as MongoModel, PipelineStage } from 'mongoose';
import { AggI } from './type';

export class Aggregate<AllDBI, ModelI> implements AggI<AllDBI, ModelI> {
  constructor(
    private mongoModel: MongoModel<ModelI>,
    public pipe: PipelineStage[] = [
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [{ $skip: 0 }, { $limit: 10 }],
        },
      },
    ]
  ) {}

  public project: AggI<AllDBI, ModelI>['project'] = (proj) => {
    return new Aggregate(this.mongoModel, [{ $project: proj }, ...this.pipe]) as any;
  };

  public lookup: AggI<AllDBI, ModelI>['lookup'] = () => {
    return {} as any;
  };

  public unwind: AggI<AllDBI, ModelI>['unwind'] = () => {
    return {} as any;
  };

  public match: AggI<AllDBI, ModelI>['match'] = () => {
    return {} as any;
  };

  public exec = async (): Promise<ModelI[]> => {
    const res: any = await this.mongoModel.aggregate(this.pipe);
    // console.log(res[0]);
    return res[0].data;
  };
}
