import { BridgeMongoModelI } from './types';
import { Aggregate } from './aggregate';
import { AggI } from './aggregate/type';
import { Model as MongoModel } from 'mongoose';

type BMMI<ModelI> = BridgeMongoModelI<ModelI>;

export class BridgeMongoModel<ModelI, DBI extends Record<string, any>> implements BMMI<ModelI> {
  private hasCreateListener = false;
  private hasUpdateListener = false;
  private hasDeleteListener = false;

  constructor(public mongoModel: MongoModel<ModelI>) {}

  private onCreate = async (data: ModelI) => {};
  private onUpdate = async (before: ModelI, after: ModelI) => {};
  private onDelete = async (data: ModelI) => {};

  public addCreateListener = (listener: (d: ModelI) => Promise<void>) => {
    this.hasCreateListener = true;
    this.onCreate = listener;
  };

  public addUpdateListener = (listener: (before: ModelI, after: ModelI) => Promise<void>) => {
    this.hasUpdateListener = true;
    this.onUpdate = listener;
  };

  public addDeleteListener = (listener: (d: ModelI) => Promise<void>) => {
    this.hasDeleteListener = true;
    this.onDelete = listener;
  };

  public aggregate = (): AggI<ModelI, DBI> => new Aggregate<ModelI, DBI>(this.mongoModel);

  public create: BMMI<ModelI>['create'] = async (data, opts) => {
    try {
      const options = opts?.session ? { session: opts.session } : {};
      const res: any = ((await this.mongoModel.create([data], options)) as any)[0].toJSON();

      this.hasCreateListener && this.onCreate(res);

      return res;
    } catch (err: any) {
      if (opts?.session) throw new Error('Rollback transaction');
      else if (err.code !== 11000) throw new Error('Error create mongo not handled: ', err);
      return { error: { status: 409, name: 'Already exists', data: err.keyValue } };
    }
  };

  public createMany: BMMI<ModelI>['createMany'] = async (data, opts) => {
    try {
      const options = opts?.session ? { session: opts.session } : {};
      const res: any = ((await this.mongoModel.create(data, options)) as any).map((obj: any) => obj.toJSON());

      this.hasCreateListener && res.forEach((obj: any) => this.onCreate(obj));

      return res;
    } catch (err: any) {
      if (opts?.session) throw new Error('Rollback transaction');
      console.error(err);
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
    const objectBeforeUpdate = this.hasUpdateListener ? await this.findOne(filter) : null;

    const options = opts?.session ? { session: opts.session, new: true } : { new: true };
    const promise = (this.mongoModel as any).findOneAndUpdate(filter, dataToUpdate, options);
    const res = opts?.proj ? await promise.select(opts?.proj).lean() : await promise.lean();

    if (!res && opts?.session) throw new Error('Rollback transaction');
    else if (!res) return { error: { status: 404, name: 'Document not found' } };

    this.hasUpdateListener &&
      objectBeforeUpdate &&
      !('error' in objectBeforeUpdate) &&
      this.onUpdate(objectBeforeUpdate, res);

    return res as any;
  };

  public updateMany: BMMI<ModelI>['updateMany'] = async (filter, dataToUpdate, opts) => {
    const listObjectBeforeUpdate = this.hasUpdateListener
      ? (
          await this.aggregate()
            .match(filter)
            .sort({ _id: 1 } as any)
            .paginate(0, 10000)
        ).data
      : [];

    const options = opts?.session ? { session: opts.session } : {};
    const res = await (this.mongoModel as any).updateMany(filter, dataToUpdate, options);

    const listObjectAfterUpdate = this.hasUpdateListener
      ? (
          await this.aggregate()
            .match(filter)
            .sort({ _id: 1 } as any)
            .paginate(0, 10000)
        ).data
      : [];

    res.modifiedCount !== 0 &&
      this.hasUpdateListener &&
      listObjectBeforeUpdate.forEach((obj, index) => this.onUpdate(obj, listObjectAfterUpdate[index]));

    return { modifiedCount: res.modifiedCount };
  };

  public exists: BMMI<ModelI>['exists'] = async (filter) => ({
    exists: (await this.mongoModel.exists(filter)) !== null,
  });

  public count: BMMI<ModelI>['count'] = async (filter) => ({
    total: await this.mongoModel.countDocuments(filter),
  });

  public deleteOne: BMMI<ModelI>['deleteOne'] = async (filter, opts) => {
    const objectBeforeDelete = this.hasDeleteListener ? await this.findOne(filter) : null;

    const options = opts?.session ? { session: opts.session } : {};
    const res: any = await this.mongoModel.deleteOne(filter, options);

    if (opts?.session && res.deletedCount === 0) throw new Error('Rollback transaction');

    this.hasDeleteListener && objectBeforeDelete && !('error' in objectBeforeDelete) && this.onDelete(objectBeforeDelete);

    return { deleted: res.deletedCount !== 0 };
  };

  public deleteMany: BMMI<ModelI>['deleteMany'] = async (filter, opts) => {
    const listObjectBeforeDelete = this.hasDeleteListener
      ? (await this.aggregate().match(filter).paginate(0, 10000)).data
      : [];

    const options = opts?.session ? { session: opts.session } : {};
    const res: any = await this.mongoModel.deleteMany(filter, options);

    res.deletedCount !== 0 && this.hasDeleteListener && listObjectBeforeDelete.forEach((obj) => this.onDelete(obj));

    return { deletedCount: res.deletedCount };
  };
}
