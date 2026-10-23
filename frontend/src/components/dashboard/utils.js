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

export const getPaginationPages = (currentPage, totalPages) => {
  const pages = [];
  const siblingCount = 1;

  pages.push(1);

  const left = Math.max(2, currentPage - siblingCount);
  const right = Math.min(totalPages - 1, currentPage + siblingCount);

  if (left > 2) {
    pages.push('ellipsis-left');
  }

  for (let page = left; page <= right; page++) {
    pages.push(page);
  }

  if (right < totalPages - 1) {
    pages.push('ellipsis-right');
  }

  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
};
