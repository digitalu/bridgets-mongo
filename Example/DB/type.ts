import { ObjectId } from 'mongoose';

export type DBTypes = {
  user: {
    _id: ObjectId;
    name: string;
    email: string;
    avatar?: string;
    age?: number;
    emailPreferences?: {
      event: boolean;
    };
    list?: Array<string>;
    createdAt: Date;
    updatedAt: Date;
  };
  publication: {
    _id: ObjectId;
    text: string;
    user: ObjectId;
    createdAt: Date;
    updatedAt: Date;
  };
};
