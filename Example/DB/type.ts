export type DBTypes = {
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    age?: number;
    list?: Array<string>;
    createdAt: Date;
    updatedAt: Date;
  };
  publication: {
    _id: string;
    text: string;
    user: string;
    createdAt: Date;
    updatedAt: Date;
  };
};
