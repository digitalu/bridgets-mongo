import { BridgeMongoModelI } from './types';
import { Aggregate } from './aggregate';
import { Model as MongoModel } from 'mongoose';

type BMMI<ModelI> = BridgeMongoModelI<ModelI>;

export class BridgeMongoModel<DBI, ModelI> implements BMMI<ModelI> {
  public aggregate: Aggregate<DBI, ModelI>;

  constructor(private mongoModel: MongoModel<ModelI>) {
    this.aggregate = new Aggregate(this.mongoModel);
  }

  public create: BMMI<ModelI>['create'] = async (data) => {
    const res: any = ((await this.mongoModel.create(data)) as any).toJSON();
    delete res.__v;
    return res;
  };

  public findOne: BMMI<ModelI>['findOne'] = async (filter, proj) => {
    const promise = this.mongoModel.findOne(filter);
    const res = proj ? await promise.select(proj).lean() : await promise.lean();

    if (!res) return { error: { status: 404, name: 'Document not found' } };

    return res as any;
  };

  public updateOne: BMMI<ModelI>['updateOne'] = async (filter, dataToUpdate, proj) => {
    const promise = (this.mongoModel as any).findOneAndUpdate(filter, dataToUpdate, { new: true });
    const res = proj ? await promise.select(proj).lean() : await promise.lean();

    if (!res) return { error: { status: 404, name: 'Document not found' } };

    return res as any;
  };

  public exists: BMMI<ModelI>['exists'] = async (filter) => ({
    exists: (await this.mongoModel.exists(filter)) !== null,
  });

  public count: BMMI<ModelI>['count'] = async (filter) => ({
    total: await this.mongoModel.countDocuments(filter),
  });

  public deleteOne: BMMI<ModelI>['deleteOne'] = async (filter) => {
    const res: any = await this.mongoModel.deleteOne(filter);

    return { deleted: res.deletedCount !== 0 } as any;
  };
}
