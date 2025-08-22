import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import { RegisterRoutes } from './routes-tsoa/routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

RegisterRoutes(app);

app.use(errorHandler);

export default app;
