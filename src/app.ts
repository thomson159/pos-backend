import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import { RegisterRoutes } from './routes-tsoa/routes';
import { ValidateError } from '@tsoa/runtime';
import { validationFailed } from './helpers/validators';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

swaggerSpec.security = [{ bearerAuth: [] }];

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// app.use(
//   cors({
//     origin: 'http://localhost:5000',
//   }),
// );

RegisterRoutes(app);

// tsoa error handler response
app.use(function (err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ValidateError) {
    return res.status(400).json({
      success: false,
      message: validationFailed,
      details: err.fields,
    });
  }
  next(err);
});

app.use(errorHandler);

export default app;
