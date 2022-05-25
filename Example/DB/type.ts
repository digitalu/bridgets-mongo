export type DBTypes = {
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
  };
};
