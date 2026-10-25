export const getErrorMessage = (error, fallback) =>
  error?.data?.message || error?.message || fallback;
