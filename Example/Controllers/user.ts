import { Controller, apply, handler, httpError } from 'bridgets';
import { z } from 'zod';
import { DB, DBZod } from '../DB';

const ZO = z.object;
const { _id, name, email, avatar } = DBZod.user;

export class User extends Controller {
  hello = this.handler({ resolve: () => 'Hello' as const });

  create = this.handler({
    body: ZO({ name, email, avatar: avatar.optional() }),
    resolve: ({ body }) => DB.user.create(body),
  });

  findOne = this.handler({
    body: ZO({ _id }),
    resolve: async ({ body }) => DB.user.findOne(body, { name: 1 }),
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
    query: ZO({ _id: _id }),
    body: ZO({ name: name }),
    resolve: async ({ query, body }) => DB.user.updateOne(query, body, { name: 1, email: 1 }),
  });

  deleteOne = this.handler({
    query: ZO({ _id, za: z.string() }),
    resolve: async ({ query }) => {
      // query
      // let j: { _id: string; jj: string } = query as any;
      return DB.user.deleteOne(query);
    },
  });

  getPage = this.handler({
    resolve: () => DB.user.aggregate.exec(),
  });
}
