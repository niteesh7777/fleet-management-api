import { emailQueue } from '../config/queue.js';
import { sendEmail } from '../services/email.service.js';
import { config } from '../config/env.js';

// Email job processor
emailQueue.process(async (job) => {
  const { type, to, data, companyId } = job.data;
  try {
    await sendEmail(type, to, data, companyId);
    return { success: true, type, to };
  } catch (error) {
    throw error;
  }
});

if (config.nodeEnv === 'development') {
  console.log('✅ Email worker started');
}
