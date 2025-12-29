import Bull from 'bull';
import { config } from './env.js';

const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false';

let emailQueue, maintenanceQueue, analyticsQueue, notificationQueue;

if (REDIS_ENABLED) {
  try {
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    };

    const queueOptions = {
      redis: redisConfig,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    };

    emailQueue = new Bull('email', queueOptions);
    maintenanceQueue = new Bull('maintenance', queueOptions);
    analyticsQueue = new Bull('analytics', queueOptions);
    notificationQueue = new Bull('notification', queueOptions);

    console.log('✅ Redis queues initialized');
  } catch (error) {
    console.warn('⚠️  Redis unavailable, using mock queues:', error.message);
    REDIS_ENABLED = false;
  }
}

if (!REDIS_ENABLED) {
  // Mock queue for development without Redis
  const createMockQueue = (name) => ({
    add: async () => ({ id: Date.now() }),
    process: () => {},
    on: () => {},
    isReady: async () => true,
    close: async () => {},
  });

  emailQueue = createMockQueue('email');
  maintenanceQueue = createMockQueue('maintenance');
  analyticsQueue = createMockQueue('analytics');
  notificationQueue = createMockQueue('notification');
  console.log('ℹ️  Running without Redis - background jobs disabled');
}

export { emailQueue, maintenanceQueue, analyticsQueue, notificationQueue };
export const checkQueueHealth = async () => {
  if (!REDIS_ENABLED) return { healthy: true, message: 'Mock queues active' };
  try {
    await emailQueue.isReady();
    return { healthy: true, message: 'Queue system operational' };
  } catch (error) {
    return { healthy: false, message: error.message };
  }
};

export const closeQueues = async () => {
  if (!REDIS_ENABLED) return;
  console.log('Closing job queues...');
  await Promise.all([
    emailQueue.close(),
    maintenanceQueue.close(),
    analyticsQueue.close(),
    notificationQueue.close(),
  ]);
  console.log('✅ Job queues closed');
};

const setupQueueLogging = (queue, queueName) => {
  if (!REDIS_ENABLED || !queue.on) return;
  queue.on('error', (error) => console.error(`❌ ${queueName}:`, error.message));
  queue.on('failed', (job, err) => console.error(`❌ ${queueName} job ${job.id}:`, err.message));
  if (config.nodeEnv === 'development') {
    queue.on('completed', (job) => console.log(`✅ ${queueName} job ${job.id} done`));
  }
};

if (REDIS_ENABLED) {
  setupQueueLogging(emailQueue, 'Email');
  setupQueueLogging(maintenanceQueue, 'Maintenance');
  setupQueueLogging(analyticsQueue, 'Analytics');
  setupQueueLogging(notificationQueue, 'Notification');
}
