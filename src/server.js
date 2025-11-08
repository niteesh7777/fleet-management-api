/* eslint-disable no-undef */
import app from './app.js';
import { config } from './config/env.js';
import connectDB, { closeConnection } from './config/db.js';

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(config.port, () => {
      console.log(`Server listening on port ${config.port}`);
    });

    const shutdown = async () => {
      console.log('SIGTERM received: closing server');
      server.close(async () => {
        console.log('HTTP server closed');
        await closeConnection();
        console.log('Mongo connection closed');
        process.exit(0);
      });

      setTimeout(() => {
        console.error('Forcing shutdown');
        process.exit(1);
      }, 10_000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
};
startServer();
