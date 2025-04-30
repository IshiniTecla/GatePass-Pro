import cron from 'node-cron';
import { checkAndUpdateHostStatuses } from '../controllers/hostController.js';

// Schedule to run every 5 minutes
const scheduleStatusUpdates = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('Running scheduled task: Checking host active statuses');
      const updatedCount = await checkAndUpdateHostStatuses();
      console.log(`Status check complete: ${updatedCount} host statuses updated to inactive`);
    } catch (error) {
      console.error('Error running scheduled host status check:', error);
    }
  });

  console.log('Host status update scheduler initialized');
};

export { scheduleStatusUpdates };
