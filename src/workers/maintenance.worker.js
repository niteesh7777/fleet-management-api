import { maintenanceQueue, emailQueue } from '../config/queue.js';
import { checkMaintenanceReminders } from '../services/maintenance.service.js';
import { config } from '../config/env.js';

// Process maintenance reminders
maintenanceQueue.process('check-reminders', async (job) => {
  try {
    const reminders = await checkMaintenanceReminders();
    for (const reminder of reminders) {
      await emailQueue.add('send-email', {
        type: 'maintenance-reminder',
        to: reminder.ownerEmail,
        data: {
          vehicleNo: reminder.vehicleNo,
          maintenanceType: reminder.maintenanceType,
          dueDate: reminder.dueDate,
          currentMileage: reminder.currentMileage,
        },
        companyId: reminder.companyId,
      });
    }
    return {
      success: true,
      remindersProcessed: reminders.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw error;
  }
});

maintenanceQueue.add('check-reminders', {}, { repeat: { cron: '0 9 * * *' } });

if (config.nodeEnv === 'development') {
  console.log('✅ Maintenance worker started (daily 9 AM)');
}
