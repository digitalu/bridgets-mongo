import { userBModel, userZod } from './user';

export const DBZod = {
  user: userZod,
};

export const DB = {
  user: userBModel,
};
