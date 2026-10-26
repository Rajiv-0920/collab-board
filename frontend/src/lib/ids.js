export const getId = (value) => String(value?._id ?? value?.id ?? value ?? '');
