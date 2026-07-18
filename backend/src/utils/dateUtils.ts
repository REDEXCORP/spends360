export const getCurrentDate = (): Date => new Date();

export const getDateWithOffset = (minutes: number): Date => new Date(Date.now() + minutes * 60 * 1000);
