import routes from './routes';
import express from 'express';
import { createExpressMiddleware, onError } from 'bridgets';
import { api } from './Config';
import mongoose from 'mongoose';

const app = express();

const errorHandler = onError(({ error, path }) => {
  if (error.name === 'Internal server error') console.log(path, error); // Send to bug reporting
});

app.use('', (req, res, next) => {
  console.log(req.path);
  next();
});

app.use('', createExpressMiddleware(routes, errorHandler));

async function startServer() {
  await mongoose.connect(api.mongoose.url);

  app.listen(api.port, () =>
    console.log(`Server listening on port ${api.port}, project: ${api.projectName}, mode: ${api.env}`)
  );
}

startServer();
