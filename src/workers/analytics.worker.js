import { analyticsQueue } from '../config/queue.js';
import { aggregateDailyUsage } from '../services/analytics.service.js';
import { config } from '../config/env.js';

// Process daily analytics aggregation
analyticsQueue.process('daily-aggregation', async (job) => {
  try {
    const results = await aggregateDailyUsage();
    return {
      success: true,
      companiesProcessed: results.companiesProcessed,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw error;
  }
});

analyticsQueue.add('daily-aggregation', {}, { repeat: { cron: '0 0 * * *' } });

if (config.nodeEnv === 'development') {
  console.log('✅ Analytics worker started (daily midnight)');
}
