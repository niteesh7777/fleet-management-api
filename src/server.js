/* eslint-disable no-undef */
import app from './app.js';
import { config } from './config/env.js';
import connectDB, { closeConnection } from './config/db.js';
import { initializeSocket } from './config/socket.js';
import { closeQueues } from './config/queue.js';

// Initialize background workers
import './workers/index.js';

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(config.port, () => {
      console.log(`Server listening on port ${config.port}`);
    });

    // Initialize Socket.IO for real-time fleet tracking
    const io = initializeSocket(server);

    // Make Socket.IO instance available to controllers
    app.set('io', io);

    const shutdown = async () => {
      console.log('SIGTERM received: closing server');
      server.close(async () => {
        console.log('HTTP server closed');
        await closeQueues();
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
