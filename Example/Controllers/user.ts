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
    resolve: async ({ query, body }) => DB.user.updateOne(query, {}, { name: 1, email: 1 }),
  });

  deleteOne = this.handler({
    query: ZO({ _id }),
    resolve: async ({ query }) => {
      // query
      const j = { _id: 'string', jj: 'string' };
      return DB.user.deleteOne(query);
    },
  });

  getPage = this.handler({
    resolve: async () => {
      const res = await DB.user.aggregate
        .project({ name: 1, email: 1 })
        .lookup({ from: 'publication', let: { userId: '_id' } }, (pub, { userId }) => pub)
        .paginate(0, 10);

      // const test = await DB.publication.create({text: "", user: ""})

      return res;
    },
  });
}
