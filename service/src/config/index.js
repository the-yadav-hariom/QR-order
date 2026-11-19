import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
  port: process.env.PORT || 5000,
  dataFile: path.resolve(__dirname, '../../data/db.json'),
  clientDistDir: path.resolve(__dirname, '../../../client/dist'),
  env: process.env.NODE_ENV || 'development',
};
