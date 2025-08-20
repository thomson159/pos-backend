import { readFileSync } from 'fs';
import path from 'path';

const swaggerFilePath = path.resolve(__dirname, '../docs/swagger.json');

const swaggerSpec = JSON.parse(readFileSync(swaggerFilePath, 'utf-8'));

export default swaggerSpec;
