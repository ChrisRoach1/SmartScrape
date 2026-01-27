import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

crons.monthly(
  'Monthly competitor run',
  { day: 1, hourUTC: 16, minuteUTC: 0 }, // Every month on the first day at 8:00am PST
  internal.competitor.executeScan,
  { scanFrequency: 'm' },
);

crons.weekly('Weekly competitor run', { dayOfWeek: 'monday', hourUTC: 14, minuteUTC: 30 }, internal.competitor.executeScan, {
  scanFrequency: 'w',
});

export default crons;
