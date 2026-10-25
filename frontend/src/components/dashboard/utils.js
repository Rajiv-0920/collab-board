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
