import { Schema, model, ObjectId } from 'mongoose';
import { DBTypes } from './type';
import { z, ZodType } from 'zod';
import { BridgeMongoModel } from '../../Lib/db';

type ZodSchema<T> = { [key in keyof T]-?: ZodType<T[key]> };

export const userZod: ZodSchema<DBTypes['user']> = {
  _id: z.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i),
  name: z.string(),
  email: z.string().email(),
  avatar: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
};

const userSchema = new Schema<DBTypes['user']>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    avatar: String,
  },
  { timestamps: true }
);

// const hh: Partial<DBTypes['user']> = { _id: '', kkk: '' };

export const userModel = model<DBTypes['user']>('User', userSchema);

export const userBModel = new BridgeMongoModel<DBTypes, DBTypes['user']>(userModel);
