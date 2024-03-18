import { getEnvVar } from './environment-utils';
import { MaintenanceScheduleItemKey } from '@europeana/metis-ui-maintenance-utils';

export const maintenanceSettings = {
  pollInterval: 60000,
  maintenanceScheduleUrl: getEnvVar('maintenanceScheduleUrl') || '',
  maintenanceScheduleKey: (getEnvVar('maintenanceScheduleKey') ||
    '') as MaintenanceScheduleItemKey,
  maintenanceItem: {
    maintenanceMessage: ''
  }
};
