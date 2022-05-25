import { sayHello } from '../Lib';
import { User } from './Controllers';
import express from 'express';
import { createExpressMiddleware, onError } from 'bridgets';
import { api } from './Config';
import mongoose from 'mongoose';

const routes = { user: new User() };

const app = express();

const errorHandler = onError(({ error, path }) => {
  if (error.name === 'Internal server error') console.log(error); // Send to bug reporting
  // else console.log(error);
});

app.use('', createExpressMiddleware(routes, errorHandler));

app.listen(api.port, async () => {
  await mongoose.connect(api.mongoose.url);

  // await DB.user.create({ name: 'Nab', email: 'nabil@digitalu.be' });

  console.log(`Server listening on port ${api.port}, project: ${api.projectName}, mode: ${api.env}`);
});
