import { Model as MongoModel, PipelineStage } from 'mongoose';
// @ts-ignore
import plural from 'pluralize';
import { AggI } from './type';

export class Aggregate<ModelI, AllDBI extends Record<string, any>> implements AggI<ModelI, AllDBI> {
  constructor(private mongoModel: MongoModel<ModelI> = {} as any, public pipe: PipelineStage[] = []) {}

  public project: AggI<ModelI, AllDBI>['project'] = (proj) =>
    new Aggregate(this.mongoModel, [...this.pipe, { $project: proj }]) as any;

  public addFields: AggI<ModelI, AllDBI>['addFields'] = (proj) => {
    const realProj: any = {};
    Object.entries(([key, value]: any) => {
      if (value.$assign) realProj[key] = value.$assign;
      else realProj[key] = value;
    });
    console.log(realProj);
    return new Aggregate(this.mongoModel, [...this.pipe, { $addFields: proj }]) as any;
  };

  public match: AggI<ModelI, AllDBI>['match'] = (match) =>
    new Aggregate(this.mongoModel, [...this.pipe, { $match: match }]) as any;

  public lookup: AggI<ModelI, AllDBI>['lookup'] = (lookupParam, aggregateMethod) => {
    let lookup: any = {
      from: plural(lookupParam.from),
      as: lookupParam.as,
    };

    if (lookupParam.let) lookup.let = lookupParam.let;

    let paramLookupAggregate: any = {};

    Object.keys(lookupParam.let || {}).forEach((key) => {
      paramLookupAggregate[key] = `$$${key}`;
    });

    lookup.pipeline = aggregateMethod(new Aggregate(), paramLookupAggregate).pipe;

    return new Aggregate(this.mongoModel, [...this.pipe, { $lookup: lookup }]) as any;
  };

  public group: AggI<ModelI, AllDBI>['group'] = (group) =>
    new Aggregate(this.mongoModel, [...this.pipe, { $group: group } as any]) as any;

  public unset: AggI<ModelI, AllDBI>['unset'] = (unset) =>
    new Aggregate(this.mongoModel, [...this.pipe, { $unset: unset } as any]) as any;

  public limit: AggI<ModelI, AllDBI>['limit'] = (limit) =>
    new Aggregate(this.mongoModel, [...this.pipe, { $limit: limit } as any]) as any;

  public unwind: AggI<ModelI, AllDBI>['unwind'] = (unwind) =>
    new Aggregate(this.mongoModel, [...this.pipe, { $unwind: unwind } as any]) as any;

  public sort: AggI<ModelI, AllDBI>['sort'] = (sortData) =>
    new Aggregate(this.mongoModel, [...this.pipe, { $sort: sortData } as any]) as any;

  public paginate: AggI<ModelI, AllDBI>['paginate'] = async (skip, limit) => {
    this.pipe.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    });

    const res = await this.mongoModel.aggregate(this.pipe);

    return {
      data: res[0].data,
      total: res[0].metadata[0]?.total || 0,
      skip,
      limit,
    };
  };
}
