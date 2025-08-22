import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
// import authRoutes from './routes/auth.routes';
// import productRoutes from './routes/product.routes';
// import orderRoutes from './routes/order.routes';
import { errorHandler } from './middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import { RegisterRoutes } from './routes-tsoa/routes';
// import { authenticate } from './middleware/auth';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// app.use('/api/auth', authRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/orders', orderRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// app.use(authenticate);
RegisterRoutes(app);
app.use(errorHandler);

export default app;
