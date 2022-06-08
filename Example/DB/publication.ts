import { Schema, model, PopulatedDoc } from 'mongoose';
import { DBTypes } from './type';
import { z, ZodType } from 'zod';
import { BridgeMongoModel } from '../../Lib';

type ZodSchema<T> = { [key in keyof T]-?: ZodType<T[key]> };

export const publicationZod: ZodSchema<DBTypes['publication']> = {
  _id: z.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i),
  text: z.string(),
  user: z.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i),
  createdAt: z.date(),
  updatedAt: z.date(),
};

const publicationSchema = new Schema<DBTypes['publication']>(
  {
    text: { type: String, required: true },
    user: Schema.Types.ObjectId,
  },
  { timestamps: true }
);

const publicationModel = model<DBTypes['publication']>('Publication', publicationSchema);

export const publicationDB = new BridgeMongoModel<DBTypes['publication'], DBTypes>(publicationModel);
