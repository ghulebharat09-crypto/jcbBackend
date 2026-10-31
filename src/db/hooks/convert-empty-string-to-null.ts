import { Model } from 'sequelize';

/**
 * Sequelize hook that sanitizes empty strings to null for all string attributes before save/validation
 */
export const convertEmptyStringToNull = (instance: Model): void => {
  const attributes = instance.dataValues;
  if (!attributes) return;

  for (const key of Object.keys(attributes)) {
    if (typeof attributes[key] === 'string' && attributes[key].trim() === '') {
      instance.setDataValue(key, null as any);
    }
  }
};

export default convertEmptyStringToNull;
