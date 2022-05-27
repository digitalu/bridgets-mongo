import { userZod, userDB } from './user';
import { publicationZod, publicationDB } from './publication';

export const DBZod = {
  user: userZod,
  publication: publicationZod,
};

export const DB = {
  user: userDB,
  publication: publicationDB,
};
