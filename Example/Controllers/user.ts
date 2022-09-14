import { Controller, apply, handler, httpError } from 'bridgets';
import { z } from 'zod';
import { DB, DBZod } from '../DB';

const ZO = z.object;
const { _id, name, email, avatar } = DBZod.user;

let t = ZO({ _id });

export class User extends Controller {
  hello = this.handler({ resolve: () => 'Hello' as const });

  create = this.handler({
    body: ZO({ name, email, avatar: avatar.optional() }),
    resolve: ({ body }) => DB.user.create(body),
  });

  findOne = this.handler({
    body: ZO({ _id }),
    resolve: async ({ body }) => DB.user.findOne({ list: '' }, { proj: { name: 1 } }),
  });

  exists = this.handler({
    query: ZO({ _id }),
    resolve: ({ query }) => DB.user.exists(query),
  });

  count = this.handler({
    query: ZO({ _id }),
    resolve: async ({ query }) => DB.user.count(query),
  });

  updateOne = this.handler({
    query: ZO({ _id }),
    body: ZO({ event: z.boolean() }),
    resolve: async ({ query, body }) =>
      DB.user.updateOne(query, { emailPreferences: body }, { proj: { name: 1, email: 1 } }),
  });

  deleteOne = this.handler({
    query: ZO({ _id }),
    resolve: async ({ query }) => DB.user.deleteOne(query),
  });

  getPage = this.handler({
    query: ZO({ name: name.optional(), email: email.optional() }),
    resolve: async ({ query }) => {
      const res = await DB.user
        .aggregate()
        .project({ name: 1, email: 1, age: 1, createdAt: 1 })
        .addFields({ ddd: { $dayOfMonth: 'createdAt' } })
        .match({ ddd: 90 })
        // .match(query || {})
        // .lookup(
        //   { from: 'publication', as: 'yo', let: { userId: '$_id' } },
        //   (pub, { userId }) => pub.match({ $expr: { $eq: ['$user', userId] } }).project({ text: 1 })
        //   //pub.match({ $expr: { $eq: ['$user', userId] } }).project({ text: 1 })
        //   // pub.match({$expr: {$eq: [""]}})
        // )
        // .unwind({ path: '$yo', preserveNullAndEmptyArrays: false })
        // .project({ name: 1, age: 1, yo: { text: 1 } })
        // .limit(1)
        // .unset('age')
        // .sort({ name: -1 })
        .paginate(0, 10);

      // res.data[0].yo.

      // const resBefore = await DB.user.mongoModel.aggregate([
      //   { $project: { name: 1, email: 1 } },
      //   { $match: query || {} },
      //   {
      //     $lookup: {
      //       from: '$publications',
      //       as: 'yo',
      //       let: { userId: '$_id' },
      //       pipeline: [{ $match: { $expr: { $eq: ['$user', '$$userId'] } } }, { $project: { text: 1, user: 1 } }],
      //     },
      //   },
      //   { $sort: { name: -1 } },
      //   {
      //     $facet: {
      //       metadata: [{ $count: 'total' }],
      //       data: [{ $skip: 0 }, { $limit: 10 }],
      //     },
      //   },
      // ]);

      return res;
    },
  });
}
