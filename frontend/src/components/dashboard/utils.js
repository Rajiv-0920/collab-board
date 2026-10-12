const relativeFormatter = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto',
});

const RELATIVE_UNITS = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
];

export const getInitials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || '?';

export const pluralize = (count, singular) =>
  `${count} ${count === 1 ? singular : `${singular}s`}`;

export const timeAgo = (date) => {
  const parsed = date ? new Date(date) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return 'Recently';

  const seconds = Math.round((parsed.getTime() - Date.now()) / 1000);

  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= size) {
      return relativeFormatter.format(Math.round(seconds / size), unit);
    }
  }
  return 'Just now';
};
