import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import { RegisterRoutes } from './routes-tsoa/routes';
import { ValidateError } from '@tsoa/runtime';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

RegisterRoutes(app);

app.use(function (err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ValidateError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      details: err.fields,
    });
  }
  next(err);
});

app.use(errorHandler);

export default app;
