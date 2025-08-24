import app from './app';
import { config } from './config/env';

const PORT = Number(config.port) || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
