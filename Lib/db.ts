import { BridgeMongoModelI } from './types';
import { Aggregate } from './aggregate';
import { AggI } from './aggregate/type';
import { Model as MongoModel } from 'mongoose';

type BMMI<ModelI> = BridgeMongoModelI<ModelI>;

export class BridgeMongoModel<ModelI, DBI extends Record<string, any>> implements BMMI<ModelI> {
  constructor(public mongoModel: MongoModel<ModelI>) {}

  public aggregate = (): AggI<ModelI, DBI> => new Aggregate<ModelI, DBI>(this.mongoModel);

  public create: BMMI<ModelI>['create'] = async (data, opts) => {
    try {
      if (!('length' in data)) data = [data];
      const options = opts?.session ? { session: opts.session } : {};
      const res: any = ((await this.mongoModel.create(data), options) as any).toJSON();
      delete res.__v;
      return res;
    } catch (err: any) {
      if (opts?.session) throw new Error('Rollback transaction');
      else if (err.code !== 11000) throw new Error('Error create mongo not handled: ', err);
      return { error: { status: 409, name: 'Already exists', data: err.keyValue } };
    }
  };

  public findOne: BMMI<ModelI>['findOne'] = async (filter, opts) => {
    const options = opts?.session ? { session: opts.session } : {};
    const promise = this.mongoModel.findOne(filter, options);
    const res = opts?.proj ? await promise.select(opts?.proj).lean() : await promise.lean();

    if (!res && opts?.session) throw new Error('Rollback transaction');
    else if (!res) return { error: { status: 404, name: 'Document not found' } };

    return res as any;
  };

  public updateOne: BMMI<ModelI>['updateOne'] = async (filter, dataToUpdate, opts) => {
    const options = opts?.session ? { session: opts.session, new: true } : { new: true };
    const promise = (this.mongoModel as any).findOneAndUpdate(filter, dataToUpdate, options);
    const res = opts?.proj ? await promise.select(opts?.proj).lean() : await promise.lean();

    if (!res && opts?.session) throw new Error('Rollback transaction');
    else if (!res) return { error: { status: 404, name: 'Document not found' } };

    return res as any;
  };

  // public updateMany: BMMI<ModelI>['updateMany'] = async (filter, dataToUpdate, opts) => {
  //   const options = opts?.session ? { session: opts.session, new: true } : { new: true };
  //   const promise = (this.mongoModel as any).findOneAndUpdate(filter, dataToUpdate, options);
  //   const res = proj ? await promise.select(proj).lean() : await promise.lean();

  //   if (!res && opts?.session) throw new Error('Rollback transaction');
  //   else if (!res) return { error: { status: 404, name: 'Document not found' } };

  //   return res as any;
  // };

  public exists: BMMI<ModelI>['exists'] = async (filter) => ({
    exists: (await this.mongoModel.exists(filter)) !== null,
  });

  public count: BMMI<ModelI>['count'] = async (filter) => ({
    total: await this.mongoModel.countDocuments(filter),
  });

  public deleteOne: BMMI<ModelI>['deleteOne'] = async (filter, opts) => {
    const options = opts?.session ? { session: opts.session } : {};
    const res: any = await this.mongoModel.deleteOne(filter, options);

    if (opts?.session && res.deletedCount === 0) throw new Error('Rollback transaction');

    return { deleted: res.deletedCount !== 0 };
  };

  public deleteMany: BMMI<ModelI>['deleteMany'] = async (filter, opts) => {
    const options = opts?.session ? { session: opts.session } : {};
    const res: any = await this.mongoModel.deleteOne(filter, options);

    return { deletedCount: res.deletedCount };
  };
}
