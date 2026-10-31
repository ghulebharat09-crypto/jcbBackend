import { Model } from 'sequelize';

/**
 * Sequelize hook or helper to format and standardize timestamps
 */
export const formatTimeHook = (instance: Model): void => {
  // Can ensure dates are normalized to ISO string if needed
  if (instance.dataValues.created_at && instance.dataValues.created_at instanceof Date) {
    // Keep date object intact for DB persistence, normalized in getters
  }
};

export const formatDateToStandardString = (date: Date | string | null | undefined): string | null => {
  if (!date) return null;
  const d = new Date(date);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

export default formatTimeHook;
