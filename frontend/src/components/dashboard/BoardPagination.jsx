import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { getPaginationPages } from './utils';

function BoardPagination({
  currentPage,
  hasPrevPage,
  hasNextPage,
  totalPages,
  onPageChange,
}) {
  if (totalPages <= 1) return null;
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();

              if (currentPage > 1) {
                onPageChange(currentPage - 1);
              }
            }}
            aria-disabled={!hasPrevPage}
            className={
              !hasPrevPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'
            }
          />
        </PaginationItem>

        {getPaginationPages(currentPage, totalPages).map((page, index) => (
          <PaginationItem key={`${page}-${index}`}>
            {typeof page === 'string' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href="#"
                isActive={page === currentPage}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(page);
                }}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();

              if (currentPage < totalPages) {
                onPageChange(currentPage + 1);
              }
            }}
            aria-disabled={!hasNextPage}
            className={
              !hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export default BoardPagination;
