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

export const timeAgo = (value, mode = 'past') => {
  if (value == null || value === '') {
    return mode === 'relative' ? 'Recently' : '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return mode === 'relative' ? 'Recently' : '';
  }

  const seconds =
    mode === 'relative'
      ? Math.round((date.getTime() - Date.now()) / 1000)
      : Math.round((Date.now() - date.getTime()) / 1000);

  if (mode === 'relative') {
    for (const [unit, size] of RELATIVE_UNITS) {
      if (Math.abs(seconds) >= size) {
        return relativeFormatter.format(Math.round(seconds / size), unit);
      }
    }

    return 'Just now';
  }

  const units = RELATIVE_UNITS.filter(([unit]) => unit !== 'week');

  for (const [unit, size] of units) {
    const count = Math.floor(seconds / size);

    if (count >= 1) {
      return `${count} ${unit}${count > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
};
