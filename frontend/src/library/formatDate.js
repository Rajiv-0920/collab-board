export const formatDate = (mongoDateStr) => {
  if (!mongoDateStr) return '';

  const date = new Date(mongoDateStr);

  const formatted = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);

  return formatted.replace('Sep', 'Sept');
};
