import { Controller, apply, handler, httpError } from 'bridgets';
import { z } from 'zod';
import { DB, DBZod } from '../DB';

const ZO = z.object;

const { _id, text, user } = DBZod.publication;

// const ah = ZO({ text, user })

export class Publication extends Controller {
  create = this.handler({
    body: ZO({ text, user }),
    resolve: ({ body }) => DB.publication.create(body),
  });
}
